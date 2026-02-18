import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ✅ LISTA: Mis pedidos
export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, total, created_at")
      .eq("client_user_id", userId)
      .order("created_at", { ascending: true }); // viejo->nuevo (para Pedido #1, #2...)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, orders: orders || [] });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ✅ CREAR: Nuevo pedido (con snapshots de entrega/pago)
export async function POST(req) {
  try {
    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = authData.user.id;

    const body = await req.json().catch(() => ({}));
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items requerido" }, { status: 400 });
    }

    // 1) Crear pedido con tu RPC (solo items)
    const { data: orderId, error } = await supabase.rpc("create_order", { items });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2) Guardar entrega/pago (requiere columnas en orders)
    const patch = {
      delivery_method: body?.delivery_method || null, // pickup | delivery
      payment_method: body?.payment_method || null, // cash | tpv | online
      delivery_address_snapshot: body?.address || null, // jsonb
      payment_snapshot: body?.payment_details || null, // jsonb
      draft_no: body?.draft_no || null, // int (opcional)
    };

    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update(patch)
      .eq("id", orderId)
      .eq("client_user_id", userId);

    if (updErr) {
      console.error("No se pudo guardar entrega/pago:", updErr);
      return NextResponse.json(
        {
          error: `Pedido creado pero no se guardó entrega/pago: ${updErr.message}`,
          order_id: orderId,
        },
        { status: 400 }
      );
    }

    // 3) 🔔 Notificar a ADMIN + SUPERADMIN (usuarios registrados en profiles)
    //    No rompemos el flujo si esto falla.
    try {
      const { data: prof, error: profErr } = await supabaseAdmin
        .from("profiles")
        .select("id, role, active, email, first_name, last_name_paterno, last_name_materno")
        .eq("id", userId)
        .single();

      if (profErr) {
        console.error("No se pudo leer perfil del cliente:", profErr);
      }

      const clienteNombre = prof
        ? [prof.first_name, prof.last_name_paterno, prof.last_name_materno]
            .map((x) => (x || "").trim())
            .filter(Boolean)
            .join(" ") || prof.email || "Cliente"
        : "Cliente";

      const { data: admins, error: adminsErr } = await supabaseAdmin
        .from("profiles")
        .select("id, email, role, active")
        .in("role", ["admin", "superadmin"])
        .eq("active", true);

      if (adminsErr) {
        console.error("No se pudieron leer admins/superadmins:", adminsErr);
      } else {
        const notifRows = (admins || []).map((u) => ({
          recipient_user_id: u.id,
          recipient_role: u.role, // "admin" | "superadmin"
          type: "order_created",
          title: "Nuevo pedido pendiente",
          body: `${clienteNombre} creó un pedido (${String(orderId).slice(0, 8)}…).`,
          // Ajusta si tienes pantalla de detalle:
          url: "/portal/admin/pedidos",
          is_read: false,
        }));

        if (notifRows.length) {
          const { error: nErr } = await supabaseAdmin.from("notifications").insert(notifRows);
          if (nErr) console.error("Error insert notifications:", nErr);
        }

        // 4) (Opcional) Enviar correo
        // Si ya tienes /api/notify/email funcionando, descomenta esto.
        /*
        const emails = (admins || []).map((u) => u.email).filter(Boolean);
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
        if (emails.length && origin) {
          fetch(`${origin}/api/notify/email`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              to: emails,
              subject: "Xhunco: Nuevo pedido pendiente",
              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.4;">
                  <h2>Nuevo pedido pendiente ☕</h2>
                  <p><b>${clienteNombre}</b> creó un pedido.</p>
                  <p><b>ID:</b> ${orderId}</p>
                </div>
              `,
            }),
          }).catch((e) => console.error("email send error:", e));
        }
        */
      }
    } catch (e) {
      console.error("Error al notificar admins/superadmins:", e);
    }

    return NextResponse.json({ ok: true, order_id: orderId });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
