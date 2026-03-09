"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  BadgeDollarSign,
  ShieldCheck,
  ClipboardList,
  Loader2,
  Activity,
  AlertTriangle,
  PackageX,
  Clock3,
  CircleDollarSign,
  Users,
  ShoppingCart,
  Package,
  Boxes,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Filter,
  CalendarDays,
  UserRound,
  BarChart3,
  Coffee,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const BRAND_GREEN = "#31572c";

function formatMoney(value) {
  const n = Number(value || 0);
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function statusLabel(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "en_preparacion") return "En preparación";
  if (s === "en_ruta") return "En ruta";
  if (!s) return "Sin estatus";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function paymentLabel(paymentStatus) {
  const s = String(paymentStatus || "").trim().toLowerCase();
  if (s === "paid") return "Pagado";
  if (s === "pending") return "Pendiente";
  return "Sin definir";
}

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(yyyymm) {
  const [year, month] = String(yyyymm || "").split("-");
  const y = Number(year);
  const m = Number(month);
  if (!y || !m) return "Mes seleccionado";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, 1));
  } catch {
    return "Mes seleccionado";
  }
}

export default function SuperAdminDashboardPage() {
  const [firstName, setFirstName] = useState("Usuario");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
  const [selectedClientUserId, setSelectedClientUserId] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const qs = new URLSearchParams();
        if (selectedMonth) qs.set("month", selectedMonth);
        if (selectedClientUserId) qs.set("client_user_id", selectedClientUserId);

        const res = await fetch(`/api/superadmin/dashboard?${qs.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json();

        if (!alive) return;

        if (!res.ok) {
          throw new Error(json?.error || "No se pudo cargar el dashboard");
        }

        setDashboard(json);
        setFirstName(String(json?.user?.first_name || "Usuario"));
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "No se pudo cargar el dashboard");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      alive = false;
    };
  }, [selectedMonth, selectedClientUserId]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Buenos días";
    if (h >= 12 && h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const kpis = dashboard?.kpis || {
    activeClients: 0,
    newClientsThisMonth: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    monthRevenue: 0,
    paidMonthRevenue: 0,
    pendingPaymentOrders: 0,
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
  };

  const filters = dashboard?.filters || {
    month: selectedMonth,
    client_user_id: selectedClientUserId,
    clients: [],
  };

  const selectedClient = dashboard?.selectedClient || null;

  const selectedMonthSummary = dashboard?.selectedMonthSummary || {
    month: selectedMonth,
    ordersCount: 0,
    totalSpent: 0,
    paidSpent: 0,
    avgTicket: 0,
  };

  const alerts = Array.isArray(dashboard?.alerts) ? dashboard.alerts : [];
  const salesByDay = Array.isArray(dashboard?.salesByDay) ? dashboard.salesByDay : [];
  const topClientsByMonth = Array.isArray(dashboard?.topClientsByMonth)
    ? dashboard.topClientsByMonth
    : [];
  const topProductsPeriod = Array.isArray(dashboard?.topProductsPeriod)
    ? dashboard.topProductsPeriod
    : [];
  const recentOrders = Array.isArray(dashboard?.recentOrders) ? dashboard.recentOrders : [];
  const recentActivity = Array.isArray(dashboard?.recentActivity)
    ? dashboard.recentActivity
    : [];

  const graphTitle = selectedClient
    ? `Consumo diario de ${selectedClient.label}`
    : "Ventas diarias de todos los clientes";

  const graphSubtitle = selectedClient
    ? `Visualiza cuánto consumió este cliente en ${monthLabel(selectedMonthSummary.month)}.`
    : `Visualiza las ventas acumuladas por día en ${monthLabel(selectedMonthSummary.month)}.`;

  const productBlockTitle = selectedClient
    ? `Top productos de ${selectedClient.label}`
    : `Top productos del periodo`;

  const productBlockSubtitle = selectedClient
    ? `Productos más consumidos por este cliente en ${monthLabel(selectedMonthSummary.month)}.`
    : `Productos con mayor consumo acumulado en ${monthLabel(selectedMonthSummary.month)}.`;

  return (
    <div className="w-full min-h-[calc(100vh-0px)] flex flex-col">
      <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7 lg:p-8">
        <div className="text-sm text-black/60">
          <div>Bienvenido, {firstName}</div>
          <div className="mt-1 text-xs text-black/40">{greeting}</div>
        </div>

        <div className="mt-2 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black">
              Panel de control
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-black/60">
              Supervisa clientes, pedidos, inventario y cobranza desde un solo lugar.
              Filtra por cliente y mes para analizar consumo, comparativos y productos más vendidos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
            <ActionButton
              href="/portal/super-admin/clientes/nuevo"
              label="Crear cliente"
              icon={UserPlus}
              desc="Alta de clientes y datos comerciales"
            />
            <ActionButton
              href="/portal/super-admin/suministros"
              label="Actualizar precios"
              icon={BadgeDollarSign}
              desc="Catálogo, costos y listas"
            />
            <ActionButton
              href="/portal/super-admin/usuarios-y-roles"
              label="Asignar roles"
              icon={ShieldCheck}
              desc="Permisos y usuarios internos"
            />
            <ActionButton
              href="/portal/super-admin/pedidos"
              label="Revisar pedidos"
              icon={ClipboardList}
              desc="Seguimiento y estatus"
            />
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <KPI
            title="CLIENTES ACTIVOS"
            value={loading ? "—" : String(kpis.activeClients)}
            note={loading ? "Cargando..." : `+${kpis.newClientsThisMonth} este mes`}
            icon={Users}
            href="/portal/super-admin/clientes"
          />

          <KPI
            title="PEDIDOS ACTIVOS"
            value={loading ? "—" : String(kpis.activeOrders)}
            note={loading ? "Cargando..." : `${kpis.deliveredOrders} entregados`}
            icon={ShoppingCart}
            href="/portal/super-admin/pedidos"
          />

          <KPI
            title="VENTAS DEL MES"
            value={loading ? "—" : formatMoney(kpis.monthRevenue)}
            note={loading ? "Cargando..." : `${kpis.cancelledOrders} cancelados`}
            icon={CircleDollarSign}
            href="/portal/super-admin/pedidos"
          />

          <KPI
            title="COBRADO DEL MES"
            value={loading ? "—" : formatMoney(kpis.paidMonthRevenue)}
            note={
              loading
                ? "Cargando..."
                : `${kpis.pendingPaymentOrders} pendientes de pago`
            }
            icon={CheckCircle2}
            href="/portal/super-admin/pedidos"
          />

          <KPI
            title="PRODUCTOS"
            value={loading ? "—" : String(kpis.totalProducts)}
            note={loading ? "Cargando..." : `${kpis.outOfStock} sin stock`}
            icon={Package}
            href="/portal/super-admin/suministros"
          />

          <KPI
            title="STOCK BAJO"
            value={loading ? "—" : String(kpis.lowStock)}
            note={loading ? "Cargando..." : "Productos por reabastecer"}
            icon={Boxes}
            href="/portal/super-admin/suministros"
          />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-black/10 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Filter size={18} style={{ color: BRAND_GREEN }} />
          <div className="text-sm font-medium text-black/80">Filtros de consumo</div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-black/50">
              <CalendarDays size={14} />
              Mes
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/20"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-black/50">
              <UserRound size={14} />
              Cliente
            </label>
            <select
              value={selectedClientUserId}
              onChange={(e) => setSelectedClientUserId(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/20"
            >
              <option value="">Todos los clientes</option>
              {(filters.clients || []).map((client) => (
                <option key={client.user_id} value={client.user_id}>
                  {client.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat
            title="Pedidos del periodo"
            value={loading ? "—" : String(selectedMonthSummary.ordersCount || 0)}
            note={monthLabel(selectedMonthSummary.month)}
          />
          <MiniStat
            title="Consumo total"
            value={loading ? "—" : formatMoney(selectedMonthSummary.totalSpent)}
            note={selectedClient ? selectedClient.label : "Todos los clientes"}
          />
          <MiniStat
            title="Monto pagado"
            value={loading ? "—" : formatMoney(selectedMonthSummary.paidSpent)}
            note="Cobranza confirmada"
          />
          <MiniStat
            title="Ticket promedio"
            value={loading ? "—" : formatMoney(selectedMonthSummary.avgTicket)}
            note="Promedio por pedido"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-black/85">{graphTitle}</div>
              <div className="mt-1 text-xs text-black/50">{graphSubtitle}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-black/45">Total del periodo</div>
              <div className="text-lg font-semibold text-black">
                {loading ? "—" : formatMoney(selectedMonthSummary.totalSpent)}
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingBlock label="Cargando gráfica..." />
          ) : salesByDay.length === 0 ? (
            <EmptyState text="No hay ventas registradas para ese filtro." />
          ) : (
            <div className="mt-5 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `$${Number(value || 0).toLocaleString("es-MX")}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [formatMoney(value), "Consumo"]}
                    labelFormatter={(label) => `Día ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={BRAND_GREEN}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} style={{ color: BRAND_GREEN }} />
            <div className="text-sm font-medium text-black/80">Alertas</div>
          </div>

          {loading ? (
            <LoadingBlock label="Cargando alertas..." />
          ) : alerts.length === 0 ? (
            <EmptyState text="Sin alertas por ahora. Todo se ve estable." />
          ) : (
            <div className="mt-4 space-y-3">
              {alerts.map((alert, idx) => (
                <AlertCard
                  key={alert.id || `${alert.title}-${idx}`}
                  title={alert.title}
                  subtitle={alert.subtitle}
                  level={alert.level}
                  href={alert.href}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-black/10 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} style={{ color: BRAND_GREEN }} />
            <div className="text-sm font-medium text-black/80">
              Comparativo de clientes del mes
            </div>
          </div>

          <div className="text-xs text-black/45">
            {monthLabel(selectedMonthSummary.month)}
          </div>
        </div>

        <div className="mt-1 text-xs text-black/50">
          Ranking de consumo acumulado por cliente en el mes seleccionado.
        </div>

        {loading ? (
          <LoadingBlock label="Cargando comparativo..." />
        ) : topClientsByMonth.length === 0 ? (
          <EmptyState text="No hay consumo registrado para comparar en ese periodo." />
        ) : (
          <div className="mt-5 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topClientsByMonth} layout="vertical" margin={{ left: 20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value || 0).toLocaleString("es-MX")}`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={160}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatMoney(value), "Consumo"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="total" fill={BRAND_GREEN} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && topClientsByMonth.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {topClientsByMonth.slice(0, 6).map((client, idx) => (
              <button
                key={client.client_user_id || idx}
                type="button"
                onClick={() => setSelectedClientUserId(client.client_user_id)}
                className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-left hover:shadow-sm hover:border-black/15 transition"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-black truncate">
                    {idx + 1}. {client.label}
                  </div>
                  <div className="mt-1 text-xs text-black/50">
                    {client.orders} pedido(s) · Pagado {formatMoney(client.paid)}
                  </div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-black">
                  {formatMoney(client.total)}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-3xl border border-black/10 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Coffee size={18} style={{ color: BRAND_GREEN }} />
            <div className="text-sm font-medium text-black/80">
              {productBlockTitle}
            </div>
          </div>

          <div className="text-xs text-black/45">
            {monthLabel(selectedMonthSummary.month)}
          </div>
        </div>

        <div className="mt-1 text-xs text-black/50">
          {productBlockSubtitle}
        </div>

        {loading ? (
          <LoadingBlock label="Cargando productos..." />
        ) : topProductsPeriod.length === 0 ? (
          <EmptyState text="No hay productos consumidos para ese filtro." />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {topProductsPeriod.map((product, idx) => (
              <div
                key={product.suministro_id || idx}
                className="rounded-2xl border border-black/10 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-black">
                      {idx + 1}. {product.nombre}
                    </div>
                    <div className="mt-1 text-xs text-black/50">
                      {product.subtitle || "Sin detalle adicional"}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-black/70">
                        {product.qty} unidades
                      </span>
                      <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-black/70">
                        Promedio {formatMoney(product.avgUnitPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-black">
                      {formatMoney(product.total)}
                    </div>
                    <div className="mt-1 text-[11px] text-black/45">
                      Total consumido
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2 flex-1 auto-rows-fr">
        <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6 h-full">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} style={{ color: BRAND_GREEN }} />
              <div className="text-sm font-medium text-black/80">Pedidos recientes</div>
            </div>

            <Link
              href="/portal/super-admin/pedidos"
              className="inline-flex items-center gap-1 text-xs text-black/45 hover:text-black/70 transition"
            >
              Ver todos
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingBlock label="Cargando pedidos..." />
          ) : recentOrders.length === 0 ? (
            <EmptyState text="No hay pedidos recientes para mostrar." />
          ) : (
            <div className="mt-4 space-y-3">
              {recentOrders.map((order, idx) => (
                <Link
                  key={order.id || `recent-order-${idx}`}
                  href="/portal/super-admin/pedidos"
                  className="block rounded-2xl border border-black/10 px-4 py-3 hover:shadow-sm hover:border-black/15 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-black">
                        Pedido {String(order.id).slice(0, 8)}
                      </div>
                      <div className="mt-1 text-xs text-black/60">
                        {order.negocio_nombre}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <StatusBadge status={order.status} />
                        <PaymentBadge paymentStatus={order.payment_status} />
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold text-black">
                        {formatMoney(order.total)}
                      </div>
                      <div className="mt-1 text-[11px] text-black/45">
                        {order.meta}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6 h-full">
          <div className="flex items-center gap-2">
            <Activity size={18} style={{ color: BRAND_GREEN }} />
            <div className="text-sm font-medium text-black/80">
              Actividad reciente
            </div>
          </div>

          {loading ? (
            <LoadingBlock label="Cargando actividad..." />
          ) : recentActivity.length === 0 ? (
            <EmptyState text="No hay actividad reciente para mostrar." />
          ) : (
            <div className="mt-4 space-y-3">
              {recentActivity.map((item, idx) => (
                <div
                  key={item.id || `activity-${idx}`}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-black">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs text-black/55">
                        {item.subtitle}
                      </div>
                    </div>
                    <div className="shrink-0 text-[11px] text-black/45">
                      {item.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ href, label, desc, icon: Icon }) {
  return (
    <Link
      href={href}
      className={cx(
        "group rounded-2xl border border-black/10 bg-white px-4 py-3 transition",
        "hover:border-black/15 hover:shadow-sm active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "border border-black/10 bg-black/[0.02] transition group-hover:bg-black/[0.03]"
          )}
        >
          <Icon size={18} strokeWidth={2} style={{ color: BRAND_GREEN }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-black truncate">
              {label}
            </div>
            <div className="ml-auto hidden sm:block text-xs text-black/40 group-hover:text-black/50 transition">
              Ver →
            </div>
          </div>
          <div className="mt-0.5 text-xs text-black/55 line-clamp-1">
            {desc}
          </div>
        </div>
      </div>
    </Link>
  );
}

function KPI({ title, value, note, icon: Icon, href }) {
  const content = (
    <div className="rounded-2xl border border-black/10 bg-white p-5 hover:shadow-sm hover:border-black/15 transition">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs tracking-wider text-black/50">{title}</div>
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-2">
          <Icon size={16} style={{ color: BRAND_GREEN }} />
        </div>
      </div>

      <div className="mt-2 text-3xl font-semibold text-black">{value}</div>

      <div className="mt-2 text-xs" style={{ color: BRAND_GREEN }}>
        {note}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

function MiniStat({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-black/45">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-black">{value}</div>
      <div className="mt-1 text-xs text-black/50">{note}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").trim().toLowerCase();

  const cls =
    s === "cancelado"
      ? "border-red-200 bg-red-50 text-red-700"
      : s === "entregado"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={cx("rounded-full border px-2.5 py-1", cls)}>
      {statusLabel(status)}
    </span>
  );
}

function PaymentBadge({ paymentStatus }) {
  const s = String(paymentStatus || "").trim().toLowerCase();

  const cls =
    s === "paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <span className={cx("rounded-full border px-2.5 py-1", cls)}>
      <span className="inline-flex items-center gap-1">
        <CreditCard size={12} />
        {paymentLabel(paymentStatus)}
      </span>
    </span>
  );
}

function LoadingBlock({ label }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-black/55">
      <Loader2 size={16} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-black/10 px-4 py-6 text-sm text-black/55">
      {text}
    </div>
  );
}

function AlertCard({ title, subtitle, level, href }) {
  const isHigh = level === "high";

  const card = (
    <div
      className={cx(
        "rounded-2xl border px-4 py-3 transition",
        href && "hover:shadow-sm",
        isHigh ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cx(
            "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border",
            isHigh
              ? "border-red-200 bg-white text-red-600"
              : "border-amber-200 bg-white text-amber-600"
          )}
        >
          {isHigh ? <PackageX size={17} /> : <Clock3 size={17} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-black">{title}</div>
          <div className="mt-1 text-xs text-black/60">{subtitle}</div>
        </div>

        {href ? (
          <div className="shrink-0 pt-1 text-black/35">
            <ArrowRight size={14} />
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}