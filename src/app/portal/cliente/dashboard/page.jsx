"use client";

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
} from "lucide-react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

/** ✅ Paleta tipo la imagen (pasteles + acento) */
const KPI_THEMES = {
  blue: {
    bg: "#EEF5FF",
    border: "#D9E7FF",
    title: "#6B8AC9",
    value: "#2563EB",
    note: "#5B7BBE",
  },
  yellow: {
    bg: "#FFF7E8",
    border: "#FFE6B8",
    title: "#C48A1C",
    value: "#D97706",
    note: "#B7791F",
  },
  purple: {
    bg: "#F4F0FF",
    border: "#E3D8FF",
    title: "#7C6FD1",
    value: "#7C3AED",
    note: "#6D62C6",
  },
  green: {
    bg: "#EAFBF2",
    border: "#CFF5DF",
    title: "#2E9B6F",
    value: "#059669",
    note: "#268A63",
  },
  neutral: {
    bg: "#FFFFFF",
    border: "rgba(0,0,0,0.10)",
    title: "rgba(0,0,0,0.50)",
    value: "#000000",
    note: BRAND_GREEN,
  },
};

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatMonthLabel(ym) {
  try {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleDateString("es-MX", { year: "numeric", month: "long" });
  } catch {
    return ym;
  }
}

