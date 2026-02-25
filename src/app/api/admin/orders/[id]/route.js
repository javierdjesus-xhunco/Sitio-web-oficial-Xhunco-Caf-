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

// ✅ AGREGADO: normaliza variantes “humanas” a canonical con underscore
function normalizeStatus(input) {
  const s = String(input || "").trim().toLowerCase();

  if (!s) return "";

  // variantes comunes
  if (s === "en preparación" || s === "en preparacion") return "en_preparacion";
  if (s === "en ruta") return "en_ruta";

  return s;
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

  // ✅ admin / superadmin / super_admin
  if (!["admin", "superadmin", "super_admin"].includes(String(prof.role || "").trim())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  // ✅ Normaliza
  const nextStatus = normalizeStatus(body?.status);

  if (!ALLOWED.has(nextStatus)) {
    return NextResponse.json({ error: "Status inválido", received: nextStatus }, { status: 400 });
  }

  // ✅ 3) Leer status anterior + client_user_id (para notificar)
  const { data: order, error: ordErr } = await supabaseAdmin
    .from("orders")
    .select("id, status, client_user_id")
    .eq("id", id)
    .single();

  if (ordErr) return NextResponse.json({ error: ordErr.message }, { status: 400 });
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const prevStatus = normalizeStatus(order.status);
  const clientUserId = order.client_user_id;

  // Si no cambia nada, no hacemos nada
  if (prevStatus === nextStatus) {
    return NextResponse.json({ ok: true, id, status: nextStatus, message: "Sin cambios" });
  }

  // ✅ 4) Actualizar status (guardar canonical)
  const { error: updErr } = await supabaseAdmin
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  // ✅ 4.0) AUDITORÍA (no rompe si falla)
  try {
    await supabaseAdmin.from("order_status_logs").insert([
      {
        order_id: id,
        changed_by: auth.user.id,
        from_status: prevStatus || null,
        to_status: nextStatus,
      },
    ]);
  } catch (e) {
    console.error("order_status_logs insert failed:", e);
  }

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

      // 📧 (Opcional) correo...
    } catch (e) {
      console.error("Error notifying client on confirmado:", e);
    }
  }

  // ✅ 5) Si se cancela (y antes NO estaba cancelado), reponer stock (OPTIMIZADO)
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

    const ids = Array.from(agg.keys());
    if (ids.length > 0) {
      // ✅ OPTIMIZADO: 1 sola lectura de todos los productos
      const { data: prods, error: prodsErr } = await supabaseAdmin
        .from("suministros_xhunco")
        .select("id, stock")
        .in("id", ids);

      if (prodsErr) {
        return NextResponse.json(
          { error: `Pedido cancelado pero no se pudo leer suministros: ${prodsErr.message}` },
          { status: 400 }
        );
      }

      const stockById = new Map((prods || []).map((p) => [p.id, Math.max(0, Number(p.stock || 0))]));

      // ✅ OPTIMIZADO: updates en paralelo (más rápido)
      const updates = ids.map(async (suministro_id) => {
        const current = stockById.get(suministro_id);
        if (current == null) {
          console.error("Stock restore: suministro no encontrado:", suministro_id);
          return;
        }

        const qty = agg.get(suministro_id) || 0;
        const nextStock = Math.max(0, Number(current) + Number(qty));

        const { error: stockUpdErr } = await supabaseAdmin
          .from("suministros_xhunco")
          .update({ stock: nextStock })
          .eq("id", suministro_id);

        if (stockUpdErr) {
          throw new Error(`No se pudo reponer stock (${suministro_id}): ${stockUpdErr.message}`);
        }
      });

      try {
        await Promise.all(updates);
      } catch (e) {
        return NextResponse.json(
          { error: `Pedido cancelado pero falló la reposición de stock: ${String(e?.message || e)}` },
          { status: 400 }
        );
      }
    }
  }

  return NextResponse.json({ ok: true, id, status: nextStatus });
}