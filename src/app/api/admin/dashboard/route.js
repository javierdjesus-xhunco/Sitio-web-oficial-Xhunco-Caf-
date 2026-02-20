import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic"; // evita cache de Next en server

const STATUS_ACTIVE = new Set(["pendiente", "confirmado", "en preparación"]);
const STATUS_DELIVERED = new Set(["entregado"]);
const STATUS_CANCELLED = new Set(["cancelado"]);

function norm(s) {
  return String(s || "").toLowerCase().trim();
}

function ymKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function dayKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthRange(ym) {
  // ym = "YYYY-MM" => [startISO, endISO)
  const [y, m] = String(ym).split("-").map((x) => Number(x));
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return [start.toISOString(), end.toISOString()];
}

export async function GET(req) {
  const supabase = await supabaseServer();

  // 1) Auth
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "No auth" }, { status: 401 });

  // 2) Role check
  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .single();

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
  if (prof?.active === false)
    return NextResponse.json({ error: "Usuario desactivado" }, { status: 403 });

  // OJO: tu rol real es super_admin
  if (!["admin", "super_admin"].includes(prof?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3) Filtros
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || "ALL"; // "ALL" | "YYYY-MM"
  const clientId = searchParams.get("client") || "ALL"; // "ALL" | clients.id

  // 4) Clients (solo lo necesario para dropdown + nombres)
  // Recomendación: si en tu sistema hay muchos clientes, puedes paginar o limitar a 2000.
  const { data: clients, error: ce } = await supabase
    .from("clients")
    .select("id, user_id, business_name, owner_name, created_at")
    .order("business_name", { ascending: true })
    .limit(5000);

  if (ce) return NextResponse.json({ error: ce.message }, { status: 500 });

  const safeClients = Array.isArray(clients) ? clients : [];
  const clientById = new Map(safeClients.map((c) => [String(c.id), c]));
  const clientByUserId = new Map(safeClients.map((c) => [String(c.user_id), c]));

  const selectedClient = clientId === "ALL" ? null : clientById.get(String(clientId));
  const selectedUserId = selectedClient ? String(selectedClient.user_id) : null;

  // 5) Query base para orders (solo columnas necesarias)
  // NOTA: aquí NO jalamos 5000 siempre.
  // Traemos:
  // - un lote para KPIs + months + listas (reciente)
  // - y otro lote para agregados (entregados) según filtros.

  // A) Lote "reciente" (para listas + KPIs rápidos)
  //    Traemos solo últimas 1500 órdenes (normalmente sobra para dashboard).
  //    Si necesitas más historial para months, lo resolvemos con query de meses aparte (abajo).
  const { data: recentOrders, error: rErr } = await supabase
    .from("orders")
    .select("id, client_user_id, status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(1500);

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const safeRecent = Array.isArray(recentOrders) ? recentOrders : [];

  // KPIs sobre lote reciente:
  // (si quieres KPIs “históricos” totales, habría que hacer count() por status)
  const kpis = {
    activos: safeRecent.filter((o) => STATUS_ACTIVE.has(norm(o.status))).length,
    entregados: safeRecent.filter((o) => STATUS_DELIVERED.has(norm(o.status))).length,
    cancelados: safeRecent.filter((o) => STATUS_CANCELLED.has(norm(o.status))).length,
  };

  // B) Meses disponibles (mejor: derivar de órdenes entregadas recientes + recientes)
  //    Esto evita cargar todas las órdenes de toda la historia.
  const monthsSet = new Set();
  for (const o of safeRecent) {
    const k = ymKey(o.created_at);
    if (k) monthsSet.add(k);
  }
  const months = Array.from(monthsSet).sort((a, b) => (a > b ? -1 : 1));

  // Dropdown de clientes
  const clientOptions = safeClients
    .map((c) => ({
      id: String(c.id),
      label: String(c.business_name || c.owner_name || "Cliente"),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  // 6) Query ENTREGADOS para ingresos según filtros (dataset pequeño y preciso)
  let deliveredQuery = supabase
    .from("orders")
    .select("id, client_user_id, status, total, created_at")
    .eq("status", "entregado")
    .order("created_at", { ascending: true });

  // filtro cliente
  if (selectedUserId) deliveredQuery = deliveredQuery.eq("client_user_id", selectedUserId);

  // filtro mes
  if (month !== "ALL") {
    const [startISO, endISO] = monthRange(month);
    deliveredQuery = deliveredQuery.gte("created_at", startISO).lt("created_at", endISO);
  }

  // IMPORTANTE: para "Ingresos por día" no necesitas más de un mes normalmente.
  // Si month=ALL y cliente=ALL, esto puede crecer. Limitamos a últimos 365 días.
  if (month === "ALL") {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - 365);
    deliveredQuery = deliveredQuery.gte("created_at", from.toISOString());
  }

  const { data: deliveredFiltered, error: dErr } = await deliveredQuery.limit(20000);
  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });

  const delivered = Array.isArray(deliveredFiltered) ? deliveredFiltered : [];

  const incomeTotal = delivered.reduce((acc, o) => acc + Number(o.total || 0), 0);

  // ingresos por día
  const byDay = new Map();
  for (const o of delivered) {
    const k = dayKey(o.created_at);
    if (!k) continue;
    byDay.set(k, (byDay.get(k) || 0) + Number(o.total || 0));
  }
  const incomeByDay = Array.from(byDay.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([date, ingresos]) => ({ date, ingresos }));

  // 7) Tendencia por mes (respeta cliente, ignora month)
  let deliveredAllQuery = supabase
    .from("orders")
    .select("total, created_at, client_user_id")
    .eq("status", "entregado")
    .order("created_at", { ascending: true });

  if (selectedUserId) deliveredAllQuery = deliveredAllQuery.eq("client_user_id", selectedUserId);

  // Para no traer toda la historia: últimos 24 meses
  const from24 = new Date();
  from24.setUTCMonth(from24.getUTCMonth() - 24);
  deliveredAllQuery = deliveredAllQuery.gte("created_at", from24.toISOString());

  const { data: deliveredAll, error: daErr } = await deliveredAllQuery.limit(20000);
  if (daErr) return NextResponse.json({ error: daErr.message }, { status: 500 });

  const byMonth = new Map();
  for (const o of deliveredAll ?? []) {
    const k = ymKey(o.created_at);
    if (!k) continue;
    byMonth.set(k, (byMonth.get(k) || 0) + Number(o.total || 0));
  }
  const incomeByMonth = Array.from(byMonth.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([m, ingresos]) => ({ month: m, ingresos }));

  // 8) Participación por cliente (según month o global)
  //    Aquí sí conviene hacerlo con entregados, no con todas.
  let shareQuery = supabase
    .from("orders")
    .select("client_user_id, total, created_at")
    .eq("status", "entregado")
    .order("created_at", { ascending: false });

  if (month !== "ALL") {
    const [startISO, endISO] = monthRange(month);
    shareQuery = shareQuery.gte("created_at", startISO).lt("created_at", endISO);
  } else {
    // global => últimos 12 meses para no traer infinito
    const from12 = new Date();
    from12.setUTCMonth(from12.getUTCMonth() - 12);
    shareQuery = shareQuery.gte("created_at", from12.toISOString());
  }

  const { data: shareOrders, error: sErr } = await shareQuery.limit(20000);
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const totalsByClient = new Map(); // clients.id -> total
  for (const o of shareOrders ?? []) {
    const c = clientByUserId.get(String(o.client_user_id));
    if (!c) continue;
    const cid = String(c.id);
    totalsByClient.set(cid, (totalsByClient.get(cid) || 0) + Number(o.total || 0));
  }

  const grand = Array.from(totalsByClient.values()).reduce((a, b) => a + b, 0) || 0;

  const shareRows = Array.from(totalsByClient.entries())
    .map(([cid, total]) => {
      const c = clientById.get(String(cid));
      const name = c?.business_name || c?.owner_name || "Cliente";
      const pct = grand > 0 ? (total / grand) * 100 : 0;
      return { id: cid, name, total, pct };
    })
    .sort((a, b) => b.total - a.total);

  // 9) Listas: Pendientes + Actualizaciones (de lote reciente)
  const decorate = (o) => {
    const c = clientByUserId.get(String(o.client_user_id));
    return {
      id: o.id,
      status: o.status,
      total: Number(o.total || 0),
      created_at: o.created_at,
      clientName: c?.business_name || c?.owner_name || "—",
    };
  };

  const recentActive = safeRecent
    .filter((o) => STATUS_ACTIVE.has(norm(o.status)))
    .slice(0, 6)
    .map(decorate);

  const recentUpdates = safeRecent.slice(0, 6).map(decorate);

  // 10) response
  return NextResponse.json(
    {
      role: prof.role,
      kpis,
      months,
      clientOptions,
      incomeTotal,
      incomeByDay,
      incomeByMonth,
      shareRows,
      recentActive,
      recentUpdates,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
