"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Download,
  BarChart3,
  CircleDollarSign,
  ShoppingCart,
  Package,
  Users,
  Trophy,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock3,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";
const BRAND_SOFT = "#eef6ee";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function money(n) {
  return Number(n || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  });
}

function integer(n) {
  return Number(n || 0).toLocaleString("es-MX");
}

function percent(part, total) {
  const p = Number(part || 0);
  const t = Number(total || 0);
  if (!t) return 0;
  return Number(((p * 100) / t).toFixed(1));
}

function deltaPct(current, previous) {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (!p && !c) return 0;
  if (!p && c > 0) return 100;
  return Number((((c - p) * 100) / p).toFixed(1));
}

function compactMoney(n) {
  const value = Number(n || 0);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatShortDay(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
    }).format(new Date(dateStr));
  } catch {
    return String(dateStr);
  }
}

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

function paymentLabel(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "pagado") return "Pagado";
  if (s === "pendiente") return "Pendiente";
  if (s === "parcial") return "Parcial";
  return v || "—";
}

function KPI({ title, value, subtitle, icon: Icon, delta }) {
  const isUp = Number(delta || 0) >= 0;

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
            {title}
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-tight text-black">
            {value}
          </div>

          {subtitle ? (
            <div className="mt-2 text-sm text-black/50">{subtitle}</div>
          ) : null}

          {typeof delta === "number" ? (
            <div
              className={cx(
                "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                isUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}
            >
              {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(delta)}% vs periodo anterior
            </div>
          ) : null}
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: BRAND_SOFT, color: BRAND_GREEN }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text = "Sin datos." }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-black/50">
      {text}
    </div>
  );
}

