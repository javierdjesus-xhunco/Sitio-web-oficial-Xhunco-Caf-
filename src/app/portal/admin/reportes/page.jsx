"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function isoDateInput(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function download(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.error || "Error");
  return j;
}

export default function AdminReportesPage() {
  const now = new Date();
  const [start, setStart] = useState(() =>
    isoDateInput(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
  );
  const [end, setEnd] = useState(() => isoDateInput(now));

  const [business, setBusiness] = useState("");

  const [monthRows, setMonthRows] = useState([]);
  const [dayRows, setDayRows] = useState([]);
  const [bizRows, setBizRows] = useState([]);

  const [kpis, setKpis] = useState(null);

  const [detailRows, setDetailRows] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [err, setErr] = useState("");

  const baseQS = useMemo(() => {
    const endPlus = new Date(`${end}T00:00:00.000Z`);
    endPlus.setUTCDate(endPlus.getUTCDate() + 1);

    const s = new URLSearchParams();
    s.set("start", new Date(`${start}T00:00:00.000Z`).toISOString());
    s.set("end", endPlus.toISOString());
    return s;
  }, [start, end]);

  const loadTop = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const qs = baseQS.toString();
      const businessQS = business ? `&business=${encodeURIComponent(business)}` : "";

      const [m, d, b, k] = await Promise.all([
        fetchJSON(`/api/admin/reportes/ingresos-mensuales?report=month&${qs}`),
        fetchJSON(`/api/admin/reportes/ingresos-mensuales?report=day&${qs}`),
        fetchJSON(`/api/admin/reportes/ingresos-mensuales?report=business&${qs}`),
        fetchJSON(`/api/admin/reportes/ingresos-mensuales?report=kpis&${qs}${businessQS}`),
      ]);

      setMonthRows(m.data || []);
      setDayRows(d.data || []);
      setBizRows(b.data || []);
      setKpis(k.data && k.data[0] ? k.data[0] : null);
    } catch (e) {
      setErr(e?.message || "Error cargando reportes");
    } finally {
      setLoading(false);
    }
  }, [baseQS, business]);

  const loadDetail = useCallback(
    async (nextOffset = offset) => {
      setErr("");
      setLoadingDetail(true);
      try {
        const qs = new URLSearchParams(baseQS);
        qs.set("report", "orders_detail");
        qs.set("limit", String(limit));
        qs.set("offset", String(nextOffset));
        if (business) qs.set("business", business);

        const j = await fetchJSON(
          `/api/admin/reportes/ingresos-mensuales?${qs.toString()}`
        );
        setDetailRows(j.data || []);
        setOffset(nextOffset);
      } catch (e) {
        setErr(e?.message || "Error cargando detalle");
      } finally {
        setLoadingDetail(false);
      }
    },
    [baseQS, business, limit, offset]
  );

  useEffect(() => {
    loadTop();
    loadDetail(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTop]);

  useEffect(() => {
    loadDetail(0);
    loadTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, limit]);

  const totals = useMemo(() => {
    const sumRevenue = (rows) =>
      rows.reduce((acc, r) => acc + Number(r?.revenue || 0), 0);
    const sumOrders = (rows) =>
      rows.reduce((acc, r) => acc + Number(r?.orders_count || 0), 0);

    return {
      month: { orders: sumOrders(monthRows), revenue: sumRevenue(monthRows) },
      day: { orders: sumOrders(dayRows), revenue: sumRevenue(dayRows) },
      biz: { orders: sumOrders(bizRows), revenue: sumRevenue(bizRows) },
    };
  }, [monthRows, dayRows, bizRows]);

  const businessOptions = useMemo(() => {
    return (bizRows || []).map((r) => ({
      id: r.client_user_id,
      name: r.business_name,
    }));
  }, [bizRows]);

  const csvUrl = useCallback(
    (report) => {
      const qs = new URLSearchParams(baseQS);
      qs.set("report", report);
      qs.set("format", "csv");

      if (report === "kpis" && business) {
        qs.set("business", business);
      }

      if (report === "orders_detail") {
        qs.set("limit", String(limit));
        qs.set("offset", String(offset));
        if (business) qs.set("business", business);
      }

      return `/api/admin/reportes/ingresos-mensuales?${qs.toString()}`;
    },
    [baseQS, business, limit, offset]
  );

  const kpiSubtitle = business
    ? `Filtrado por negocio seleccionado`
    : `Global en el rango`;

  return (
    <div className="w-full p-6">
      <div className="max-w-[1680px]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Reportes</h1>
              <p className="text-sm text-neutral-600">
                Ventas, ingresos reales (solo pagados) y detalle de pedidos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="flex flex-col">
                <label className="text-xs text-neutral-600">Inicio</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="h-10 rounded-xl border border-neutral-200 px-3 text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-neutral-600">Fin</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="h-10 rounded-xl border border-neutral-200 px-3 text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-neutral-600">Negocio (detalle y KPIs)</label>
                <select
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  className="h-10 rounded-xl border border-neutral-200 px-3 text-sm"
                >
                  <option value="">Todos</option>
                  {businessOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  loadTop();
                  loadDetail(0);
                }}
                className="h-10 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Aplicar filtros"}
              </button>
            </div>
          </div>

          {err ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">KPIs</div>
                <div className="text-xs text-neutral-500">{kpiSubtitle}</div>
              </div>
              <button
                onClick={() => download(csvUrl("kpis"))}
                className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
                title="Descarga KPIs en CSV"
              >
                Descargar CSV
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card title="Ingreso real" subtitle="Solo pagados">
                <div className="text-2xl font-semibold">
                  {money(kpis?.revenue_paid)}
                </div>
              </Card>

              <Card
                title="Pedidos entregados"
                subtitle={`De ${kpis?.orders_total ?? 0} pedidos`}
              >
                <div className="text-2xl font-semibold">
                  {kpis?.orders_delivered ?? 0}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Cancelados: {kpis?.orders_cancelled ?? 0}
                </div>
              </Card>

              <Card
                title="% Cumplimiento"
                subtitle="Entregados / Total pedidos"
              >
                <div className="text-2xl font-semibold">
                  {Number(kpis?.fulfillment_pct ?? 0).toFixed(2)}%
                </div>
              </Card>

              <Card
                title="Ticket promedio real"
                subtitle="Ingreso real / pedidos pagados"
              >
                <div className="text-2xl font-semibold">
                  {money(kpis?.avg_ticket_paid)}
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card title="Ingreso real (agregado por mes)" subtitle={`${totals.month.orders} ventas (todas)`}>
              <div className="text-2xl font-semibold">{money(totals.month.revenue)}</div>
            </Card>
            <Card title="Ingreso real (agregado por día)" subtitle={`${totals.day.orders} ventas (todas)`}>
              <div className="text-2xl font-semibold">{money(totals.day.revenue)}</div>
            </Card>
            <Card title="Ingreso real por negocio (rango)" subtitle={`${totals.biz.orders} pedidos (todos)`}>
              <div className="text-2xl font-semibold">{money(totals.biz.revenue)}</div>
            </Card>
          </div>

          <Section
            title="Ventas e ingresos por mes"
            subtitle="Ingresos = solo pagados"
            actions={
              <button
                onClick={() => download(csvUrl("month"))}
                className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
              >
                Descargar CSV
              </button>
            }
          >
            <SimpleTable
              columns={[
                { key: "month", label: "Mes" },
                { key: "orders_count", label: "Ventas (todas)" },
                { key: "revenue", label: "Ingresos (pagados)", format: money },
              ]}
              rows={monthRows}
              empty={loading ? "Cargando..." : "Sin datos"}
            />
          </Section>

          <Section
            title="Ventas e ingresos por día"
            subtitle="Ingresos = solo pagados"
            actions={
              <button
                onClick={() => download(csvUrl("day"))}
                className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
              >
                Descargar CSV
              </button>
            }
          >
            <SimpleTable
              columns={[
                { key: "day", label: "Día" },
                { key: "orders_count", label: "Ventas (todas)" },
                { key: "revenue", label: "Ingresos (pagados)", format: money },
              ]}
              rows={dayRows}
              empty={loading ? "Cargando..." : "Sin datos"}
            />
          </Section>

          <Section
            title="Ingresos y pedidos por negocio"
            subtitle="Ingresos = solo pagados"
            actions={
              <button
                onClick={() => download(csvUrl("business"))}
                className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
              >
                Descargar CSV
              </button>
            }
          >
            <SimpleTable
              columns={[
                { key: "business_name", label: "Negocio" },
                { key: "orders_count", label: "Pedidos (todos)" },
                { key: "revenue", label: "Ingresos (pagados)", format: money },
              ]}
              rows={bizRows}
              empty={loading ? "Cargando..." : "Sin datos"}
            />
          </Section>

          <Section
            title="Detalle de pedidos (con artículos)"
            subtitle="CSV exporta 1 fila por artículo."
            actions={
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  className="h-9 rounded-xl border border-neutral-200 bg-white px-2 text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>

                <button
                  onClick={() => download(csvUrl("orders_detail"))}
                  className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
                >
                  Descargar CSV
                </button>

                <button
                  onClick={() => loadDetail(Math.max(offset - limit, 0))}
                  className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
                  disabled={loadingDetail || offset === 0}
                >
                  Anterior
                </button>
                <button
                  onClick={() => loadDetail(offset + limit)}
                  className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
                  disabled={loadingDetail}
                >
                  Siguiente
                </button>
              </div>
            }
          >
            <OrdersDetailTable rows={detailRows} loading={loadingDetail} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="text-sm text-neutral-600">{title}</div>
      <div className="text-xs text-neutral-500">{subtitle}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Section({ title, subtitle, actions, children }) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          {subtitle ? <div className="text-sm text-neutral-600">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-3">
        {children}
      </div>
    </div>
  );
}

