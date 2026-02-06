import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(_req, { params }) {
  const supabase = await supabaseServer();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const orderId = params?.id;

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .select("id, status, price_tier_snapshot, subtotal, total, created_at")
    .eq("id", orderId)
    .eq("client_user_id", authData.user.id)
    .single();

  if (oErr || !order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const { data: lines, error: lErr } = await supabase
    .from("order_items")
    .select("id, suministro_id, qty, unit_price, line_total, price_tier_snapshot")
    .eq("order_id", orderId)
    .order("id", { ascending: true });

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 400 });

  // (opcional) traer nombres de productos para mostrar bonito
  const suministroIds = Array.from(new Set((lines || []).map((l) => l.suministro_id))).filter(Boolean);

  let suministrosMap = {};
  if (suministroIds.length) {
    const { data: sups, error: sErr } = await supabase
      .from("suministros_xhunco")
      .select("id, nombre, marca, presentacion, unidad, sku")
      .in("id", suministroIds);

    if (!sErr && sups) {
      suministrosMap = Object.fromEntries(sups.map((s) => [s.id, s]));
    }
  }

  const items = (lines || []).map((l) => ({
    ...l,
    suministro: suministrosMap[l.suministro_id] || null,
  }));

  return NextResponse.json({ ok: true, order, items });
}
