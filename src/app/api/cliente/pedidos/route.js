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

    // Regresa en formato estándar
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
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // 2) Guardar snapshots opcionales (sin tocar tu RPC)
    //    Solo si tu tabla orders ya tiene estas columnas.
    //    Si NO existen, este update fallará -> lo ignoramos para no romper.
    const patch = {
      // si tu tabla orders ya tiene estos campos, se guardan
      delivery_method: body?.delivery_method || null,
      payment_method: body?.payment_method || null,

      // snapshots (recomendado que sean JSONB)
      delivery_address_snapshot: body?.address || null,
      payment_snapshot: body?.payment_details || null,

      // opcional para tu numeración interna
      draft_no: body?.draft_no || null,
    };

    // intentamos update (si columnas no existen, no rompemos el flujo)
    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update(patch)
      .eq("id", orderId)
      .eq("client_user_id", userId);

    // Si no tienes esas columnas aún, te conviene crearlas.
    // No detenemos el pedido por esto.
    if (updErr) {
      // puedes loguear si quieres:
      // console.log("No se pudo guardar snapshot:", updErr.message);
    }

    return NextResponse.json({ ok: true, order_id: orderId });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 },
    );
  }
}