export default function SuperAdminReportesPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const [statusFilter, setStatusFilter] = useState("todos");
  const [clientQuery, setClientQuery] = useState("");

  async function loadReports(nextDays = days) {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`/api/superadmin/reports/overview?days=${encodeURIComponent(String(nextDays))}`, {
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo cargar el reporte");
      }

      setData(json);
    } catch (e) {
      setErr(e?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleExportRaw() {
    window.open(`/api/superadmin/reports/export?days=${encodeURIComponent(String(days))}`, "_blank");
  }

  const kpis = data?.kpis || {};
  const previous = data?.previous_kpis || {};

  const totalOrders = Number(kpis.total_orders || 0);
  const paidOrders = Number(kpis.paid_orders || 0);
  const paidRevenue = Number(kpis.paid_revenue || 0);
  const paidItems = Number(kpis.paid_items || 0);
  const avgPaidTicket = Number(kpis.avg_paid_ticket || 0);

  const dayRows = data?.sales_by_day || [];
  const statusRows = data?.status_breakdown || [];
  const monthRows = data?.sales_by_month || [];
  const topClients = data?.top_clients || [];
  const topProducts = data?.top_products || [];
  const rawPreview = data?.raw_preview || [];

  const filteredRawPreview = useMemo(() => {
    return rawPreview.filter((row) => {
      const matchesStatus =
        statusFilter === "todos" ||
        String(row.status || "").toLowerCase().trim() === statusFilter;

      const matchesClient =
        !clientQuery.trim() ||
        String(row.business_name || "")
          .toLowerCase()
          .includes(clientQuery.trim().toLowerCase());

      return matchesStatus && matchesClient;
    });
  }, [rawPreview, statusFilter, clientQuery]);

  const chartSalesByDay = useMemo(() => {
    return dayRows.map((row) => ({
      day: formatShortDay(row.day),
      ventas: Number(row.total_sales || 0),
      pedidos: Number(row.orders || 0),
    }));
  }, [dayRows]);

  const chartStatus = useMemo(() => {
    return statusRows.map((row) => ({
      status: statusLabel(row.status),
      total: Number(row.count || 0),
    }));
  }, [statusRows]);

  const chartMonths = useMemo(() => {
    return monthRows.map((row) => ({
      month: row.month_label,
      ventas: Number(row.total_sales || 0),
      pedidos: Number(row.orders || 0),
    }));
  }, [monthRows]);

  const pendientes =
    statusRows.find((x) => String(x.status || "").toLowerCase() === "pendiente")?.count || 0;
  const entregados =
    statusRows.find((x) => String(x.status || "").toLowerCase() === "entregado")?.count || 0;
  const cancelados =
    statusRows.find((x) => String(x.status || "").toLowerCase() === "cancelado")?.count || 0;

  const statusCards = [
    { key: "pendiente", label: "Pendientes", value: pendientes },
    { key: "entregado", label: "Entregados", value: entregados },
    { key: "cancelado", label: "Cancelados", value: cancelados },
  ];

  return (
    <section className="space-y-6 p-4 md:p-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#f6fbf6] via-white to-[#f6fbf6] p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ borderColor: "#d8e6d9", backgroundColor: BRAND_SOFT, color: BRAND_GREEN }}
              >
                <BarChart3 size={14} />
                Analytics / SaaS Reports
              </div>

              <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-black">
                Centro de reportes
              </h1>

              <p className="mt-2 max-w-3xl text-sm md:text-base text-black/55">
                Panorama ejecutivo de ventas, cobranzas, clientes, productos y desempeño operativo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={days}
                onChange={async (e) => {
                  const v = Number(e.target.value || 30);
                  setDays(v);
                  await loadReports(v);
                }}
                className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold outline-none"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={60}>Últimos 60 días</option>
                <option value={90}>Últimos 90 días</option>
                <option value={180}>Últimos 180 días</option>
                <option value={365}>Último año</option>
              </select>

              <button
                onClick={() => loadReports(days)}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Actualizando..." : "Recargar"}
              </button>

              <button
                onClick={handleExportRaw}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black hover:bg-black/[0.03]"
              >
                <Download size={16} />
                Exportar bruto
              </button>
            </div>
          </div>
        </div>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-5">
        <KPI
          title="Ingresos cobrados"
          value={loading ? "—" : money(paidRevenue)}
          subtitle="Solo pedidos pagados"
          icon={CircleDollarSign}
          delta={deltaPct(paidRevenue, previous.paid_revenue)}
        />

        <KPI
          title="Pedidos totales"
          value={loading ? "—" : integer(totalOrders)}
          subtitle={`Entregados: ${integer(entregados)} · Pendientes: ${integer(pendientes)}`}
          icon={ShoppingCart}
          delta={deltaPct(totalOrders, previous.total_orders)}
        />

        <KPI
          title="Pedidos pagados"
          value={loading ? "—" : integer(paidOrders)}
          subtitle={`${percent(paidOrders, totalOrders)}% del total`}
          icon={CheckCircle2}
          delta={deltaPct(paidOrders, previous.paid_orders)}
        />

        <KPI
          title="Productos vendidos"
          value={loading ? "—" : integer(paidItems)}
          subtitle="Suma de qty pagada"
          icon={Package}
          delta={deltaPct(paidItems, previous.paid_items)}
        />

        <KPI
          title="Ticket promedio"
          value={loading ? "—" : money(avgPaidTicket)}
          subtitle={`Cancelados: ${integer(cancelados)} (${percent(cancelados, totalOrders)}%)`}
          icon={Users}
          delta={deltaPct(avgPaidTicket, previous.avg_paid_ticket)}
        />
      </div>

      {/* Mini status cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statusCards.map((item) => (
          <div key={item.key} className="rounded-[24px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                  {item.label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-black">
                  {loading ? "—" : integer(item.value)}
                </div>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: BRAND_SOFT, color: BRAND_GREEN }}
              >
                <Clock3 size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-black">Ventas cobradas por día</h2>
              <p className="text-sm text-black/50">
                Evolución de ingresos del periodo seleccionado.
              </p>
            </div>
            <div className="text-sm font-semibold text-black/45">
              {loading ? "—" : compactMoney(paidRevenue)}
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Cargando…</div>
          ) : chartSalesByDay.length === 0 ? (
            <EmptyState text="No hay ventas cobradas para graficar." />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSalesByDay}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_GREEN} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={BRAND_GREEN} stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#666" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                  <Tooltip
                    formatter={(value) => [money(value), "Ventas"]}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="ventas"
                    stroke={BRAND_GREEN}
                    fill="url(#salesFill)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-black">Pedidos por status</h2>
            <p className="text-sm text-black/50">
              Distribución operativa actual del periodo.
            </p>
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Cargando…</div>
          ) : chartStatus.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartStatus}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#666" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                  <Tooltip formatter={(value) => [integer(value), "Pedidos"]} />
                  <Bar dataKey="total" fill={BRAND_GREEN} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.2fr_1fr_1fr]">
        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-black">Ventas por mes</h2>
            <p className="text-sm text-black/50">
              Consolidado mensual de ingresos cobrados.
            </p>
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Cargando…</div>
          ) : chartMonths.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {chartMonths.map((row, i) => (
                <div
                  key={`${row.month}-${i}`}
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-black">{row.month}</div>
                    <div className="mt-1 text-xs text-black/45">
                      {integer(row.pedidos)} pedidos pagados
                    </div>
                  </div>
                  <div className="font-semibold text-black">{money(row.ventas)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">Top clientes</h2>
              <p className="text-sm text-black/50">Mayor facturación pagada.</p>
            </div>
            <Trophy size={18} className="text-black/35" />
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Cargando…</div>
          ) : topClients.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {topClients.map((row, idx) => (
                <div
                  key={`${row.client_user_id}-${idx}`}
                  className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-black">
                        {row.business_name || "Cliente"}
                      </div>
                      <div className="mt-1 text-xs text-black/45">
                        {integer(row.orders || 0)} pedidos pagados
                      </div>
                    </div>
                    <div className="text-right font-semibold text-black">
                      {money(row.total_sales || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">Top productos</h2>
              <p className="text-sm text-black/50">Más vendidos en pedidos pagados.</p>
            </div>
            <Package size={18} className="text-black/35" />
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Cargando…</div>
          ) : topProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {topProducts.map((row, idx) => (
                <div
                  key={`${row.suministro_id || row.nombre}-${idx}`}
                  className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-black">
                        {row.nombre || "Producto"}
                      </div>
                      <div className="mt-1 text-xs text-black/45">
                        {integer(row.qty || 0)} unidades · {integer(row.lines || 0)} líneas
                      </div>
                    </div>
                    <div className="text-right font-semibold text-black">
                      {money(row.total_sales || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters + raw table */}
      <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">Datos brutos</h2>
            <p className="text-sm text-black/50">
              Cada línea representa un producto dentro de un pedido pagado.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3">
              <Filter size={15} className="text-black/40" />
              <input
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                placeholder="Buscar cliente..."
                className="h-10 w-[220px] bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-sm font-medium outline-none"
            >
              <option value="todos">Todos los status</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="en_preparacion">En preparación</option>
              <option value="en_ruta">En ruta</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <AlertCircle size={14} />
          Solo líneas con payment_status = pagado
        </div>

        {loading ? (
          <div className="text-sm text-black/50">Cargando…</div>
        ) : filteredRawPreview.length === 0 ? (
          <EmptyState text="No hay líneas que coincidan con los filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-black/45">
                  <th className="pb-3 pr-4 font-medium">Pedido</th>
                  <th className="pb-3 pr-4 font-medium">Fecha</th>
                  <th className="pb-3 pr-4 font-medium">Cliente</th>
                  <th className="pb-3 pr-4 font-medium">Producto</th>
                  <th className="pb-3 pr-4 font-medium">Cantidad</th>
                  <th className="pb-3 pr-4 font-medium">Precio unitario</th>
                  <th className="pb-3 pr-4 font-medium">Subtotal línea</th>
                  <th className="pb-3 pr-4 font-medium">Status pedido</th>
                  <th className="pb-3 pr-4 font-medium">Status pago</th>
                </tr>
              </thead>
              <tbody>
                {filteredRawPreview.map((row, idx) => (
                  <tr key={`${row.order_item_id}-${idx}`} className="border-b border-black/[0.06]">
                    <td className="py-3 pr-4 font-semibold text-black">#{row.order_id}</td>
                    <td className="py-3 pr-4 text-black/70">{formatShortDay(row.created_at)}</td>
                    <td className="py-3 pr-4 text-black">{row.business_name || "Cliente"}</td>
                    <td className="py-3 pr-4 text-black">{row.product_name || "Producto"}</td>
                    <td className="py-3 pr-4 text-black/70">{integer(row.qty || 0)}</td>
                    <td className="py-3 pr-4 text-black/70">{money(row.unit_price || 0)}</td>
                    <td className="py-3 pr-4 font-semibold text-black">{money(row.line_total || 0)}</td>
                    <td className="py-3 pr-4 text-black/70">{statusLabel(row.status)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={cx(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          String(row.payment_status || "").toLowerCase() === "pagado"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        )}
                      >
                        {paymentLabel(row.payment_status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}