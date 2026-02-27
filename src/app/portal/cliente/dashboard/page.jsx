"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  ClipboardList,
  RefreshCw,
  BadgeDollarSign,
} from "lucide-react";

const NotificationsBell = dynamic(() => import("@/components/NotificationsBell"), {
  ssr: false,
});

const BRAND_GREEN = "#31572c";

const KPI_THEMES = {
  blue: { bg: "#EEF5FF", border: "#D9E7FF", title: "#6B8AC9", value: "#2563EB", note: "#5B7BBE" },
  yellow: { bg: "#FFF7E8", border: "#FFE6B8", title: "#C48A1C", value: "#D97706", note: "#B7791F" },
  purple: { bg: "#F4F0FF", border: "#E3D8FF", title: "#7C6FD1", value: "#7C3AED", note: "#6D62C6" },
  green: { bg: "#ECFDF3", border: "#CFF7DD", title: "#1F7A3A", value: BRAND_GREEN, note: "#1F7A3A" },
  neutral: {
    bg: "#FFFFFF",
    border: "rgba(0,0,0,0.10)",
    title: "rgba(0,0,0,0.50)",
    value: "#0B0B0B",
    note: "rgba(0,0,0,0.55)",
  },
};

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "—";
  }
}

function formatMonthLabel(ym) {
  try {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    const txt = d.toLocaleDateString("es-MX", { year: "numeric", month: "long" });
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  } catch {
    return ym;
  }
}

const STATUS_LABEL = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  confirmado: "Confirmado",
  confirmada: "Confirmada",
  "en proceso": "En proceso",
  enviado: "Enviado",
  entregado: "Entregado",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
  cancelada: "Cancelada",
  rechazado: "Rechazado",
  rechazada: "Rechazada",
};

function normalizeAgg(x) {
  const count = Number(x?.count || 0);
  const total = Number(x?.total || 0);
  return {
    count: Number.isFinite(count) ? count : 0,
    total: Number.isFinite(total) ? total : 0,
  };
}

