import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function ymKeyFromIso(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function norm(s) {
  return String(s || "").toLowerCase().trim();
}

export async function GET() {
  const supabase = await supabaseServer();

  // Auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = authData.user.id;

  // 1) Cliente (para business_name)
  const { data: clientRows, error: clientErr } = await supabase
    .from("clients")
    .select("business_name")
    .eq("user_id", userId)
    .limit(1);

  if (clientErr) {
    return NextResponse.json({ error: clientErr.message }, { status: 400 });
  }

  const business_name = clientRows?.[0]?.business_name || "";

  // 2) Pedidos (solo lo necesario, liviano)
  const { data: orders, error: ordErr } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .eq("client_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (ordErr) {
    return NextResponse.json({ error: ordErr.message }, { status: 400 });
  }

  const rows = orders || [];

  // Si no hay pedidos, respuesta rápida
  if (!rows.length) {
    return NextResponse.json(
      {
        ok: true,
        business_name,
        months: [],
        last_order: null,
        pendientes: { count: 0, total: 0 },
        products: { top: [], bottom: [] },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // 3) Agregados de pedidos (meses, último, pendientes)
  const monthsCount = new Map(); // ym -> count
  let pendCount = 0;
  let pendTotal = 0;

  for (const o of rows) {
    const ym = ymKeyFromIso(o.created_at);
    if (ym) monthsCount.set(ym, (monthsCount.get(ym) || 0) + 1);

    if (norm(o.status) === "pendiente") {
      pendCount += 1;
      pendTotal += Number(o.total || 0);
    }
  }

  const months = Array.from(monthsCount.entries())
    .map(([ym, count]) => ({ ym, count }))
    .sort((a, b) => (a.ym > b.ym ? -1 : 1)); // desc

  const last_order = rows[0]
    ? {
        created_at: rows[0].created_at,
        status: rows[0].status,
        total: rows[0].total,
      }
    : null;

  // 4) Productos (SUM qty) a partir de order_items + suministros_xhunco
  //    Importante: limitamos a estos 200 orders para no cargar de más.
  const orderIds = rows.map((o) => o.id);

  const { data: lines, error: lineErr } = await supabase
    .from("order_items")
    .select(
      `
      qty,
      suministro:suministros_xhunco (
        nombre
      ),
      order_id
    `
    )
    .in("order_id", orderIds);

  if (lineErr) {
    return NextResponse.json({ error: lineErr.message }, { status: 400 });
  }

  const qtyByProduct = new Map(); // nombre -> qty total
  for (const l of lines || []) {
    const name = String(l?.suministro?.nombre || "Producto").trim();
    const qty = Number(l?.qty || 0) || 0;
    if (!name) continue;
    if (qty <= 0) continue;
    qtyByProduct.set(name, (qtyByProduct.get(name) || 0) + qty);
  }

  const productsSorted = Array.from(qtyByProduct.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);

  const top = productsSorted.slice(0, 5);
  const bottom = productsSorted.slice(-5).reverse(); // menor a mayor para mostrar

  return NextResponse.json(
    {
      ok: true,
      business_name,
      months, // [{ym,count}]
      last_order,
      pendientes: { count: pendCount, total: pendTotal },
      products: { top, bottom },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}