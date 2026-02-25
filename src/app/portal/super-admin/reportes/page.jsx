"use client";

import { useEffect, useMemo, useState } from "react";

const BRAND_GREEN = "#31572c";

function statusLabel(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "pendiente") return "Pendiente";
  if (s === "confirmado") return "Confirmado";
  if (s === "en_preparacion") return "En preparación";
  if (s === "en_ruta") return "En ruta";
  if (s === "entregado") return "Entregado";
  if (s === "cancelado") return "Cancelado";
  return v || "—";
}

function pct(n, d) {
  const nn = Number(n || 0);
  const dd = Number(d || 0);
  if (!dd) return 0;
  return Number(((nn * 100) / dd).toFixed(1));
}

export default function SuperAdminReportesPage() {
  const [days, setDays] = useState(30);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [data, setData] = useState(null); // metrics by status
  const [flow, setFlow] = useState(null); // flow times

  async function loadMetrics(nextDays = days) {
    const r = await fetch(`/api/admin/orders/metrics?days=${encodeURIComponent(String(nextDays))}`, {
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error cargando métricas");
    return j;
  }

  async function loadFlow(nextDays = days) {
    const r = await fetch(`/api/admin/orders/metrics-flow?days=${encodeURIComponent(String(nextDays))}`, {
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error cargando métricas de flujo");
    return j;
  }

  async function loadAll(nextDays = days) {
    setLoading(true);
    setErr("");
    try {
      const [m, f] = await Promise.all([loadMetrics(nextDays), loadFlow(nextDays)]);
      setData(m);
      setFlow(f);
    } catch (e) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxStatus = useMemo(() => {
    const rows = data?.byStatus || [];
    return rows.reduce((m, r) => Math.max(m, Number(r.count || 0)), 0);
  }, [data]);

  const last7 = useMemo(() => {
    const rows = data?.byDay || [];
    return rows.slice(-7);
  }, [data]);

  const counts = useMemo(() => {
    const map = new Map();
    for (const r of data?.byStatus || []) map.set(String(r.status || ""), Number(r.count || 0));
    return map;
  }, [data]);

  const total = Number(data?.total || 0);
  const cancelados = counts.get("cancelado") || 0;
  const cancelRate = pct(cancelados, total);

  return (
    <section className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-black">Reportes</h1>
          <p className="text-sm text-gray-500">Métricas de pedidos por status (últimos {days} días).</p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={days}
            onChange={async (e) => {
              const v = Number(e.target.value || 30);
              setDays(v);
              await loadAll(v);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
          >
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
            <option value={180}>180 días</option>
          </select>

          <button
            onClick={() => loadAll(days)}
            disabled={loading}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: BRAND_GREEN }}
          >
            {loading ? "Cargando…" : "Recargar"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">Total pedidos (últimos {days} días)</div>
          <div className="text-2xl font-semibold text-black">{loading ? "—" : total}</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">Cancelación</div>
          <div className="text-2xl font-semibold text-black">{loading ? "—" : `${cancelRate}%`}</div>
          <div className="text-xs text-gray-400">{loading ? "" : `${cancelados} de ${total}`}</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">Promedio Pendiente → Confirmado</div>
          <div className="text-2xl font-semibold text-black">
            {loading ? "—" : `${Number(flow?.avg_pending_to_confirmed_hours || 0).toFixed(2)} hrs`}
          </div>
          <div className="text-xs text-gray-400">
            {loading ? "" : `Muestra: ${flow?.n_pending_to_confirmed || 0}`}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500">Promedio Confirmado → Entregado</div>
          <div className="text-2xl font-semibold text-black">
            {loading ? "—" : `${Number(flow?.avg_confirmed_to_delivered_hours || 0).toFixed(2)} hrs`}
          </div>
          <div className="text-xs text-gray-400">
            {loading ? "" : `Muestra: ${flow?.n_confirmed_to_delivered || 0}`}
          </div>
        </div>
      </div>

      {/* Últimos 7 días */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Últimos 7 días (conteo diario)</div>
        <div className="grid grid-cols-7 gap-2">
          {(last7 || []).map((d) => (
            <div key={d.day} className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-center">
              <div className="text-[10px] text-gray-500">{String(d.day || "").slice(5)}</div>
              <div className="text-sm font-semibold text-black">{d.count}</div>
            </div>
          ))}
          {!loading && (last7 || []).length === 0 ? (
            <div className="text-sm text-gray-600">Sin datos.</div>
          ) : null}
        </div>
      </div>

      {/* Barras por status */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-xs font-semibold text-gray-700 mb-3">Pedidos por status</div>

        {loading ? (
          <div className="text-sm text-gray-600">Cargando…</div>
        ) : (data?.byStatus || []).length === 0 ? (
          <div className="text-sm text-gray-600">Sin datos.</div>
        ) : (
          <div className="space-y-2">
            {(data?.byStatus || []).map((r) => {
              const pctWidth = maxStatus ? Math.round((Number(r.count || 0) * 100) / maxStatus) : 0;
              return (
                <div key={r.status} className="flex items-center gap-3">
                  <div className="w-[140px] text-sm font-semibold text-black">
                    {statusLabel(r.status)}
                  </div>

                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                    <div className="h-full" style={{ width: `${pctWidth}%`, background: BRAND_GREEN }} />
                  </div>

                  <div className="w-[60px] text-right text-sm font-semibold text-black">
                    {r.count}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown extra (opcional) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Tiempos por etapa (si existen datos)</div>
        {loading ? (
          <div className="text-sm text-gray-600">Cargando…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Confirmado → En preparación</div>
              <div className="text-lg font-semibold text-black">
                {Number(flow?.avg_confirmed_to_en_preparacion_hours || 0).toFixed(2)} hrs
              </div>
              <div className="text-[11px] text-gray-500">Muestra: {flow?.n_confirmed_to_en_preparacion || 0}</div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs text-gray-500">En preparación → En ruta</div>
              <div className="text-lg font-semibold text-black">
                {Number(flow?.avg_en_preparacion_to_en_ruta_hours || 0).toFixed(2)} hrs
              </div>
              <div className="text-[11px] text-gray-500">Muestra: {flow?.n_en_preparacion_to_en_ruta || 0}</div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs text-gray-500">En ruta → Entregado</div>
              <div className="text-lg font-semibold text-black">
                {Number(flow?.avg_en_ruta_to_delivered_hours || 0).toFixed(2)} hrs
              </div>
              <div className="text-[11px] text-gray-500">Muestra: {flow?.n_en_ruta_to_delivered || 0}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}