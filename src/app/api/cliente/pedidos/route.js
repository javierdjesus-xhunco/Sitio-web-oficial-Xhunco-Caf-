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
      { status: 500 },
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
      delivery_method: body?.delivery_method || null,             // pickup | delivery
      payment_method: body?.payment_method || null,               // cash | tpv | online
      delivery_address_snapshot: body?.address || null,           // jsonb
      payment_snapshot: body?.payment_details || null,            // jsonb
      draft_no: body?.draft_no || null,                           // int (opcional)
    };

    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update(patch)
      .eq("id", orderId)
      .eq("client_user_id", userId);

    // ✅ ya no se silencia: si falla, lo sabrás y podrás corregirlo
    if (updErr) {
      console.error("No se pudo guardar entrega/pago:", updErr);
      return NextResponse.json(
        {
          error: `Pedido creado pero no se guardó entrega/pago: ${updErr.message}`,
          order_id: orderId,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, order_id: orderId });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 },
    );
  }
}
