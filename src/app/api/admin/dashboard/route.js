import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

export async function GET(req) {
  const supabase = await supabaseServer();

  // 1) Auth
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "No auth" }, { status: 401 });

  // 2) Role check (NOTA: tu rol real es super_admin, no super-admin)
  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .single();

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
  if (prof?.active === false) return NextResponse.json({ error: "Usuario desactivado" }, { status: 403 });
  if (!["admin", "super_admin"].includes(prof?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3) Filtros (query params)
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || "ALL";   // "ALL" | "YYYY-MM"
  const clientId = searchParams.get("client") || "ALL"; // "ALL" | clients.id

  // 4) Clients (para dropdown + nombres)
  const { data: clients, error: ce } = await supabase
    .from("clients")
    .select("id, user_id, business_name, owner_name, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (ce) return NextResponse.json({ error: ce.message }, { status: 500 });

  const clientByUserId = new Map();
  for (const c of clients ?? []) clientByUserId.set(String(c.user_id), c);

  // 5) Orders
  const { data: orders, error: oe } = await supabase
    .from("orders")
    .select("id, client_user_id, status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (oe) return NextResponse.json({ error: oe.message }, { status: 500 });

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeClients = Array.isArray(clients) ? clients : [];

  // Helper: clientId -> user_id
  const selectedClient =
    clientId === "ALL" ? null : safeClients.find((c) => String(c.id) === String(clientId));
  const selectedUserId = selectedClient ? String(selectedClient.user_id) : null;

  // 6) KPIs
  const kpis = {
    activos: safeOrders.filter((o) => STATUS_ACTIVE.has(norm(o.status))).length,
    entregados: safeOrders.filter((o) => STATUS_DELIVERED.has(norm(o.status))).length,
    cancelados: safeOrders.filter((o) => STATUS_CANCELLED.has(norm(o.status))).length,
  };

  // 7) Months para dropdown
  const monthsSet = new Set();
  for (const o of safeOrders) {
    const k = ymKey(o.created_at);
    if (k) monthsSet.add(k);
  }
  const months = Array.from(monthsSet).sort((a, b) => (a > b ? -1 : 1));

  // 8) Client options para dropdown
  const clientOptions = safeClients
    .map((c) => ({
      id: String(c.id),
      label: String(c.business_name || c.owner_name || "Cliente"),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  // 9) Ingresos (solo entregados)
  let delivered = safeOrders.filter((o) => STATUS_DELIVERED.has(norm(o.status)));

  if (month !== "ALL") delivered = delivered.filter((o) => ymKey(o.created_at) === month);
  if (selectedUserId) delivered = delivered.filter((o) => String(o.client_user_id) === selectedUserId);

  const incomeTotal = delivered.reduce((acc, o) => acc + Number(o.total || 0), 0);

  // 10) Ingresos por día (según filtros)
  const byDay = new Map();
  for (const o of delivered) {
    const key = dayKey(o.created_at);
    if (!key) continue;
    byDay.set(key, (byDay.get(key) || 0) + Number(o.total || 0));
  }
  const incomeByDay = Array.from(byDay.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([date, ingresos]) => ({ date, ingresos }));

  // 11) Ingresos por mes (tendencia) respeta cliente, ignora month
  let deliveredAll = safeOrders.filter((o) => STATUS_DELIVERED.has(norm(o.status)));
  if (selectedUserId) deliveredAll = deliveredAll.filter((o) => String(o.client_user_id) === selectedUserId);

  const byMonth = new Map();
  for (const o of deliveredAll) {
    const key = ymKey(o.created_at);
    if (!key) continue;
    byMonth.set(key, (byMonth.get(key) || 0) + Number(o.total || 0));
  }
  const incomeByMonth = Array.from(byMonth.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([m, ingresos]) => ({ month: m, ingresos }));

  // 12) Participación por cliente (según month o global)
  let baseShare = safeOrders.filter((o) => STATUS_DELIVERED.has(norm(o.status)));
  if (month !== "ALL") baseShare = baseShare.filter((o) => ymKey(o.created_at) === month);

  const totalsByClient = new Map(); // clients.id -> total
  for (const o of baseShare) {
    const c = clientByUserId.get(String(o.client_user_id));
    if (!c) continue;
    const cid = String(c.id);
    totalsByClient.set(cid, (totalsByClient.get(cid) || 0) + Number(o.total || 0));
  }

  const grand = Array.from(totalsByClient.values()).reduce((a, b) => a + b, 0) || 0;

  const shareRows = Array.from(totalsByClient.entries())
    .map(([cid, total]) => {
      const c = safeClients.find((x) => String(x.id) === String(cid));
      const name = c?.business_name || c?.owner_name || "Cliente";
      const pct = grand > 0 ? (total / grand) * 100 : 0;
      return { id: cid, name, total, pct };
    })
    .sort((a, b) => b.total - a.total);

  // 13) Listas: Pendientes recientes + Actualizaciones
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

  const recentActive = safeOrders
    .filter((o) => STATUS_ACTIVE.has(norm(o.status)))
    .slice(0, 6)
    .map(decorate);

  const recentUpdates = safeOrders.slice(0, 6).map(decorate);

  return NextResponse.json({
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
  });
}
