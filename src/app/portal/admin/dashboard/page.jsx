"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { DollarSign, Package, Truck, Ban, ChevronDown } from "lucide-react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

/** ✅ Recharts lazy (mejor performance / menor JS inicial) */
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const Sector = dynamic(() => import("recharts").then((m) => m.Sector), { ssr: false });

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}
function kFmt(n) {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return String(Math.round(v));
}
function prettyMonth(ym) {
  const [y, m] = String(ym).split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("es-MX", { year: "numeric", month: "long" });
}

/** UI helpers */
function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-[28px] border border-neutral-200 bg-white " +
        "shadow-[0_16px_50px_rgba(0,0,0,0.07)] " +
        "transition duration-300 hover:shadow-[0_22px_70px_rgba(0,0,0,0.10)] " +
        className
      }
    >
      {children}
    </div>
  );
}
function Chip({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-black">
      {children}
    </span>
  );
}
function Empty({ title = "Sin datos" }) {
  return (
    <div className="mt-4 flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-600">
      {title}
    </div>
  );
}
function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50"
        />
      ))}
    </div>
  );
}
function Row({ title, subtitle, meta }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4 hover:bg-neutral-50">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-black">{title}</div>
        <div className="truncate text-xs text-neutral-600">{subtitle}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-xs font-semibold text-black">{meta}</div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-[11px] font-semibold text-neutral-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-black">{money(value)}</div>
    </div>
  );
}

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 1}
        outerRadius={outerRadius + 11}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="rgba(0,0,0,0.06)"
      />
    </g>
  );
}

