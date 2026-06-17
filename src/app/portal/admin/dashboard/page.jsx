"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Ban,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  DollarSign,
  Package,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import("recharts").then((m) => m.Line), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function numberFmt(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX");
}

function kFmt(n) {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return String(Math.round(v));
}

function prettyMonth(ym) {
  if (!ym || !String(ym).includes("-")) return "Mes actual";

  const [y, m] = String(ym).split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);

  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
  });
}

function statusLabel(status) {
  const s = String(status || "").toLowerCase();

  const labels = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    en_preparacion: "En preparación",
    en_ruta: "En ruta",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  return labels[s] || status || "—";
}

function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-[22px] border border-neutral-200 bg-white " +
        "shadow-sm transition duration-300 hover:shadow-md " +
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
    <div className="mt-4 flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center text-sm text-neutral-600">
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

function KpiCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card className="min-h-[145px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500">
          {title}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-2">
          <Icon className="h-4 w-4 text-[#31572c]" />
        </div>
      </div>

      <div className="mt-4 text-[30px] font-semibold leading-none tracking-tight text-black tabular-nums">
        {value}
      </div>

      {subtitle ? (
        <div className="mt-3 text-xs leading-5 text-[#31572c]">
          {subtitle}
        </div>
      ) : null}
    </Card>
  );
}

