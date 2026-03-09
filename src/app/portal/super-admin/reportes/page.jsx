"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Download,
  CalendarDays,
  Wallet,
  ShoppingCart,
  CircleDollarSign,
  Package,
  Users,
  Trophy,
  BarChart3,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
  });
}

function integer(n) {
  return Number(n || 0).toLocaleString("es-MX");
}

function formatDayLabel(v) {
  if (!v) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
    }).format(new Date(v));
  } catch {
    return String(v);
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

function percent(part, total) {
  const p = Number(part || 0);
  const t = Number(total || 0);
  if (!t) return 0;
  return ((p * 100) / t).toFixed(1);
}

function KPI({ title, value, subtitle, icon: Icon, tone = "default" }) {
  const toneMap = {
    default: "border-black/10 bg-white",
    green: "border-[#d7e7d8] bg-[#f7fbf7]",
    amber: "border-amber-200 bg-amber-50",
    blue: "border-sky-200 bg-sky-50",
  };

  return (
    <div className={cx("rounded-3xl border p-5 shadow-sm", toneMap[tone])}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/45">
            {title}
          </p>
          <div className="mt-2 text-3xl font-semibold text-black">{value}</div>
          {subtitle ? <p className="mt-2 text-sm text-black/50">{subtitle}</p> : null}
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: BRAND_SOFT, color: BRAND_GREEN }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text = "Sin datos." }) {
  return <div className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-black/50">{text}</div>;
}