export default function AdminDashboard() {
  // ✅ Nombre + saludo dinámico (igual que super-admin)
  const [firstName, setFirstName] = useState("Usuario");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setFirstName(String(json?.first_name || "Usuario"));
      } catch {
        if (!alive) return;
        setFirstName("Usuario");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Buenos días";
    if (h >= 12 && h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [monthFilter, setMonthFilter] = useState("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");

  const [kpis, setKpis] = useState({ activos: 0, entregados: 0, cancelados: 0 });
  const [months, setMonths] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);

  const [incomeTotal, setIncomeTotal] = useState(0);
  const [incomeByDay, setIncomeByDay] = useState([]);
  const [incomeByMonth, setIncomeByMonth] = useState([]);
  const [shareRows, setShareRows] = useState([]);

  const [recentActive, setRecentActive] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);

  const [activePieIndex, setActivePieIndex] = useState(0);
  const [topN, setTopN] = useState(10);
  const [groupOthers, setGroupOthers] = useState(true);

  /** ✅ Abort + debounce (evita spam de requests) */
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // debounce 150ms
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      // abort anterior
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");

      try {
        const qs = new URLSearchParams();
        qs.set("month", monthFilter);
        qs.set("client", clientFilter);

        const res = await fetch(`/api/admin/dashboard?${qs.toString()}`, {
          method: "GET",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.error || "No se pudo cargar el dashboard");
          setLoading(false);
          return;
        }

        setKpis(data.kpis || { activos: 0, entregados: 0, cancelados: 0 });
        setMonths(Array.isArray(data.months) ? data.months : []);
        setClientOptions(Array.isArray(data.clientOptions) ? data.clientOptions : []);

        setIncomeTotal(Number(data.incomeTotal || 0));
        setIncomeByDay(Array.isArray(data.incomeByDay) ? data.incomeByDay : []);
        setIncomeByMonth(Array.isArray(data.incomeByMonth) ? data.incomeByMonth : []);
        setShareRows(Array.isArray(data.shareRows) ? data.shareRows : []);

        setRecentActive(
          Array.isArray(data.recentActive)
            ? data.recentActive
            : Array.isArray(data.recentPending)
            ? data.recentPending
            : []
        );
        setRecentUpdates(Array.isArray(data.recentUpdates) ? data.recentUpdates : []);

        setActivePieIndex(0);
        setLoading(false);
      } catch (e) {
        if (e?.name === "AbortError") return; // normal
        setError("Error cargando dashboard");
        setLoading(false);
      }
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [monthFilter, clientFilter]);

  const shareModel = useMemo(() => {
    const rows = Array.isArray(shareRows) ? shareRows : [];
    if (!rows.length) return { pie: [], list: [] };

    const top = rows.slice(0, topN);
    const rest = rows.slice(topN);
    const restTotal = rest.reduce((acc, r) => acc + Number(r.total || 0), 0);

    const pie = top.map((r) => ({ name: r.name, value: r.total }));
    if (groupOthers && restTotal > 0) pie.push({ name: "Otros", value: restTotal });

    return { pie, list: top };
  }, [shareRows, topN, groupOthers]);

  const monthLabel = monthFilter === "ALL" ? "Todos los meses" : prettyMonth(monthFilter);
  const clientLabel =
    clientFilter === "ALL"
      ? "Todos los clientes"
      : clientOptions.find((c) => String(c.id) === String(clientFilter))?.label || "Cliente";

  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          {/* ✅ Saludo dinámico */}
          <div className="text-sm text-neutral-600">Bienvenido, {firstName}</div>
          <div className="mt-1 text-xs text-neutral-500">{greeting}</div>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-black">
            Rendimiento de Xhunco®
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip>{monthLabel}</Chip>
            <Chip>{clientLabel}</Chip>
            {error ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {error}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/portal/admin/pedidos"
            className="rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            Ver pedidos
          </a>
          <a
            href="/portal/admin/reportes"
            className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-50"
          >
            Ver reportes
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            className="h-11 min-w-[190px] appearance-none rounded-full border border-neutral-200 bg-white px-4 pr-10 text-sm text-black outline-none hover:bg-neutral-50"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="ALL">Meses</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {prettyMonth(m)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        </div>

        <div className="relative">
          <select
            className="h-11 min-w-[240px] appearance-none rounded-full border border-neutral-200 bg-white px-4 pr-10 text-sm text-black outline-none hover:bg-neutral-50"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="ALL">Clientes</option>
            {clientOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        </div>

        <div className="ml-auto">
          <Card className="px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-black">
              <div className="text-sm font-semibold text-black">Total:</div>
              <DollarSign className="h-4 w-4" />
              {loading ? "—" : money(incomeTotal)}
            </div>
          </Card>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Pedidos Pendientes</div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-2">
              <Package className="h-5 w-5 text-black" />
            </div>
          </div>
          <div className="mt-4 text-5xl font-semibold text-black">
            {loading ? "—" : kpis.activos}
          </div>
          <div className="mt-2 text-xs text-neutral-600">
            Pendiente / Confirmado / En preparación
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Pedidos Entregados</div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-2">
              <Truck className="h-5 w-5 text-black" />
            </div>
          </div>
          <div className="mt-4 text-5xl font-semibold text-black">
            {loading ? "—" : kpis.entregados}
          </div>
          <div className="mt-2 text-xs text-neutral-600">Entregado</div>
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-12 rounded-full" style={{ backgroundColor: BRAND_GREEN }} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Pedidos Cancelados</div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-2">
              <Ban className="h-5 w-5 text-black" />
            </div>
          </div>
          <div className="mt-4 text-5xl font-semibold text-black">
            {loading ? "—" : kpis.cancelados}
          </div>
          <div className="mt-2 text-xs text-neutral-600">Pedidos cancelados</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 space-y-6">
        <Card className="p-6">
          <div className="text-lg font-semibold text-black">Ingresos por día</div>
          <div className="mt-1 text-sm text-neutral-600">Evolución según filtros</div>

          {!incomeByDay.length ? (
            <Empty title="Sin datos para ingresos por día." />
          ) : (
            <div className="mt-5 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={kFmt} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke={BRAND_GREEN}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <div className="text-lg font-semibold text-black">Ingresos por mes</div>

            {!incomeByMonth.length ? (
              <Empty title="Sin datos para ingresos por mes." />
            ) : (
              <div className="mt-5 h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={kFmt} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ingresos" fill={BRAND_GREEN} radius={[18, 18, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-black">Ingresos por cliente</div>
                <div className="mt-1 text-sm text-neutral-600">
                  {monthFilter === "ALL" ? "Global" : `Mes: ${prettyMonth(monthFilter)}`}
                </div>
              </div>
            </div>

            {!shareModel.pie.length ? (
              <Empty title="Sin datos de participación." />
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                <div className="relative h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(v) => money(v)} />
                      <Pie
                        data={shareModel.pie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={92}
                        outerRadius={118}
                        paddingAngle={3}
                        activeIndex={Math.min(activePieIndex, shareModel.pie.length - 1)}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                        stroke="white"
                        strokeWidth={2}
                      >
                        {shareModel.pie.map((_, idx) => (
                          <Cell key={idx} fill={idx % 2 === 0 ? BRAND_GREEN : BRAND_GREEN_DARK} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[11px] text-neutral-600">Total</div>
                    <div className="mt-1 text-xl font-semibold text-black">
                      {loading ? "—" : money(incomeTotal)}
                    </div>
                    <div className="mt-1 text-[10px] text-neutral-600">
                      {monthFilter === "ALL" ? "Global" : prettyMonth(monthFilter)}
                    </div>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-auto space-y-2 pr-1">
                  {shareModel.list.map((r, idx) => (
                    <button
                      key={r.id}
                      type="button"
                      onMouseEnter={() => setActivePieIndex(idx)}
                      onClick={() => setActivePieIndex(idx)}
                      className="w-full text-left flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 transition hover:bg-neutral-50"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: idx % 2 === 0 ? BRAND_GREEN : BRAND_GREEN }}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-black">{r.name}</div>
                          <div className="text-xs text-neutral-600">{money(r.total)}</div>
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-black">
                        {Number(r.pct || 0).toFixed(1)}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Pendientes + Actualizaciones */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-sm font-semibold text-black">Pedidos Pendientes</div>
          <div className="mt-1 text-sm text-neutral-600">Últimos pedidos Pendiente.</div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <SkeletonRows />
            ) : recentActive.length === 0 ? (
              <div className="text-sm text-neutral-600">Sin pendientes recientes.</div>
            ) : (
              recentActive.slice(0, 6).map((o) => (
                <Row
                  key={o.id}
                  title={`Pedido ${String(o.id).slice(0, 8)}…`}
                  subtitle={new Date(o.created_at).toLocaleString("es-MX")}
                  meta={`${String(o.status || "—")} · ${money(o.total || 0)}`}
                />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-semibold text-black">Actualizaciones de Pedidos</div>
          <div className="mt-1 text-sm text-neutral-600">Actividad reciente (últimos pedidos).</div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <SkeletonRows />
            ) : recentUpdates.length === 0 ? (
              <div className="text-sm text-neutral-600">Sin actividad reciente.</div>
            ) : (
              recentUpdates.slice(0, 6).map((o) => (
                <Row
                  key={o.id}
                  title={`Pedido ${String(o.id).slice(0, 8)}…`}
                  subtitle={new Date(o.created_at).toLocaleString("es-MX")}
                  meta={`${String(o.status || "—")} · ${money(o.total || 0)}`}
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}