import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function safeStr(x) {
  return String(x ?? "").trim();
}
function toLower(x) {
  return safeStr(x).toLowerCase();
}

function msToHours(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n / (1000 * 60 * 60);
}

function avgHoursFromDiffs(diffsMs) {
  let sum = 0;
  let n = 0;
  for (const d of diffsMs || []) {
    const v = Number(d);
    if (Number.isFinite(v) && v > 0) {
      sum += v;
      n += 1;
    }
  }
  const avg = n ? sum / n : 0;
  return { hours: n ? Number(msToHours(avg).toFixed(2)) : 0, n };
}

export async function GET(req) {
  const supabase = await supabaseServer();

  // ✅ Auth
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 401 });
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // ✅ Role check
  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 403 });

  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });

  const role = toLower(prof.role);
  if (!["admin", "superadmin", "super_admin"].includes(role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // ✅ Params
  const { searchParams } = new URL(req.url);
  const days = Math.min(180, Math.max(7, Number(searchParams.get("days") || 30)));

  const start = new Date();
  start.setDate(start.getDate() - days);
  const startISO = start.toISOString();

  /**
   * ✅ Fuente de verdad:
   * - Pendiente inicia en orders.created_at (porque siempre inician como pendiente)
   * - Confirmado / en_preparacion / en_ruta / entregado se obtienen del primer log donde to_status = X
   *
   * Métricas calculadas SOLO para pedidos creados dentro del rango (últimos N días).
   */

  // 1) Traer pedidos del rango
  const { data: orders, error: oErr } = await supabaseAdmin
    .from("orders")
    .select("id, created_at")
    .gte("created_at", startISO);

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 400 });

  const orderIds = (orders || []).map((o) => o.id).filter(Boolean);

  if (!orderIds.length) {
    return NextResponse.json({
      days,
      avg_pending_to_confirmed_hours: 0,
      n_pending_to_confirmed: 0,
      avg_confirmed_to_delivered_hours: 0,
      n_confirmed_to_delivered: 0,
      avg_confirmed_to_en_preparacion_hours: 0,
      n_confirmed_to_en_preparacion: 0,
      avg_en_preparacion_to_en_ruta_hours: 0,
      n_en_preparacion_to_en_ruta: 0,
      avg_en_ruta_to_delivered_hours: 0,
      n_en_ruta_to_delivered: 0,
    });
  }

  // 2) Traer logs de esos pedidos (no importa si son antiguos; pero normalmente estarán dentro del rango)
  const { data: logs, error: lErr } = await supabaseAdmin
    .from("order_status_logs")
    .select("order_id, to_status, created_at")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 400 });

  // Mapear orders.created_at
  const createdAtByOrder = new Map();
  for (const o of orders || []) {
    const d = new Date(o.created_at);
    if (!Number.isNaN(d.getTime())) createdAtByOrder.set(o.id, d);
  }

  // Para cada pedido, guardar el primer timestamp en que llegó a cada status (por logs)
  const firstByOrder = new Map(); // order_id -> { confirmado: Date, en_preparacion: Date, en_ruta: Date, entregado: Date }
  for (const lg of logs || []) {
    const oid = lg?.order_id;
    const st = toLower(lg?.to_status);
    if (!oid || !st) continue;

    // Solo nos interesan estos hitos
    if (!["confirmado", "en_preparacion", "en_ruta", "entregado"].includes(st)) continue;

    const d = new Date(lg.created_at);
    if (Number.isNaN(d.getTime())) continue;

    const obj = firstByOrder.get(oid) || {};
    if (!obj[st]) obj[st] = d; // primer hit
    firstByOrder.set(oid, obj);
  }

  // 3) Construir diffs
  const diff_pending_confirmed = [];
  const diff_confirmed_delivered = [];
  const diff_confirmed_preparacion = [];
  const diff_preparacion_ruta = [];
  const diff_ruta_delivered = [];

  for (const oid of orderIds) {
    const t0 = createdAtByOrder.get(oid); // pendiente (inicio)
    const t = firstByOrder.get(oid) || {};

    // pendiente -> confirmado : confirmado - created_at
    if (t0 && t.confirmado) diff_pending_confirmed.push(t.confirmado.getTime() - t0.getTime());

    // confirmado -> entregado
    if (t.confirmado && t.entregado) diff_confirmed_delivered.push(t.entregado.getTime() - t.confirmado.getTime());

    // confirmado -> en_preparacion
    if (t.confirmado && t.en_preparacion)
      diff_confirmed_preparacion.push(t.en_preparacion.getTime() - t.confirmado.getTime());

    // en_preparacion -> en_ruta
    if (t.en_preparacion && t.en_ruta)
      diff_preparacion_ruta.push(t.en_ruta.getTime() - t.en_preparacion.getTime());

    // en_ruta -> entregado
    if (t.en_ruta && t.entregado) diff_ruta_delivered.push(t.entregado.getTime() - t.en_ruta.getTime());
  }

  const a1 = avgHoursFromDiffs(diff_pending_confirmed);
  const a2 = avgHoursFromDiffs(diff_confirmed_delivered);
  const a3 = avgHoursFromDiffs(diff_confirmed_preparacion);
  const a4 = avgHoursFromDiffs(diff_preparacion_ruta);
  const a5 = avgHoursFromDiffs(diff_ruta_delivered);

  return NextResponse.json({
    days,

    avg_pending_to_confirmed_hours: a1.hours,
    n_pending_to_confirmed: a1.n,

    avg_confirmed_to_delivered_hours: a2.hours,
    n_confirmed_to_delivered: a2.n,

    avg_confirmed_to_en_preparacion_hours: a3.hours,
    n_confirmed_to_en_preparacion: a3.n,

    avg_en_preparacion_to_en_ruta_hours: a4.hours,
    n_en_preparacion_to_en_ruta: a4.n,

    avg_en_ruta_to_delivered_hours: a5.hours,
    n_en_ruta_to_delivered: a5.n,
  });
}