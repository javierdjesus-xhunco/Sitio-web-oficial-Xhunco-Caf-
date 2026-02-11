import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(_req, ctx) {
  try {
    const params = await ctx?.params; // soporta Promise
    const orderId = params?.id || params?.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, client_user_id, status, price_tier_snapshot, subtotal, total, created_at")
      .eq("id", orderId)
      .eq("client_user_id", userId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const { data: lines, error: linesErr } = await supabase
      .from("order_items")
      .select("id, order_id, suministro_id, qty, unit_price, line_total, price_tier_snapshot")
      .eq("order_id", orderId)
      .order("id", { ascending: true });

    if (linesErr) {
      return NextResponse.json({ error: linesErr.message }, { status: 400 });
    }

    const supplyIds = Array.from(
      new Set((lines || []).map((l) => l.suministro_id).filter(Boolean))
    );

    let suppliesMap = {};
    if (supplyIds.length > 0) {
      const { data: supplies, error: sErr } = await supabase
        .from("suministros_xhunco")
        .select("id, nombre, marca, presentacion, unidad, imagen")
        .in("id", supplyIds);

      if (sErr) return NextResponse.json({ error: sErr.message }, { status: 400 });

      suppliesMap = (supplies || []).reduce((acc, s) => {
        acc[s.id] = s;
        return acc;
      }, {});
    }

    const items = (lines || []).map((l) => {
      const s = suppliesMap[l.suministro_id] || null;
      return {
        id: l.id,
        suministro_id: l.suministro_id,
        nombre: s?.nombre || "Producto",
        marca: s?.marca || null,
        presentacion: s?.presentacion || null,
        unidad: s?.unidad || null,
        imagen: s?.imagen || null,
        qty: Number(l.qty || 0),
        unit_price: Number(l.unit_price || 0),
        line_total: Number(l.line_total || 0),
        price_tier_snapshot: l.price_tier_snapshot || order.price_tier_snapshot || null,
      };
    });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      price_tier_snapshot: order.price_tier_snapshot,
      subtotal: Number(order.subtotal || 0),
      total: Number(order.total || 0),
      created_at: order.created_at,
      items,
    });
  } catch (e) {
    console.error("GET /api/cliente/pedidos/[id] error:", e);
    return NextResponse.json(
      { error: e?.message || String(e) || "Error inesperado" },
      { status: 500 }
    );
  }
}
