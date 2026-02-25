import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function safeStr(x) {
  return String(x ?? "").trim();
}

export async function GET(req) {
  const supabase = await supabaseServer();

  // Auth
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 401 });
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Role
  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 403 });
  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });

  const role = safeStr(prof.role).toLowerCase();
  if (!["admin", "superadmin", "super_admin"].includes(role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(180, Math.max(7, Number(searchParams.get("days") || 30)));

  const start = new Date();
  start.setDate(start.getDate() - days);

  // 1) Conteo por status (últimos N días)
  const { data: orders, error: oErr } = await supabaseAdmin
    .from("orders")
    .select("status, created_at")
    .gte("created_at", start.toISOString());

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 400 });

  const byStatus = {};
  const byDay = {}; // YYYY-MM-DD -> count
  for (const o of orders || []) {
    const s = safeStr(o.status).toLowerCase() || "—";
    byStatus[s] = (byStatus[s] || 0) + 1;

    const d = new Date(o.created_at);
    if (!Number.isNaN(d.getTime())) {
      const key = d.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + 1;
    }
  }

  // Convertir a arrays ordenados
  const statusRows = Object.entries(byStatus)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  const dayRows = Object.entries(byDay)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));

  return NextResponse.json({
    days,
    total: (orders || []).length,
    byStatus: statusRows,
    byDay: dayRows,
  });
}