export default function SuperAdminReportesPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  async function loadReports(nextDays = days) {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`/api/admin/reports/overview?days=${encodeURIComponent(String(nextDays))}`, {
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

  async function handleExportRaw() {
    try {
      const url = `/api/admin/reports/export?days=${encodeURIComponent(String(days))}`;
      window.open(url, "_blank");
    } catch {
      alert("No se pudo descargar el archivo.");
    }
  }

  const statusRows = data?.status_breakdown || [];
  const dayRows = data?.sales_by_day || [];
  const monthRows = data?.sales_by_month || [];
  const topClients = data?.top_clients || [];
  const topProducts = data?.top_products || [];
  const latestRaw = data?.latest_paid_lines || [];

  const maxDaySales = useMemo(() => {
    return dayRows.reduce((m, r) => Math.max(m, Number(r.total_sales || 0)), 0);
  }, [dayRows]);

  const maxStatusCount = useMemo(() => {
    return statusRows.reduce((m, r) => Math.max(m, Number(r.count || 0)), 0);
  }, [statusRows]);

  const cancelados =
    statusRows.find((x) => String(x.status || "").toLowerCase() === "cancelado")?.count || 0;

  const entregados =
    statusRows.find((x) => String(x.status || "").toLowerCase() === "entregado")?.count || 0;

  const pendientes =
    statusRows.find((x) => String(x.status || "").toLowerCase() === "pendiente")?.count || 0;

  const totalOrders = Number(data?.kpis?.total_orders || 0);
  const totalPaidOrders = Number(data?.kpis?.paid_orders || 0);
  const totalPaidRevenue = Number(data?.kpis?.paid_revenue || 0);
  const totalPaidItems = Number(data?.kpis?.paid_items || 0);
  const avgTicket = Number(data?.kpis?.avg_paid_ticket || 0);

  return (
    <section className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-[28px] border border-black/10 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ borderColor: "#d8e6d9", backgroundColor: BRAND_SOFT, color: BRAND_GREEN }}
            >
              <BarChart3 size={14} />
              Analytics / Reportes
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-black">
              Reportes de ventas y operación
            </h1>

            <p className="mt-2 max-w-3xl text-sm md:text-base text-black/55">
              Vista ejecutiva del comportamiento comercial, ingresos cobrados, desempeño por cliente,
              producto y estado de pedido.
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Actualizando..." : "Recargar"}
            </button>

            <button
              onClick={handleExportRaw}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black/[0.03]"
            >
              <Download size={16} />
              Exportar CSV bruto
            </button>
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
          value={loading ? "—" : money(totalPaidRevenue)}
          subtitle="Solo considera pedidos con payment_status = pagado"
          icon={CircleDollarSign}
          tone="green"
        />
        <KPI
          title="Pedidos totales"
          value={loading ? "—" : integer(totalOrders)}
          subtitle={`Entregados: ${integer(entregados)} · Pendientes: ${integer(pendientes)}`}
          icon={ShoppingCart}
        />
        <KPI
          title="Pedidos pagados"
          value={loading ? "—" : integer(totalPaidOrders)}
          subtitle={`${percent(totalPaidOrders, totalOrders)}% del total de pedidos`}
          icon={CheckCircle2}
          tone="blue"
        />
        <KPI
          title="Productos vendidos"
          value={loading ? "—" : integer(totalPaidItems)}
          subtitle="Cantidad total de líneas cobradas"
          icon={Package}
        />
        <KPI
          title="Ticket promedio"
          value={loading ? "—" : money(avgTicket)}
          subtitle={`Cancelados: ${integer(cancelados)} (${percent(cancelados, totalOrders)}%)`}
          icon={Wallet}
          tone="amber"
        />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.5fr_1fr]">
        {/* Ventas por día */}
        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-black">Ventas cobradas por día</h2>
              <p className="text-sm text-black/50">
                Evolución diaria del ingreso solo con pedidos pagados.
              </p>
            </div>
            <CalendarDays size={18} className="text-black/35" />
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Cargando…</div>
          ) : dayRows.length === 0 ? (
            <EmptyState text="No hay ventas pagadas para el periodo seleccionado." />
          ) : (
            <div className="space-y-3">
              {dayRows.map((row) => {
                const value = Number(row.total_sales || 0);
                const width = maxDaySales ? Math.max(6, Math.round((value * 100) / maxDaySales)) : 0;

                return (
                  <div key={row.day} className="grid grid-cols-[70px_1fr_120px] items-center gap-3">
                    <div className="text-sm font-medium text-black/65">{formatDayLabel(row.day)}</div>

                    <div className="h-3 overflow-hidden rounded-full bg-black/[0.05]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${width}%`, backgroundColor: BRAND_GREEN }}
                      />
                    </div>

                    <div className="text-right text-sm font-semibold text-black">
                      {money(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-black">Estados de pedido</h2>
              <p className="text-sm text-black/50">
                Distribución operativa del pipeline de pedidos.
              </p>
            </div>
            <Clock3 size={18} className="text-black/35" />
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Cargando…</div>
          ) : statusRows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {statusRows.map((row) => {
                const count = Number(row.count || 0);
                const width = maxStatusCount ? Math.max(8, Math.round((count * 100) / maxStatusCount)) : 0;

                return (
                  <div key={row.status} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-black">{statusLabel(row.status)}</span>
                      <span className="font-semibold text-black">{integer(count)}</span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-black/[0.05]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${width}%`, backgroundColor: BRAND_GREEN }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        {/* Ventas por mes */}
        <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-black">Ventas por mes</h2>
            <p className="text-sm text-black/50">
              Consolidado mensual de ingresos pagados.
            </p>
          </div>

          {loading ? (
            <div className="text-sm text-black/50">Cargando…</div>
          ) : monthRows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-left text-black/45">
                    <th className="pb-3 pr-4 font-medium">Mes</th>
                    <th className="pb-3 pr-4 font-medium">Pedidos pagados</th>
                    <th className="pb-3 pr-4 font-medium">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {monthRows.map((row) => (
                    <tr key={row.month} className="border-b border-black/[0.06]">
                      <td className="py-3 pr-4 font-medium text-black">{row.month_label || row.month}</td>
                      <td className="py-3 pr-4 text-black/70">{integer(row.orders || 0)}</td>
                      <td className="py-3 pr-4 font-semibold text-black">{money(row.total_sales || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">Top clientes</h2>
                <p className="text-sm text-black/50">Clientes con mayor compra pagada.</p>
              </div>
              <Users size={18} className="text-black/35" />
            </div>

            {loading ? (
              <div className="text-sm text-black/50">Cargando…</div>
            ) : topClients.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {topClients.map((row, idx) => (
                  <div
                    key={`${row.client_id}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Trophy size={15} style={{ color: BRAND_GREEN }} />
                        <p className="truncate font-semibold text-black">
                          {row.client_name || row.client_email || "Cliente"}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-black/45">
                        {integer(row.orders || 0)} pedidos pagados
                      </p>
                    </div>

                    <div className="text-right font-semibold text-black">
                      {money(row.total_sales || 0)}
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
                <p className="text-sm text-black/50">Productos más vendidos en líneas pagadas.</p>
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
                    key={`${row.product_id}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-black">
                        {row.product_name || "Producto"}
                      </p>
                      <p className="mt-1 text-xs text-black/45">
                        {integer(row.quantity || 0)} unidades · {integer(row.lines || 0)} líneas
                      </p>
                    </div>

                    <div className="text-right font-semibold text-black">
                      {money(row.total_sales || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Últimas líneas pagadas / raw preview */}
      <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">Vista previa de datos en bruto</h2>
            <p className="text-sm text-black/50">
              Cada producto de un pedido aparece por separado. La descarga CSV incluye este detalle.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <AlertCircle size={14} />
            Solo líneas de pedidos pagados
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-black/50">Cargando…</div>
        ) : latestRaw.length === 0 ? (
          <EmptyState text="No hay líneas pagadas para mostrar." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-black/45">
                  <th className="pb-3 pr-4 font-medium">Fecha</th>
                  <th className="pb-3 pr-4 font-medium">Pedido</th>
                  <th className="pb-3 pr-4 font-medium">Cliente</th>
                  <th className="pb-3 pr-4 font-medium">Producto</th>
                  <th className="pb-3 pr-4 font-medium">Cantidad</th>
                  <th className="pb-3 pr-4 font-medium">Precio unitario</th>
                  <th className="pb-3 pr-4 font-medium">Subtotal</th>
                  <th className="pb-3 pr-4 font-medium">Status pedido</th>
                  <th className="pb-3 pr-4 font-medium">Pago</th>
                </tr>
              </thead>
              <tbody>
                {latestRaw.map((row, idx) => (
                  <tr key={`${row.order_id}-${row.order_item_id}-${idx}`} className="border-b border-black/[0.06]">
                    <td className="py-3 pr-4 text-black/70">{formatDayLabel(row.created_at)}</td>
                    <td className="py-3 pr-4 font-medium text-black">#{row.order_folio || row.order_id}</td>
                    <td className="py-3 pr-4 text-black">{row.client_name || row.client_email || "Cliente"}</td>
                    <td className="py-3 pr-4 text-black">{row.product_name || "Producto"}</td>
                    <td className="py-3 pr-4 text-black/70">{integer(row.quantity || 0)}</td>
                    <td className="py-3 pr-4 text-black/70">{money(row.unit_price || 0)}</td>
                    <td className="py-3 pr-4 font-semibold text-black">{money(row.line_total || 0)}</td>
                    <td className="py-3 pr-4 text-black/70">{statusLabel(row.order_status)}</td>
                    <td className="py-3 pr-4 text-black/70">{paymentLabel(row.payment_status)}</td>
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