function Row({ title, subtitle, meta, href }) {
  const content = (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4 transition hover:bg-neutral-50">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-black">{title}</div>
        <div className="mt-1 truncate text-xs text-neutral-600">{subtitle}</div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-xs font-semibold text-black">{meta}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

function AlertRow({ alert }) {
  const isHigh = alert?.level === "high";

  return (
    <a
      href={alert?.href || "#"}
      className={
        "block rounded-2xl border p-4 transition hover:-translate-y-0.5 " +
        (isHigh
          ? "border-red-200 bg-red-50 hover:bg-red-100"
          : "border-amber-200 bg-amber-50 hover:bg-amber-100")
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            "mt-0.5 rounded-xl p-2 " +
            (isHigh ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")
          }
        >
          <AlertTriangle className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div
            className={
              "text-sm font-semibold " +
              (isHigh ? "text-red-800" : "text-amber-800")
            }
          >
            {alert?.title || "Alerta"}
          </div>
          <div
            className={
              "mt-1 text-xs " +
              (isHigh ? "text-red-700" : "text-amber-700")
            }
          >
            {alert?.subtitle || ""}
          </div>
        </div>
      </div>
    </a>
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

export default function AdminDashboardPage() {
  const [firstName, setFirstName] = useState("Usuario");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [monthFilter, setMonthFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");

  const [kpis, setKpis] = useState({});
  const [filters, setFilters] = useState({
    month: "",
    clients: [],
    client_user_id: "",
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMonthSummary, setSelectedMonthSummary] = useState({});
  const [salesByDay, setSalesByDay] = useState([]);
  const [topClientsByMonth, setTopClientsByMonth] = useState([]);
  const [topProductsPeriod, setTopProductsPeriod] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    let alive = true;

    async function loadMe() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const json = await res.json();

        if (!alive) return;

        setFirstName(String(json?.first_name || "Usuario"));
      } catch {
        if (!alive) return;
        setFirstName("Usuario");
      }
    }

    loadMe();

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");

      try {
        const qs = new URLSearchParams();

        if (monthFilter) {
          qs.set("month", monthFilter);
        }

        if (clientFilter) {
          qs.set("client_user_id", clientFilter);
        }

        const res = await fetch(`/api/admin/dashboard?${qs.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.error || "No se pudo cargar el dashboard");
          setLoading(false);
          return;
        }

        setKpis(data?.kpis || {});
        setFilters(data?.filters || { month: "", clients: [] });
        setSelectedClient(data?.selectedClient || null);
        setSelectedMonthSummary(data?.selectedMonthSummary || {});
        setSalesByDay(Array.isArray(data?.salesByDay) ? data.salesByDay : []);
        setTopClientsByMonth(
          Array.isArray(data?.topClientsByMonth) ? data.topClientsByMonth : []
        );
        setTopProductsPeriod(
          Array.isArray(data?.topProductsPeriod) ? data.topProductsPeriod : []
        );
        setRecentOrders(Array.isArray(data?.recentOrders) ? data.recentOrders : []);
        setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);

        if (!monthFilter && data?.filters?.month) {
          setMonthFilter(data.filters.month);
        }

        setLoading(false);
      } catch (e) {
        if (e?.name === "AbortError") return;

        setError("Error cargando dashboard");
        setLoading(false);
      }
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [monthFilter, clientFilter]);

  const clients = Array.isArray(filters?.clients) ? filters.clients : [];

  const monthLabel = filters?.month
    ? prettyMonth(filters.month)
    : monthFilter
    ? prettyMonth(monthFilter)
    : "Mes actual";

  const clientLabel = selectedClient?.label || "Todos los clientes";

  const totalRevenue = Number(selectedMonthSummary?.totalSpent || 0);
  const paidRevenue = Number(selectedMonthSummary?.paidSpent || 0);
  const ordersCount = Number(selectedMonthSummary?.ordersCount || 0);
  const avgTicket = Number(selectedMonthSummary?.avgTicket || 0);

  const salesByDayChart = useMemo(() => {
    return (salesByDay || []).map((row) => ({
      day: row.day,
      total: Number(row.total || 0),
    }));
  }, [salesByDay]);

  const topClientsChart = useMemo(() => {
    return (topClientsByMonth || []).slice(0, 8).map((row) => ({
      name: row.label || "Cliente",
      total: Number(row.total || 0),
    }));
  }, [topClientsByMonth]);

  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm text-neutral-600">Bienvenid@, {firstName}</div>
          <div className="mt-1 text-xs text-neutral-500">{greeting}</div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black md:text-4xl">
            Rendimiento de Xhunco®
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Vista general de clientes, pedidos, ventas, productos e inventario.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip>
              <CalendarDays className="h-3.5 w-3.5" />
              {monthLabel}
            </Chip>

            <Chip>
              <Users className="h-3.5 w-3.5" />
              {clientLabel}
            </Chip>

            {error ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {error}
              </span>
            ) : null}
          </div>
        </div>

        {/* Acciones permitidas para admin */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/portal/admin/pedidos"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            <ClipboardList className="h-4 w-4" />
            Ver pedidos
          </a>

          <a
            href="/portal/admin/reportes"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-50"
          >
            <BarChart3 className="h-4 w-4" />
            Ver reportes
          </a>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
       <div className="relative">
  <input
    type="month"
    className="h-11 min-w-[210px] rounded-full border border-neutral-200 bg-white px-4 text-sm text-black outline-none transition hover:bg-neutral-50 focus:border-[#31572c] focus:ring-2 focus:ring-[#31572c]/15"
    value={monthFilter || filters?.month || ""}
    onChange={(e) => setMonthFilter(e.target.value)}
  />
</div>

        <div className="relative">
          <select
            className="h-11 min-w-[260px] appearance-none rounded-full border border-neutral-200 bg-white px-4 pr-10 text-sm text-black outline-none hover:bg-neutral-50"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="">Todos los clientes</option>

            {clients.map((client) => (
              <option key={client.user_id} value={client.user_id}>
                {client.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        </div>

        <div className="ml-auto">
          <Card className="px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-black">
              <DollarSign className="h-4 w-4" />
              Total vendido:
              <span>{loading ? "—" : money(totalRevenue)}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* KPIs */}
<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
  <KpiCard
    title="Clientes activos"
    value={loading ? "—" : numberFmt(kpis.activeClients)}
    subtitle={`${numberFmt(kpis.newClientsThisMonth)} nuevos este mes`}
    icon={Users}
  />

  <KpiCard
    title="Pedidos activos"
    value={loading ? "—" : numberFmt(kpis.activeOrders)}
    subtitle="Pendiente / confirmado / preparación / ruta"
    icon={Package}
  />

  <KpiCard
    title="Ventas del mes"
    value={loading ? "—" : money(totalRevenue)}
    subtitle={`${numberFmt(ordersCount)} pedidos · ticket ${money(avgTicket)}`}
    icon={DollarSign}
  />

  <KpiCard
    title="Productos activos"
    value={loading ? "—" : numberFmt(kpis.totalProducts)}
    subtitle={`${numberFmt(kpis.lowStock)} bajos · ${numberFmt(
      kpis.outOfStock
    )} sin stock`}
    icon={ShoppingBag}
  />

  <KpiCard
    title="Pedidos entregados"
    value={loading ? "—" : numberFmt(kpis.deliveredOrders)}
    subtitle="Pedidos finalizados"
    icon={Truck}
  />

  <KpiCard
    title="Pedidos cancelados"
    value={loading ? "—" : numberFmt(kpis.cancelledOrders)}
    subtitle="Pedidos cancelados"
    icon={Ban}
  />

  <KpiCard
    title="Ventas pagadas"
    value={loading ? "—" : money(paidRevenue)}
    subtitle="Ingresos conciliados del periodo"
    icon={DollarSign}
  />

  <KpiCard
    title="Pedidos del periodo"
    value={loading ? "—" : numberFmt(ordersCount)}
    subtitle={monthLabel}
    icon={ClipboardList}
  />

  <KpiCard
    title="Ticket promedio"
    value={loading ? "—" : money(avgTicket)}
    subtitle="Promedio por pedido"
    icon={BarChart3}
  />
</div>

      {/* Gráficas */}
      <div className="mt-6 space-y-6">
        <Card className="p-6">
          <div className="text-lg font-semibold text-black">Ventas por día</div>
          <div className="mt-1 text-sm text-neutral-600">
            Evolución diaria del periodo seleccionado.
          </div>

          {!salesByDayChart.length ? (
            <Empty title="Sin datos de ventas por día." />
          ) : (
            <div className="mt-5 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesByDayChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={kFmt} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
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
            <div className="text-lg font-semibold text-black">Clientes con mayor compra</div>
            <div className="mt-1 text-sm text-neutral-600">
              Ranking por monto vendido en el periodo.
            </div>

            {!topClientsChart.length ? (
              <Empty title="Sin datos de clientes para este periodo." />
            ) : (
              <div className="mt-5 h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topClientsChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-12}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={kFmt} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" fill={BRAND_GREEN} radius={[18, 18, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="text-lg font-semibold text-black">Productos más vendidos</div>
            <div className="mt-1 text-sm text-neutral-600">
              Productos con mayor venta en el periodo.
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <SkeletonRows />
              ) : topProductsPeriod.length === 0 ? (
                <Empty title="Sin productos vendidos para este periodo." />
              ) : (
                topProductsPeriod.slice(0, 8).map((product) => (
                  <Row
                    key={product.suministro_id}
                    title={product.nombre || "Producto"}
                    subtitle={
                      product.subtitle
                        ? `${product.subtitle} · ${numberFmt(product.qty)} unidades`
                        : `${numberFmt(product.qty)} unidades`
                    }
                    meta={money(product.total)}
                  />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Alertas + pedidos recientes */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-sm font-semibold text-black">Alertas operativas</div>
          <div className="mt-1 text-sm text-neutral-600">
            Inventario, stock y cobranza.
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <SkeletonRows />
            ) : alerts.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                Sin alertas por el momento.
              </div>
            ) : (
              alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-semibold text-black">Pedidos recientes</div>
          <div className="mt-1 text-sm text-neutral-600">
            Últimos pedidos registrados.
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <SkeletonRows />
            ) : recentOrders.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                Sin pedidos recientes.
              </div>
            ) : (
              recentOrders.slice(0, 6).map((order) => (
                <Row
                  key={order.id}
                  href={`/portal/admin/pedidos`}
                  title={order.negocio_nombre || "Cliente"}
                  subtitle={`Pedido ${String(order.id).slice(0, 8)}… · ${new Date(
                    order.created_at
                  ).toLocaleString("es-MX")}`}
                  meta={`${statusLabel(order.status)} · ${money(order.total)}`}
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}