const STATUS_LABEL = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function ClienteDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [months, setMonths] = useState([]); // [{ym,count}]
  const [lastOrder, setLastOrder] = useState(null); // {created_at,status,total}
  const [pendientes, setPendientes] = useState({ count: 0, total: 0 });
  const [productsTop, setProductsTop] = useState([]);
  const [productsBottom, setProductsBottom] = useState([]);

  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedYm, setSelectedYm] = useState(currentYm);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cliente/dashboard", {
        cache: "no-store",
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "No se pudo cargar el dashboard");
        setLoading(false);
        return;
      }

      setBusinessName(data?.business_name || "");
      const m = Array.isArray(data?.months) ? data.months : [];
      setMonths(m);
      setLastOrder(data?.last_order || null);
      setPendientes(data?.pendientes || { count: 0, total: 0 });

      setProductsTop(Array.isArray(data?.products?.top) ? data.products.top : []);
      setProductsBottom(Array.isArray(data?.products?.bottom) ? data.products.bottom : []);

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

  const selectedMonthCount = useMemo(() => {
    const row = months.find((x) => x.ym === selectedYm);
    return row ? row.count : 0;
  }, [months, selectedYm]);

  const monthsAvailable = useMemo(() => months.map((m) => m.ym), [months]);

  const globalMaxQty = useMemo(() => {
    return Number(productsTop?.[0]?.qty || 0) || 1;
  }, [productsTop]);

  return (
    <div className="max-w-[1100px] w-full bg-white text-black">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="text-sm text-black/60">Bienvenido</div>

        {/* ✅ Header: nombre + botones al lado */}
        <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-5xl font-semibold text-black/60">
            {businessName ? businessName : "Panel del cliente"}
          </h1>

          {/* ✅ Accesos rápidos a la derecha del nombre */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-start lg:justify-end">
            <a
              href="/portal/cliente/pedidos/nuevo"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm text-white transition shadow-sm"
              style={{ backgroundColor: BRAND_GREEN }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
              onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
              onMouseUp={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
            >
              <PlusCircle size={18} />
              Crear pedido
            </a>

            <a
              href="/portal/cliente/pedidos"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm transition bg-white shadow-sm"
              style={{ borderColor: BRAND_GREEN, color: "#000" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BRAND_GREEN;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "#000";
              }}
              onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
            >
              <ClipboardList size={18} />
              Ver mis pedidos
            </a>

            <button
              onClick={load}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm transition bg-white shadow-sm"
              style={{ borderColor: BRAND_GREEN, color: "#000" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BRAND_GREEN;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "#000";
              }}
              onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm text-black/60">
          Aquí podrás revisar tu historial y crear nuevos pedidos.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <KPI
            title="PEDIDOS POR MES"
            value={loading ? "…" : String(selectedMonthCount)}
            note={
              loading
                ? "Cargando…"
                : monthsAvailable.length
                ? `Mes: ${selectedYm}`
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
                ? `${STATUS_LABEL[lastOrder.status] || lastOrder.status} · ${formatMoney(lastOrder.total)}`
                : "Sin registros"
            }
            theme="purple"
            icon={Clock}
          />

          <KPI
            title="PENDIENTES"
            value={loading ? "…" : String(pendientes.count)}
            note={
              loading
                ? "Cargando…"
                : pendientes.count
                ? `${pendientes.count} pedidos pendientes · Total ${formatMoney(pendientes.total)}`
                : "Sin pedidos pendientes"
            }
            theme="yellow"
            icon={AlertCircle}
          />
        </div>

        {/* Productos top/bottom */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <KPI
            title="TU PRODUCTO MÁS COMPRADO ES: "
            value={loading ? "…" : productsTop?.[0]?.name || "—"}
            note={loading ? "Cargando…" : productsTop?.[0] ? `Cantidad: ${productsTop[0].qty}` : "Sin datos"}
            theme="neutral"
            icon={TrendingUp}
          />
          <KPI
            title="TU PRODUCTO MENOS COMPRADO ES:"
            value={loading ? "…" : productsBottom?.[0]?.name || "—"}
            note={loading ? "Cargando…" : productsBottom?.[0] ? `Cantidad: ${productsBottom[0].qty}` : "Sin datos"}
            theme="neutral"
            icon={TrendingDown}
          />
        </div>

        {/* Gráfica liviana (sin librerías) */}
        <div className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-xs tracking-wider text-black/50">TOP DE PRODUCTOS (Cantidad)</div>

          {loading ? (
            <div className="mt-3 text-sm text-black/60">Cargando…</div>
          ) : !productsTop.length ? (
            <div className="mt-3 text-sm text-black/60">
              No hay datos de productos (revisa que existan rows en <code>order_items</code>).
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              <BarList title="Más comprados" items={productsTop} maxScale={globalMaxQty} />
              <BarList title="Menos comprados" items={productsBottom} maxScale={globalMaxQty} />
            </div>
          )}
        </div>

        {/* ✅ IMPORTANTE: ya NO dejamos los botones aquí abajo (para que no se dupliquen) */}
      </div>
    </div>
  );
}

function KPI({ title, value, note, children, theme = "neutral", icon: Icon }) {
  const t = KPI_THEMES[theme] || KPI_THEMES.neutral;

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: t.bg,
        borderColor: t.border,
      }}
    >
      <div className="flex items-center gap-2 text-xs tracking-wider" style={{ color: t.title }}>
        {Icon ? <Icon size={16} /> : null}
        <span>{title}</span>
      </div>

      <div className="mt-2 text-3xl font-semibold" style={{ color: t.value }}>
        {value}
      </div>

      <div className="mt-2 text-xs" style={{ color: t.note }}>
        {note}
      </div>

      {children ? <div>{children}</div> : null}
    </div>
  );
}

function BarList({ title, items, maxScale }) {
  const max = Math.max(1, Number(maxScale || 0));

  return (
    <div>
      <div className="text-sm font-semibold text-black">{title}</div>
      <div className="mt-3 space-y-3">
        {items.map((it) => {
          const qty = Number(it.qty || 0);
          const pct = Math.max(0, Math.min(100, (qty / max) * 100));

          return (
            <div key={it.name} className="rounded-xl border border-black/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-black line-clamp-1">{it.name}</div>
                <div className="text-xs text-black/60">Cantidad: {qty}</div>
              </div>

              <div className="mt-2 h-2 w-full rounded-full bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: BRAND_GREEN }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}