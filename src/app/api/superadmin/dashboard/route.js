import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function buildMonthRange(rawMonth) {
  const now = new Date();
  const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const month = /^\d{4}-\d{2}$/.test(String(rawMonth || "")) ? rawMonth : fallback;

  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;

  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);

  return {
    month,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    daysInMonth: new Date(year, monthIndex + 1, 0).getDate(),
  };
}

async function requireSuperAdmin() {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return { error: "No autenticado", status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, active")
    .eq("id", auth.user.id)
    .single();

  const role = String(profile?.role || "").toLowerCase();

  if (!profile?.active || !["admin", "superadmin", "super_admin"].includes(role)) {
    return { error: "Sin permisos", status: 403 };
  }

  return {
    user: {
      id: auth.user.id,
      first_name: profile.first_name || "Usuario",
    },
  };
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req) {
  try {
    const guard = await requireSuperAdmin();

    if (guard.error) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const clientUserId = String(searchParams.get("client_user_id") || "").trim();

    const monthRange = buildMonthRange(month);
    const monthDate = `${monthRange.month}-01`;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      clientsCountRes,
      newClientsRes,
      clientsRes,
      recentOrdersRes,
      productsRes,
      monthOrdersRes,
      clientMonthlyRes,
      productMonthlyRes,
    ] = await Promise.all([
      supabaseAdmin.from("clients").select("id", { count: "exact", head: true }),

      supabaseAdmin
        .from("clients")
        .select("id", { count: "exact", head: true })
        .gte("created_at", currentMonthStart),

      supabaseAdmin
        .from("clients")
        .select("user_id, business_name, owner_name")
        .order("business_name", { ascending: true }),

      supabaseAdmin
        .from("orders")
        .select("id, client_user_id, status, total, payment_status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),

      supabaseAdmin
        .from("suministros_xhunco")
        .select("id, nombre, stock, activo"),

      supabaseAdmin
        .from("orders")
        .select("id, client_user_id, status, total, payment_status, created_at")
        .gte("created_at", monthRange.startIso)
        .lt("created_at", monthRange.endIso),

      supabaseAdmin
        .from("dashboard_client_monthly")
        .select("*")
        .eq("month", monthDate),

      supabaseAdmin
        .from("dashboard_product_monthly")
        .select("*")
        .eq("month", monthDate),
    ]);

    if (clientsCountRes.error) {
      return NextResponse.json({ error: clientsCountRes.error.message }, { status: 500 });
    }
    if (newClientsRes.error) {
      return NextResponse.json({ error: newClientsRes.error.message }, { status: 500 });
    }
    if (clientsRes.error) {
      return NextResponse.json({ error: clientsRes.error.message }, { status: 500 });
    }
    if (recentOrdersRes.error) {
      return NextResponse.json({ error: recentOrdersRes.error.message }, { status: 500 });
    }
    if (productsRes.error) {
      return NextResponse.json({ error: productsRes.error.message }, { status: 500 });
    }
    if (monthOrdersRes.error) {
      return NextResponse.json({ error: monthOrdersRes.error.message }, { status: 500 });
    }
    if (clientMonthlyRes.error) {
      return NextResponse.json({ error: clientMonthlyRes.error.message }, { status: 500 });
    }
    if (productMonthlyRes.error) {
      return NextResponse.json({ error: productMonthlyRes.error.message }, { status: 500 });
    }

    const clients = clientsRes.data || [];
    const recentOrders = recentOrdersRes.data || [];
    const products = productsRes.data || [];
    const monthOrders = monthOrdersRes.data || [];
    const clientMonthly = clientMonthlyRes.data || [];
    const productMonthly = productMonthlyRes.data || [];

    const clientsMap = new Map(
      clients.map((c) => [
        c.user_id,
        c.business_name || c.owner_name || "Cliente",
      ])
    );

    const clientOptions = clients.map((c) => ({
      user_id: c.user_id,
      label: c.business_name || c.owner_name || "Cliente",
    }));

    const selectedClient =
      clientUserId && clientsMap.has(clientUserId)
        ? {
            user_id: clientUserId,
            label: clientsMap.get(clientUserId),
          }
        : null;

    const monthClientRows = clientMonthly;
    const filteredClientRows = clientUserId
      ? monthClientRows.filter((r) => String(r.client_user_id || "") === clientUserId)
      : monthClientRows;

    const summary = filteredClientRows.reduce(
      (acc, row) => {
        acc.ordersCount += toNumber(row.orders_count);
        acc.totalSpent += toNumber(row.total_sales);
        acc.paidSpent += toNumber(row.paid_sales);
        acc.pendingOrders += toNumber(row.pending_orders);
        acc.confirmedOrders += toNumber(row.confirmed_orders);
        acc.preparingOrders += toNumber(row.preparing_orders);
        acc.onRouteOrders += toNumber(row.on_route_orders);
        acc.deliveredOrders += toNumber(row.delivered_orders);
        acc.cancelledOrders += toNumber(row.cancelled_orders);
        return acc;
      },
      {
        ordersCount: 0,
        totalSpent: 0,
        paidSpent: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        preparingOrders: 0,
        onRouteOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      }
    );

    const avgTicket =
      summary.ordersCount > 0 ? summary.totalSpent / summary.ordersCount : 0;

    const activeOrders =
      summary.pendingOrders +
      summary.confirmedOrders +
      summary.preparingOrders +
      summary.onRouteOrders;

    const paidMonthRevenue = summary.paidSpent;
    const monthRevenue = summary.totalSpent;

    const filteredMonthOrders = clientUserId
      ? monthOrders.filter((o) => String(o.client_user_id || "") === clientUserId)
      : monthOrders;

    const salesByDayMap = new Map();
    for (let day = 1; day <= monthRange.daysInMonth; day += 1) {
      salesByDayMap.set(String(day), 0);
    }

    filteredMonthOrders.forEach((o) => {
      if (String(o.status || "").toLowerCase() === "cancelado") return;
      const d = new Date(o.created_at).getDate();
      salesByDayMap.set(String(d), toNumber(salesByDayMap.get(String(d))) + toNumber(o.total));
    });

    const salesByDay = Array.from(salesByDayMap.entries()).map(([day, total]) => ({
      day,
      total,
    }));

    const topClientsByMonth = monthClientRows
      .map((row) => ({
        client_user_id: row.client_user_id,
        label: row.client_label || "Cliente",
        total: toNumber(row.total_sales),
        orders: toNumber(row.orders_count),
        paid: toNumber(row.paid_sales),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const filteredProductRows = clientUserId
      ? productMonthly.filter((r) => String(r.client_user_id || "") === clientUserId)
      : productMonthly;

    const topProductsMap = new Map();

    filteredProductRows.forEach((row) => {
      const key = String(row.suministro_id || "");
      if (!key) return;

      const prev = topProductsMap.get(key) || {
        suministro_id: key,
        nombre: row.product_name || "Producto",
        subtitle: [row.marca, row.presentacion].filter(Boolean).join(" · "),
        qty: 0,
        total: 0,
        avgUnitPriceAccum: 0,
        avgRows: 0,
      };

      prev.qty += toNumber(row.total_qty);
      prev.total += toNumber(row.total_sales);
      prev.avgUnitPriceAccum += toNumber(row.avg_unit_price);
      prev.avgRows += 1;

      topProductsMap.set(key, prev);
    });

    const topProductsPeriod = Array.from(topProductsMap.values())
      .map((p) => ({
        suministro_id: p.suministro_id,
        nombre: p.nombre,
        subtitle: p.subtitle,
        qty: p.qty,
        total: p.total,
        avgUnitPrice: p.avgRows > 0 ? p.avgUnitPriceAccum / p.avgRows : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const activeProducts = products.filter((p) => p.activo !== false);
    const outOfStock = activeProducts.filter((p) => toNumber(p.stock) <= 0).length;
    const lowStock = activeProducts.filter((p) => {
      const stock = toNumber(p.stock);
      return stock > 0 && stock <= 5;
    }).length;

    const recentOrdersShaped = recentOrders.map((o) => ({
      ...o,
      negocio_nombre: clientsMap.get(o.client_user_id) || "Cliente",
    }));

    const alerts = [
      ...(outOfStock > 0
        ? [
            {
              id: "out-of-stock",
              title: `${outOfStock} productos sin stock`,
              subtitle: "Revisa inventario y repón existencias prioritarias.",
              level: "high",
              href: "/portal/super-admin/suministros",
            },
          ]
        : []),
      ...(lowStock > 0
        ? [
            {
              id: "low-stock",
              title: `${lowStock} productos con stock bajo`,
              subtitle: "Conviene reabastecer antes de afectar pedidos.",
              level: "medium",
              href: "/portal/super-admin/suministros",
            },
          ]
        : []),
      ...(summary.ordersCount > 0 && summary.paidSpent < summary.totalSpent
        ? [
            {
              id: "pending-payments",
              title: "Hay pedidos pendientes de pago",
              subtitle: "Da seguimiento a cobranza y conciliación.",
              level: "medium",
              href: "/portal/super-admin/pedidos",
            },
          ]
        : []),
    ];

    return NextResponse.json({
      ok: true,
      user: guard.user,

      kpis: {
        activeClients: clientsCountRes.count || 0,
        newClientsThisMonth: newClientsRes.count || 0,
        activeOrders,
        deliveredOrders: summary.deliveredOrders,
        cancelledOrders: summary.cancelledOrders,
        monthRevenue,
        paidMonthRevenue,
        pendingPaymentOrders: Math.max(summary.ordersCount - summary.deliveredOrders, 0),
        totalProducts: activeProducts.length,
        outOfStock,
        lowStock,
      },

      filters: {
        month: monthRange.month,
        client_user_id: clientUserId,
        clients: clientOptions,
      },

      selectedClient,

      selectedMonthSummary: {
        month: monthRange.month,
        ordersCount: summary.ordersCount,
        totalSpent: summary.totalSpent,
        paidSpent: summary.paidSpent,
        avgTicket,
      },

      salesByDay,
      topClientsByMonth,
      topProductsPeriod,
      recentOrders: recentOrdersShaped,
      recentActivity: [],
      alerts,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error cargando dashboard" },
      { status: 500 }
    );
  }
}