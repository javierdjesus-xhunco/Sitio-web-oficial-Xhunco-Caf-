import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function startDateFromDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d.toISOString();
}

function monthKey(dateLike) {
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(dateLike) {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      month: "long",
      year: "numeric",
    }).format(new Date(dateLike));
  } catch {
    return String(dateLike || "");
  }
}

function dayKey(dateLike) {
  return new Date(dateLike).toISOString().slice(0, 10);
}

async function requireAdmin() {
  const supabase = await supabaseServer();

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return { error: "No autenticado", status: 401 };
  }

  const { data: me, error: meErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (meErr) {
    return { error: meErr.message || "No se pudo validar el rol", status: 500 };
  }

  const role = String(me?.role || "").toLowerCase().trim();
  if (role !== "super_admin" && role !== "admin") {
    return { error: "No autorizado", status: 403 };
  }

  return { supabase };
}

export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (auth?.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabase } = auth;
    const { searchParams } = new URL(req.url);
    const days = Math.max(1, Math.min(365, Number(searchParams.get("days") || 30)));
    const fromIso = startDateFromDays(days);

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        payment_status,
        client_user_id,
        total,
        clients:clients!orders_client_user_id_fkey (
          user_id,
          business_name
        )
      `)
      .gte("created_at", fromIso)
      .order("created_at", { ascending: true });

    if (ordersErr) {
      return NextResponse.json({ error: ordersErr.message || "Error cargando pedidos" }, { status: 500 });
    }

    const orderIds = (orders || []).map((o) => o.id);

    let items = [];
    if (orderIds.length) {
      const { data: rawItems, error: itemsErr } = await supabase
        .from("order_items")
        .select(`
          id,
          order_id,
          product_id,
          product_name,
          quantity,
          unit_price,
          subtotal
        `)
        .in("order_id", orderIds);

      if (itemsErr) {
        return NextResponse.json({ error: itemsErr.message || "Error cargando partidas" }, { status: 500 });
      }

      items = rawItems || [];
    }

    const orderMap = new Map();
    for (const o of orders || []) orderMap.set(o.id, o);

    const statusCounter = new Map();
    for (const o of orders || []) {
      const s = String(o.status || "sin_status");
      statusCounter.set(s, (statusCounter.get(s) || 0) + 1);
    }

    const status_breakdown = Array.from(statusCounter.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    const paidOrders = (orders || []).filter(
      (o) => String(o.payment_status || "").toLowerCase().trim() === "pagado"
    );

    const paidOrderIdSet = new Set(paidOrders.map((o) => o.id));
    const paidItems = items.filter((it) => paidOrderIdSet.has(it.order_id));

    const kpis = {
      total_orders: orders?.length || 0,
      paid_orders: paidOrders.length,
      paid_revenue: paidOrders.reduce((acc, o) => acc + Number(o.total || 0), 0),
      paid_items: paidItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0),
      avg_paid_ticket: paidOrders.length
        ? paidOrders.reduce((acc, o) => acc + Number(o.total || 0), 0) / paidOrders.length
        : 0,
    };

    // Sales by day (paid only)
    const byDayMap = new Map();
    for (const o of paidOrders) {
      const key = dayKey(o.created_at);
      const prev = byDayMap.get(key) || { day: key, total_sales: 0, orders: 0 };
      prev.total_sales += Number(o.total || 0);
      prev.orders += 1;
      byDayMap.set(key, prev);
    }
    const sales_by_day = Array.from(byDayMap.values()).sort((a, b) =>
      String(a.day).localeCompare(String(b.day))
    );

    // Sales by month (paid only)
    const byMonthMap = new Map();
    for (const o of paidOrders) {
      const key = monthKey(o.created_at);
      const prev = byMonthMap.get(key) || {
        month: key,
        month_label: monthLabel(o.created_at),
        total_sales: 0,
        orders: 0,
      };
      prev.total_sales += Number(o.total || 0);
      prev.orders += 1;
      byMonthMap.set(key, prev);
    }
    const sales_by_month = Array.from(byMonthMap.values()).sort((a, b) =>
      String(a.month).localeCompare(String(b.month))
    );

    // Top clients (paid only)
    const clientsMap = new Map();
    for (const o of paidOrders) {
      const key = String(o.client_user_id || "sin_cliente");
      const clientName =
        o?.clients?.business_name ||
        "Cliente";
      const prev = clientsMap.get(key) || {
        client_id: key,
        client_name: clientName,
        orders: 0,
        total_sales: 0,
      };
      prev.orders += 1;
      prev.total_sales += Number(o.total || 0);
      clientsMap.set(key, prev);
    }
    const top_clients = Array.from(clientsMap.values())
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 10);

    // Top products (paid lines only)
    const productsMap = new Map();
    for (const it of paidItems) {
      const key = String(it.product_id || it.product_name || "sin_producto");
      const lineTotal =
        Number(it.subtotal ?? Number(it.quantity || 0) * Number(it.unit_price || 0));

      const prev = productsMap.get(key) || {
        product_id: it.product_id || null,
        product_name: it.product_name || "Producto",
        quantity: 0,
        lines: 0,
        total_sales: 0,
      };

      prev.quantity += Number(it.quantity || 0);
      prev.lines += 1;
      prev.total_sales += lineTotal;
      productsMap.set(key, prev);
    }
    const top_products = Array.from(productsMap.values())
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 10);

    // Preview raw lines
    const latest_paid_lines = paidItems
      .map((it) => {
        const o = orderMap.get(it.order_id);
        const lineTotal =
          Number(it.subtotal ?? Number(it.quantity || 0) * Number(it.unit_price || 0));

        return {
          order_item_id: it.id,
          order_id: o?.id,
          order_folio: o?.id,
          created_at: o?.created_at,
          client_name: o?.clients?.business_name || "Cliente",
          client_email: null,
          product_name: it.product_name || "Producto",
          quantity: Number(it.quantity || 0),
          unit_price: Number(it.unit_price || 0),
          line_total: lineTotal,
          order_status: o?.status || null,
          payment_status: o?.payment_status || null,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 30);

    return NextResponse.json({
      ok: true,
      days,
      kpis,
      status_breakdown,
      sales_by_day,
      sales_by_month,
      top_clients,
      top_products,
      latest_paid_lines,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}