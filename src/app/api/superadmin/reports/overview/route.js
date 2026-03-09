import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function clampDays(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 30;
  return Math.max(1, Math.min(365, n));
}

function startDateFromDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d.toISOString();
}

function previousStartDateFromDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days * 2 + 1);
  return d.toISOString();
}

function previousEndDateFromDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d.toISOString();
}

function dayKey(dateLike) {
  try {
    return new Date(dateLike).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function monthKey(dateLike) {
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabelFromKey(key) {
  const [y, m] = String(key).split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  try {
    return new Intl.DateTimeFormat("es-MX", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return key;
  }
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

  const role = String(me?.role || "")
    .toLowerCase()
    .trim();

  if (role !== "super_admin" && role !== "admin") {
    return { error: "No autorizado", status: 403 };
  }

  return { supabase };
}

function buildKpis(orders, items) {
  const paidOrders = (orders || []).filter(
    (o) => String(o.payment_status || "").toLowerCase().trim() === "pagado"
  );

  const paidOrderIds = new Set(paidOrders.map((o) => o.id));
  const paidItems = (items || []).filter((it) => paidOrderIds.has(it.order_id));

  const paidRevenue = paidOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const paidItemsQty = paidItems.reduce((acc, it) => acc + Number(it.qty || 0), 0);

  return {
    total_orders: (orders || []).length,
    paid_orders: paidOrders.length,
    paid_revenue: paidRevenue,
    paid_items: paidItemsQty,
    avg_paid_ticket: paidOrders.length ? paidRevenue / paidOrders.length : 0,
  };
}

export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (auth?.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabase } = auth;
    const { searchParams } = new URL(req.url);

    const days = clampDays(searchParams.get("days"));
    const fromIso = startDateFromDays(days);
    const previousFromIso = previousStartDateFromDays(days);
    const previousToIso = previousEndDateFromDays(days);

    // =========================
    // PERIODO ACTUAL
    // =========================
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select(`
        id,
        client_user_id,
        status,
        subtotal,
        total,
        created_at,
        payment_status,
        paid_at,
        paid_by
      `)
      .gte("created_at", fromIso)
      .order("created_at", { ascending: true });

    if (ordersErr) {
      return NextResponse.json(
        { error: ordersErr.message || "Error al cargar pedidos" },
        { status: 500 }
      );
    }

    const orderIds = (orders || []).map((o) => o.id);
    const clientUserIds = [
      ...new Set((orders || []).map((o) => o.client_user_id).filter(Boolean)),
    ];

    let clients = [];
    if (clientUserIds.length) {
      const { data, error } = await supabase
        .from("clients")
        .select("user_id, business_name")
        .in("user_id", clientUserIds);

      if (error) {
        return NextResponse.json(
          { error: error.message || "Error al cargar clientes" },
          { status: 500 }
        );
      }

      clients = data || [];
    }

    let items = [];
    if (orderIds.length) {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, order_id, suministro_id, qty, unit_price, line_total")
        .in("order_id", orderIds);

      if (error) {
        return NextResponse.json(
          { error: error.message || "Error al cargar partidas" },
          { status: 500 }
        );
      }

      items = data || [];
    }

    const suministroIds = [
      ...new Set((items || []).map((it) => it.suministro_id).filter(Boolean)),
    ];

    let suministros = [];
    if (suministroIds.length) {
      const { data, error } = await supabase
        .from("suministros_xhunco")
        .select("id, nombre, categoria, marca, presentacion")
        .in("id", suministroIds);

      if (error) {
        return NextResponse.json(
          { error: error.message || "Error al cargar productos" },
          { status: 500 }
        );
      }

      suministros = data || [];
    }

    // =========================
    // PERIODO ANTERIOR
    // =========================
    const { data: previousOrders, error: previousOrdersErr } = await supabase
      .from("orders")
      .select(`
        id,
        client_user_id,
        status,
        subtotal,
        total,
        created_at,
        payment_status,
        paid_at,
        paid_by
      `)
      .gte("created_at", previousFromIso)
      .lt("created_at", previousToIso)
      .order("created_at", { ascending: true });

    if (previousOrdersErr) {
      return NextResponse.json(
        { error: previousOrdersErr.message || "Error al cargar periodo anterior" },
        { status: 500 }
      );
    }

    const previousOrderIds = (previousOrders || []).map((o) => o.id);

    let previousItems = [];
    if (previousOrderIds.length) {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, order_id, suministro_id, qty, unit_price, line_total")
        .in("order_id", previousOrderIds);

      if (error) {
        return NextResponse.json(
          { error: error.message || "Error al cargar partidas del periodo anterior" },
          { status: 500 }
        );
      }

      previousItems = data || [];
    }

    // =========================
    // MAPAS
    // =========================
    const clientsMap = new Map((clients || []).map((c) => [c.user_id, c]));
    const suppliesMap = new Map((suministros || []).map((s) => [s.id, s]));
    const ordersMap = new Map((orders || []).map((o) => [o.id, o]));

    // =========================
    // KPIS
    // =========================
    const kpis = buildKpis(orders || [], items || []);
    const previous_kpis = buildKpis(previousOrders || [], previousItems || []);

    const paidOrders = (orders || []).filter(
      (o) => String(o.payment_status || "").toLowerCase().trim() === "pagado"
    );

    const paidOrderIds = new Set(paidOrders.map((o) => o.id));
    const paidItems = (items || []).filter((it) => paidOrderIds.has(it.order_id));

    // =========================
    // STATUS BREAKDOWN
    // =========================
    const statusCounter = new Map();

    for (const o of orders || []) {
      const key = String(o.status || "sin_status");
      statusCounter.set(key, (statusCounter.get(key) || 0) + 1);
    }

    const status_breakdown = Array.from(statusCounter.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    // =========================
    // SALES BY DAY
    // =========================
    const byDayMap = new Map();

    for (const o of paidOrders) {
      const key = dayKey(o.created_at);
      if (!key) continue;

      const prev = byDayMap.get(key) || {
        day: key,
        total_sales: 0,
        orders: 0,
      };

      prev.total_sales += Number(o.total || 0);
      prev.orders += 1;
      byDayMap.set(key, prev);
    }

    const sales_by_day = Array.from(byDayMap.values()).sort((a, b) =>
      String(a.day).localeCompare(String(b.day))
    );

    // =========================
    // SALES BY MONTH
    // =========================
    const byMonthMap = new Map();

    for (const o of paidOrders) {
      const key = monthKey(o.created_at);
      const prev = byMonthMap.get(key) || {
        month: key,
        month_label: monthLabelFromKey(key),
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

    // =========================
    // TOP CLIENTS
    // =========================
    const topClientsMap = new Map();

    for (const o of paidOrders) {
      const key = String(o.client_user_id || "sin_cliente");
      const client = clientsMap.get(o.client_user_id);

      const prev = topClientsMap.get(key) || {
        client_user_id: o.client_user_id,
        business_name: client?.business_name || "Cliente",
        orders: 0,
        total_sales: 0,
      };

      prev.orders += 1;
      prev.total_sales += Number(o.total || 0);
      topClientsMap.set(key, prev);
    }

    const top_clients = Array.from(topClientsMap.values())
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 10);

    // =========================
    // TOP PRODUCTS
    // =========================
    const topProductsMap = new Map();

    for (const it of paidItems) {
      const suministro = suppliesMap.get(it.suministro_id);
      const key = String(it.suministro_id || "sin_producto");

      const prev = topProductsMap.get(key) || {
        suministro_id: it.suministro_id,
        nombre: suministro?.nombre || "Producto",
        categoria: suministro?.categoria || null,
        marca: suministro?.marca || null,
        presentacion: suministro?.presentacion || null,
        qty: 0,
        lines: 0,
        total_sales: 0,
      };

      prev.qty += Number(it.qty || 0);
      prev.lines += 1;
      prev.total_sales += Number(it.line_total || 0);
      topProductsMap.set(key, prev);
    }

    const top_products = Array.from(topProductsMap.values())
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 10);

    // =========================
    // RAW PREVIEW
    // =========================
    const raw_preview = paidItems
      .map((it) => {
        const order = ordersMap.get(it.order_id);
        const client = clientsMap.get(order?.client_user_id);
        const suministro = suppliesMap.get(it.suministro_id);

        return {
          order_item_id: it.id,
          order_id: it.order_id,
          created_at: order?.created_at || null,
          business_name: client?.business_name || "Cliente",
          product_name: suministro?.nombre || "Producto",
          categoria: suministro?.categoria || null,
          marca: suministro?.marca || null,
          presentacion: suministro?.presentacion || null,
          qty: Number(it.qty || 0),
          unit_price: Number(it.unit_price || 0),
          line_total: Number(it.line_total || 0),
          status: order?.status || null,
          payment_status: order?.payment_status || null,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);

    return NextResponse.json({
      ok: true,
      days,
      from: fromIso,
      previous_from: previousFromIso,
      previous_to: previousToIso,
      kpis,
      previous_kpis,
      status_breakdown,
      sales_by_day,
      sales_by_month,
      top_clients,
      top_products,
      raw_preview,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}