export default function ClienteDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [months, setMonths] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  const [pendientesPedido, setPendientesPedido] = useState({ count: 0, total: 0 });
  const [pendientesPago, setPendientesPago] = useState({ count: 0, total: 0 });

  const [productsTop, setProductsTop] = useState([]);
  const [productsBottom, setProductsBottom] = useState([]);

  const now = useMemo(() => new Date(), []);
  const currentYm = useMemo(
    () => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    [now]
  );
  const [selectedYm, setSelectedYm] = useState(currentYm);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cliente/dashboard", { cache: "no-store", signal: controller.signal });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "No se pudo cargar el dashboard");
        return;
      }

      const m = Array.isArray(data?.months) ? data.months : [];
      const top = Array.isArray(data?.products?.top) ? data.products.top : [];
      const bottom = Array.isArray(data?.products?.bottom) ? data.products.bottom : [];

      setBusinessName(data?.business_name || "");
      setMonths(m);
      setLastOrder(data?.last_order || null);

      // ✅ nuevos agregados
      const pp = data?.pendientes_pedido || data?.pendientes || { count: 0, total: 0 };
      const ppay = data?.pendientes_pago || { count: 0, total: 0 };

      setPendientesPedido(normalizeAgg(pp));
      setPendientesPago(normalizeAgg(ppay));

      setProductsTop(top);
      setProductsBottom(bottom);

      if (m.length) {
        const hasCurrent = m.some((x) => x.ym === currentYm);
        setSelectedYm(hasCurrent ? currentYm : m[0].ym);
      } else {
        setSelectedYm(currentYm);
      }
    } catch (e) {
      if (e?.name !== "AbortError") setError("Error de red al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, [currentYm]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort?.();
  }, [load]);

  const monthsAvailable = useMemo(() => months.map((m) => m.ym), [months]);

  const selectedMonthCount = useMemo(() => {
    const row = months.find((x) => x.ym === selectedYm);
    return row ? row.count : 0;
  }, [months, selectedYm]);

  const maxTop = useMemo(() => Math.max(1, Number(productsTop?.[0]?.qty || 0) || 1), [productsTop]);
  const maxBottom = useMemo(() => {
    const mx = Math.max(...(productsBottom || []).map((x) => Number(x?.qty || 0)));
    return Math.max(1, Number.isFinite(mx) ? mx : 1);
  }, [productsBottom]);

  const refreshing = loading;

  return (
    <div className="w-full max-w-none bg-white text-black">
      <div className="rounded-3xl border border-black/10 bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="text-sm text-black/60">Bienvenido</div>

        {/* Header */}
        <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* móvil: campana al lado del nombre */}
          <div className="min-w-0 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="min-w-0 text-3xl sm:text-4xl lg:text-5xl font-semibold text-black/70 break-words">
                {businessName ? businessName : "Panel del cliente"}
              </h1>
              <p className="mt-2 text-sm text-black/55">
                Aquí podrás revisar tu historial y crear nuevos pedidos.
              </p>
            </div>

            <div className="shrink-0 lg:hidden">
              <NotificationsBell />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start lg:justify-end">
            {/* desktop: campana con los botones */}
            <div className="hidden lg:flex items-center">
              <NotificationsBell />
            </div>

            <Link
              href="/portal/cliente/pedidos/nuevo"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm text-white transition shadow-sm whitespace-nowrap hover:opacity-95 active:opacity-90"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              <PlusCircle size={18} />
              Crear pedido
            </Link>

            <Link
              href="/portal/cliente/pedidos"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm transition bg-white shadow-sm whitespace-nowrap hover:bg-[rgba(49,87,44,0.10)]"
              style={{ borderColor: BRAND_GREEN, color: "#000" }}
            >
              <ClipboardList size={18} />
              Ver mis pedidos
            </Link>

            <button
              onClick={load}
              type="button"
              disabled={refreshing}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm transition bg-white shadow-sm whitespace-nowrap",
                refreshing ? "opacity-60 cursor-not-allowed" : "hover:bg-[rgba(49,87,44,0.10)]",
              ].join(" ")}
              style={{ borderColor: BRAND_GREEN, color: "#000" }}
              title={refreshing ? "Actualizando…" : "Actualizar"}
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KPI
            title="PEDIDOS POR MES"
            value={loading ? "…" : String(selectedMonthCount)}
            note={
              loading
                ? "Cargando…"
                : monthsAvailable.length
                  ? `Mes: ${formatMonthLabel(selectedYm)}`
                  : "Aún no hay pedidos"
            }
            theme="blue"
            icon={CalendarDays}
          >
            {!loading && monthsAvailable.length > 0 && (
              <div className="mt-3">
                <select
                  value={selectedYm}
                  onChange={(e) => setSelectedYm(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs outline-none"
                  style={{ color: "#000" }}
                >
                  {monthsAvailable.map((m) => (
                    <option key={m} value={m}>
                      {formatMonthLabel(m)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </KPI>

          <KPI
            title="ÚLTIMO PEDIDO"
            value={loading ? "…" : lastOrder ? formatDate(lastOrder.created_at) : "—"}
            note={
              loading
                ? "Cargando…"
                : lastOrder
                  ? `${STATUS_LABEL[String(lastOrder.status || "").toLowerCase()] || lastOrder.status} · ${formatMoney(
                      lastOrder.total
                    )}`
                  : "Sin registros"
            }
            theme="purple"
            icon={Clock}
          />

          {/* ✅ clickeable */}
          <KPI
            href="/portal/cliente/pedidos?status=pendiente"
            title="PENDIENTES DE PEDIDO"
            value={loading ? "…" : String(pendientesPedido.count)}
            note={
              loading
                ? "Cargando…"
                : pendientesPedido.count
                  ? `${pendientesPedido.count} pedidos · Total ${formatMoney(pendientesPedido.total)}`
                  : "Sin pendientes"
            }
            theme="yellow"
            icon={AlertCircle}
          />

          {/* ✅ clickeable */}
          <KPI
            href="/portal/cliente/pedidos?payment_status=pending"
            title="PENDIENTES DE PAGO"
            value={loading ? "…" : String(pendientesPago.count)}
            note={
              loading
                ? "Cargando…"
                : pendientesPago.count
                  ? `${pendientesPago.count} pedidos · Total ${formatMoney(pendientesPago.total)}`
                  : "Sin pagos pendientes"
            }
            theme="green"
            icon={BadgeDollarSign}
          />
        </div>

        {/* Productos top/bottom */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <KPI
            title="TU PRODUCTO MÁS COMPRADO ES"
            value={loading ? "…" : productsTop?.[0]?.name || "—"}
            note={loading ? "Cargando…" : productsTop?.[0] ? `Cantidad: ${productsTop[0].qty}` : "Sin datos"}
            theme="neutral"
            icon={TrendingUp}
          />
          <KPI
            title="TU PRODUCTO MENOS COMPRADO ES"
            value={loading ? "…" : productsBottom?.[0]?.name || "—"}
            note={
              loading ? "Cargando…" : productsBottom?.[0] ? `Cantidad: ${productsBottom[0].qty}` : "Sin datos"
            }
            theme="neutral"
            icon={TrendingDown}
          />
        </div>

        {/* Barras */}
        <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs tracking-wider text-black/50">TOP DE PRODUCTOS (Cantidad)</div>
            {!loading && (
              <div className="text-xs text-black/45">
                Tip: detecta rotación (más comprados) y productos a impulsar (menos comprados)
              </div>
            )}
          </div>

          {loading ? (
            <div className="mt-3 text-sm text-black/60">Cargando…</div>
          ) : !productsTop.length ? (
            <div className="mt-3 text-sm text-black/60">
              No hay datos de productos (revisa que existan rows en <code>order_items</code>).
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BarList title="Más comprados" items={productsTop} maxScale={maxTop} />
              <BarList title="Menos comprados" items={productsBottom} maxScale={maxBottom} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, note, children, theme = "neutral", icon: Icon, href }) {
  const t = KPI_THEMES[theme] || KPI_THEMES.neutral;

  const Card = (
    <div
      className={[
        "rounded-2xl border p-4 sm:p-5 min-w-0 shadow-[0_1px_0_rgba(0,0,0,0.03)]",
        href ? "hover:opacity-95 active:opacity-90 cursor-pointer" : "",
      ].join(" ")}
      style={{ backgroundColor: t.bg, borderColor: t.border }}
    >
      <div className="flex items-center gap-2 text-xs tracking-wider" style={{ color: t.title }}>
        {Icon ? <Icon size={16} /> : null}
        <span className="min-w-0 break-words">{title}</span>
      </div>

      <div className="mt-2 text-2xl sm:text-3xl font-semibold" style={{ color: t.value }}>
        {value}
      </div>

      <div className="mt-2 text-xs" style={{ color: t.note }}>
        {note}
      </div>

      {children ? <div>{children}</div> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {Card}
      </Link>
    );
  }

  return Card;
}

function BarList({ title, items, maxScale }) {
  const max = Math.max(1, Number(maxScale || 0));

  return (
    <div className="min-w-0">
      <div className="text-sm font-semibold text-black">{title}</div>
      <div className="mt-3 space-y-3">
        {items.map((it) => {
          const qty = Number(it.qty || 0);
          const pct = Math.max(0, Math.min(100, (qty / max) * 100));

          return (
            <div key={it.name} className="rounded-xl border border-black/10 p-3 min-w-0">
              <div className="flex items-center justify-between gap-3 min-w-0">
                <div className="text-sm text-black line-clamp-1 min-w-0">{it.name}</div>
                <div className="text-xs text-black/60 whitespace-nowrap">Cantidad: {qty}</div>
              </div>

              <div className="mt-2 h-2 w-full rounded-full bg-black/5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: BRAND_GREEN }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}