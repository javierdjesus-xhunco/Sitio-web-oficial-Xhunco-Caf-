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

export async function GET(req) {
  try {
    const guard = await requireSuperAdmin();

    if (guard.error) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const { searchParams } = new URL(req.url);

    const month = searchParams.get("month");
    const clientUserId = searchParams.get("client_user_id");

    const monthRange = buildMonthRange(month);

    const [
      clientsCount,
      monthOrders,
      recentOrders,
      products,
      clients
    ] = await Promise.all([
      supabaseAdmin.from("clients").select("id", { count: "exact", head: true }),

      supabaseAdmin
        .from("orders")
        .select("id, client_user_id, status, total, payment_status, created_at")
        .gte("created_at", monthRange.startIso)
        .lt("created_at", monthRange.endIso),

      supabaseAdmin
        .from("orders")
        .select("id, client_user_id, status, total, payment_status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),

      supabaseAdmin
        .from("suministros_xhunco")
        .select("id, nombre, marca, presentacion, stock, activo"),

      supabaseAdmin
        .from("clients")
        .select("user_id, business_name, owner_name")
    ]);

    const clientsMap = new Map(
      (clients.data || []).map((c) => [
        c.user_id,
        c.business_name || c.owner_name || "Cliente",
      ])
    );

    const orders = monthOrders.data || [];

    const filteredOrders = clientUserId
      ? orders.filter((o) => o.client_user_id === clientUserId)
      : orders;

    const salesByDay = {};

    filteredOrders.forEach((o) => {
      const d = new Date(o.created_at).getDate();

      salesByDay[d] = (salesByDay[d] || 0) + Number(o.total || 0);
    });

    const graph = Object.entries(salesByDay).map(([day, total]) => ({
      day,
      total,
    }));

    const revenue = filteredOrders.reduce((a, b) => a + Number(b.total || 0), 0);

    const paidRevenue = filteredOrders
      .filter((o) => o.payment_status === "paid")
      .reduce((a, b) => a + Number(b.total || 0), 0);

    const avgTicket = filteredOrders.length
      ? revenue / filteredOrders.length
      : 0;

    const orderIds = filteredOrders.map((o) => o.id);

    let orderItems = [];

    if (orderIds.length) {
      const res = await supabaseAdmin
        .from("order_items")
        .select("order_id, suministro_id, qty, unit_price, line_total")
        .in("order_id", orderIds);

      orderItems = res.data || [];
    }

    const productsMap = new Map(
      (products.data || []).map((p) => [
        p.id,
        {
          nombre: p.nombre,
          marca: p.marca,
          presentacion: p.presentacion,
        },
      ])
    );

    const topProductsMap = new Map();

    orderItems.forEach((item) => {
      const p = productsMap.get(item.suministro_id);

      const prev = topProductsMap.get(item.suministro_id) || {
        nombre: p?.nombre || "Producto",
        qty: 0,
        total: 0,
      };

      prev.qty += Number(item.qty);
      prev.total += Number(item.line_total);

      topProductsMap.set(item.suministro_id, prev);
    });

    const topProductsPeriod = Array.from(topProductsMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return NextResponse.json({
      ok: true,

      user: guard.user,

      kpis: {
        activeClients: clientsCount.count || 0,
        activeOrders: filteredOrders.length,
        monthRevenue: revenue,
        paidMonthRevenue: paidRevenue,
        totalProducts: (products.data || []).length,
      },

      filters: {
        clients: (clients.data || []).map((c) => ({
          user_id: c.user_id,
          label: c.business_name || c.owner_name || "Cliente",
        })),
      },

      selectedMonthSummary: {
        month: monthRange.month,
        ordersCount: filteredOrders.length,
        totalSpent: revenue,
        paidSpent: paidRevenue,
        avgTicket,
      },

      salesByDay: graph,

      topProductsPeriod,

      recentOrders: (recentOrders.data || []).map((o) => ({
        ...o,
        negocio_nombre: clientsMap.get(o.client_user_id) || "Cliente",
      })),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error cargando dashboard" },
      { status: 500 }
    );
  }
}