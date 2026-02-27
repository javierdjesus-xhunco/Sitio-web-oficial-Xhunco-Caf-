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

function safeNumber(n) {
  const v = Number(n || 0);
  return Number.isFinite(v) ? v : 0;
}

// ✅ Ajusta esto si tus valores reales cambian
// Tu UI usa: pending / paid
const PAYMENT_PENDING_VALUES = new Set([
  "pending", // ✅ importante
  "pendiente",
  "pendiente_pago",
  "pendiente de pago",
]);

export async function GET() {
  const supabase = await supabaseServer();

  // Auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = authData.user.id;

  // 1) Cliente (business_name)
  const { data: clientRows, error: clientErr } = await supabase
    .from("clients")
    .select("business_name")
    .eq("user_id", userId)
    .limit(1);

  if (clientErr) {
    return NextResponse.json({ error: clientErr.message }, { status: 400 });
  }

  const business_name = clientRows?.[0]?.business_name || "";

  // 2) Pedidos
  const { data: orders, error: ordErr } = await supabase
    .from("orders")
    .select("id, status, total, created_at, payment_status")
    .eq("client_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (ordErr) {
    return NextResponse.json({ error: ordErr.message }, { status: 400 });
  }

  const rows = orders || [];

  if (!rows.length) {
    return NextResponse.json(
      {
        ok: true,
        business_name,
        months: [],
        last_order: null,
        pendientes_pedido: { count: 0, total: 0 },
        pendientes_pago: { count: 0, total: 0 },
        // compat con tu frontend anterior
        pendientes: { count: 0, total: 0 },
        products: { top: [], bottom: [] },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // 3) Agregados
  const monthsCount = new Map();

  let pendPedidoCount = 0;
  let pendPedidoTotal = 0;

  let pendPagoCount = 0;
  let pendPagoTotal = 0;

  for (const o of rows) {
    const ym = ymKeyFromIso(o.created_at);
    if (ym) monthsCount.set(ym, (monthsCount.get(ym) || 0) + 1);

    const st = norm(o.status);
    const pay = norm(o.payment_status);
    const total = safeNumber(o.total);

    // Pendientes de pedido: status = pendiente
    if (st === "pendiente") {
      pendPedidoCount += 1;
      pendPedidoTotal += total;
    }

    // Pendientes de pago: payment_status = pending (o equivalente)
    if (PAYMENT_PENDING_VALUES.has(pay)) {
      pendPagoCount += 1;
      pendPagoTotal += total;
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

  // 4) Productos (SUM qty)
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

  const qtyByProduct = new Map();
  for (const l of lines || []) {
    const name = String(l?.suministro?.nombre || "Producto").trim();
    const qty = safeNumber(l?.qty);
    if (!name || qty <= 0) continue;
    qtyByProduct.set(name, (qtyByProduct.get(name) || 0) + qty);
  }

  const productsSorted = Array.from(qtyByProduct.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);

  const top = productsSorted.slice(0, 5);
  const bottom = productsSorted.slice(-5).reverse();

  const pendientes_pedido = { count: pendPedidoCount, total: pendPedidoTotal };
  const pendientes_pago = { count: pendPagoCount, total: pendPagoTotal };

  return NextResponse.json(
    {
      ok: true,
      business_name,
      months,
      last_order,
      pendientes_pedido,
      pendientes_pago,
      // compat
      pendientes: pendientes_pedido,
      products: { top, bottom },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}