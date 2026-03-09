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

// Tu UI usa: pending / paid
const PAYMENT_PENDING_VALUES = new Set([
  "pending",
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

  // Perfil + cliente + pedidos en paralelo
  const [
    { data: profileRow, error: profileErr },
    { data: clientRows, error: clientErr },
    { data: orders, error: ordErr },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", userId)
      .maybeSingle(),

    supabase
      .from("clients")
      .select("business_name")
      .eq("user_id", userId)
      .limit(1),

    supabase
      .from("orders")
      .select("id, status, total, created_at, payment_status")
      .eq("client_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }

  if (clientErr) {
    return NextResponse.json({ error: clientErr.message }, { status: 400 });
  }

  if (ordErr) {
    return NextResponse.json({ error: ordErr.message }, { status: 400 });
  }

  const first_name = String(profileRow?.first_name || "Usuario").trim() || "Usuario";
  const business_name = clientRows?.[0]?.business_name || "";

  const rows = orders || [];

  if (!rows.length) {
    return NextResponse.json(
      {
        ok: true,
        first_name,
        business_name,
        months: [],
        last_order: null,
        pendientes_pedido: { count: 0, total: 0 },
        pendientes_pago: { count: 0, total: 0 },
        pendientes: { count: 0, total: 0 },
        products: { top: [], bottom: [] },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // Agregados
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

    // Pendientes de pedido
    if (st === "pendiente") {
      pendPedidoCount += 1;
      pendPedidoTotal += total;
    }

    // Pendientes de pago
    if (PAYMENT_PENDING_VALUES.has(pay)) {
      pendPagoCount += 1;
      pendPagoTotal += total;
    }
  }

  const months = Array.from(monthsCount.entries())
    .map(([ym, count]) => ({ ym, count }))
    .sort((a, b) => (a.ym > b.ym ? -1 : 1));

  const last_order = rows[0]
    ? {
        created_at: rows[0].created_at,
        status: rows[0].status,
        total: rows[0].total,
      }
    : null;

  // Productos agregados desde la vista SQL
  const { data: productRows, error: productErr } = await supabase
    .from("client_product_totals")
    .select("product_name, total_qty")
    .eq("client_user_id", userId)
    .order("total_qty", { ascending: false });

  if (productErr) {
    return NextResponse.json({ error: productErr.message }, { status: 400 });
  }

  const productsSorted = (productRows || [])
    .map((x) => ({
      name: String(x?.product_name || "Producto").trim(),
      qty: safeNumber(x?.total_qty),
    }))
    .filter((x) => x.name && x.qty > 0);

  const top = productsSorted.slice(0, 5);
  const bottom = productsSorted.slice(-5).reverse();

  const pendientes_pedido = { count: pendPedidoCount, total: pendPedidoTotal };
  const pendientes_pago = { count: pendPagoCount, total: pendPagoTotal };

  return NextResponse.json(
    {
      ok: true,
      first_name,
      business_name,
      months,
      last_order,
      pendientes_pedido,
      pendientes_pago,
      pendientes: pendientes_pedido,
      products: { top, bottom },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}