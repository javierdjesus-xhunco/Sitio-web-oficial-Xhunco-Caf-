import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED = new Set([
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_ruta",
  "entregado",
  "cancelado",
]);

function getIdFromUrl(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null; // último segmento
  } catch {
    return null;
  }
}

export async function PATCH(req, ctx) {
  const supabase = await supabaseServer();

  // ✅ 1) Intenta por params (lo normal)
  const idFromParams = ctx?.params?.id;

  // ✅ 2) Fallback: extrae del URL (si params viene undefined)
  const id = idFromParams || getIdFromUrl(req);

  if (!id) {
    return NextResponse.json(
      { error: "Falta id", debug: { params: ctx?.params ?? null, url: req.url } },
      { status: 400 }
    );
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
  if (!["admin", "superadmin"].includes(prof.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const nextStatus = String(body?.status || "").trim();

  if (!ALLOWED.has(nextStatus)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  // ✅ 3) Leer status anterior + client_user_id (para notificar)
  const { data: order, error: ordErr } = await supabaseAdmin
    .from("orders")
    .select("id, status, client_user_id")
    .eq("id", id)
    .single();

  if (ordErr) return NextResponse.json({ error: ordErr.message }, { status: 400 });
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const prevStatus = String(order.status || "").trim();
  const clientUserId = order.client_user_id;

  // Si no cambia nada, no hacemos nada
  if (prevStatus === nextStatus) {
    return NextResponse.json({ ok: true, id, status: nextStatus, message: "Sin cambios" });
  }

  // ✅ 4) Actualizar status
  const { error: updErr } = await supabaseAdmin
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  // ✅ 4.1) 🔔 Notificar al CLIENTE cuando pasa a CONFIRMADO (solo 1 vez)
  if (nextStatus === "confirmado" && prevStatus !== "confirmado" && clientUserId) {
    try {
      const notif = {
        recipient_user_id: clientUserId,
        recipient_role: "cliente",
        type: "order_confirmed",
        title: "Tu pedido fue confirmado",
        body: `Tu pedido ${id} fue confirmado. En breve seguimos con la preparación.`,
        url: `/portal/cliente/pedidos/${id}`,
        is_read: false,
      };

      const { error: nErr } = await supabaseAdmin.from("notifications").insert([notif]);
      if (nErr) console.error("Error insert order_confirmed notification:", nErr);

      // 📧 (Opcional) correo al cliente si ya tienes /api/notify/email
      /*
      const { data: clientProf } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", clientUserId)
        .single();

      const clientEmail = clientProf?.email;
      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
      if (clientEmail && origin) {
        fetch(`${origin}/api/notify/email`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            to: [clientEmail],
            subject: "Xhunco: Tu pedido fue confirmado",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.4;">
                <h2>Tu pedido fue confirmado ✅</h2>
                <p>Pedido: <b>${id}</b></p>
                <p>En breve continuamos con la preparación.</p>
              </div>
            `,
          }),
        }).catch((e) => console.error("email send error:", e));
      }
      */
    } catch (e) {
      console.error("Error notifying client on confirmado:", e);
      // NO tumbamos el PATCH por falla de notificación
    }
  }

  // ✅ 5) Si se cancela (y antes NO estaba cancelado), reponer stock
  if (nextStatus === "cancelado" && prevStatus !== "cancelado") {
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .select("suministro_id, qty")
      .eq("order_id", id);

    if (itemsErr) {
      return NextResponse.json(
        { error: `Status actualizado pero no se pudo leer order_items: ${itemsErr.message}` },
        { status: 400 }
      );
    }

    // Agrupar por suministro_id (por si hay duplicados)
    const agg = new Map();
    for (const it of items || []) {
      const suministroId = it?.suministro_id;
      const qty = Math.max(0, Number(it?.qty || 0));
      if (!suministroId || qty <= 0) continue;
      agg.set(suministroId, (agg.get(suministroId) || 0) + qty);
    }

    // Reponer stock: stock = stock + qty
    for (const [suministro_id, qty] of agg.entries()) {
      const { data: prod, error: prodErr } = await supabaseAdmin
        .from("suministros_xhunco")
        .select("id, stock")
        .eq("id", suministro_id)
        .single();

      if (prodErr) {
        return NextResponse.json(
          { error: `Pedido cancelado pero no se pudo leer stock (${suministro_id}): ${prodErr.message}` },
          { status: 400 }
        );
      }

      const current = Math.max(0, Number(prod?.stock || 0));
      const nextStock = current + qty;

      const { error: stockUpdErr } = await supabaseAdmin
        .from("suministros_xhunco")
        .update({ stock: nextStock })
        .eq("id", suministro_id);

      if (stockUpdErr) {
        return NextResponse.json(
          { error: `Pedido cancelado pero no se pudo reponer stock (${suministro_id}): ${stockUpdErr.message}` },
          { status: 400 }
        );
      }
    }
  }

  return NextResponse.json({ ok: true, id, status: nextStatus });
}