function SimpleTable({ columns, rows, empty }) {
  if (!rows || rows.length === 0) {
    return <div className="p-4 text-sm text-neutral-600">{empty}</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-600">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b border-neutral-100 text-sm">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2">
                  {c.format ? c.format(r?.[c.key]) : String(r?.[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersDetailTable({ rows, loading }) {
  if (loading) return <div className="p-4 text-sm text-neutral-600">Cargando...</div>;
  if (!rows || rows.length === 0) return <div className="p-4 text-sm text-neutral-600">Sin pedidos</div>;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-600">
            <th className="px-3 py-2 font-medium">Pedido</th>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Negocio</th>
            <th className="px-3 py-2 font-medium">Estatus</th>
            <th className="px-3 py-2 font-medium">Total</th>
            <th className="px-3 py-2 font-medium">Resumen artículos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const items = Array.isArray(r.items) ? r.items : [];
            const resumen =
              items.length === 0
                ? "—"
                : items
                    .map((it) => {
                      const nombre = it?.nombre ?? "Artículo";
                      const qty = it?.qty ?? 0;
                      const line = it?.line_total ?? 0;
                      return `${nombre} x${qty} = ${money(line)}`;
                    })
                    .join(" | ");

            return (
              <tr key={r.order_id} className="border-b border-neutral-100 text-sm">
                <td className="px-3 py-2 font-mono text-xs">{r.order_id}</td>
                <td className="px-3 py-2">
                  {new Date(r.created_at).toLocaleString("es-MX")}
                </td>
                <td className="px-3 py-2">{r.business_name ?? "—"}</td>
                <td className="px-3 py-2">{r.status ?? "—"}</td>
                <td className="px-3 py-2">{money(r.total)}</td>
                <td className="px-3 py-2">{resumen}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}