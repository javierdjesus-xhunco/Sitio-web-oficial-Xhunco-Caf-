"use client";

import { useEffect, useMemo, useState } from "react";

const BRAND_GREEN = "#31572c"; // Hunter Green
const BRAND_GREEN_DARK = "#25441f";

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
  // ym: "YYYY-MM"
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
  const [orders, setOrders] = useState([]);

  // ✅ negocio (para título)
  const [businessName, setBusinessName] = useState("");

  // ✅ mes seleccionado (para KPI 1)
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedYm, setSelectedYm] = useState(currentYm);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      // 1) Cargar negocio (nombre) por sesión server-side
      try {
        const meRes = await fetch("/api/cliente/me", { cache: "no-store" });
        const meData = await meRes.json().catch(() => ({}));
        if (meRes.ok) {
          setBusinessName(meData?.client?.business_name || "");
        }
      } catch {
        // silencioso
      }

      // 2) Cargar pedidos
      const res = await fetch("/api/cliente/pedidos/list", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "No se pudieron cargar tus pedidos");
        setOrders([]);
        setLoading(false);
        return;
      }

      const items = data.items || [];
      setOrders(items);

      // ✅ Ajustar el mes seleccionado:
      // - Si hay pedidos en el mes actual, dejamos currentYm.
      // - Si no, seleccionamos el mes más reciente que exista en pedidos.
      const months = Array.from(
        new Set(
          items.map((o) => {
            const d = new Date(o.created_at);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          })
        )
      ).sort((a, b) => (a > b ? -1 : 1)); // desc

      if (months.length) {
        if (months.includes(currentYm)) setSelectedYm(currentYm);
        else setSelectedYm(months[0]);
      } else {
        setSelectedYm(currentYm);
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ meses disponibles (solo donde hubo pedidos)
  const monthsAvailable = useMemo(() => {
    const set = new Set();
    for (const o of orders) {
      const d = new Date(o.created_at);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      set.add(ym);
    }
    return Array.from(set).sort((a, b) => (a > b ? -1 : 1)); // desc
  }, [orders]);

  // ✅ pedidos del mes seleccionado
  const pedidosMesSeleccionado = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.created_at);
      const oym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return oym === selectedYm;
    });
  }, [orders, selectedYm]);

  const pedidosMesSeleccionadoCount = useMemo(() => {
    return pedidosMesSeleccionado.length;
  }, [pedidosMesSeleccionado]);

  // ✅ último pedido (asumiendo que list viene ordenado desc)
  const ultimoPedido = useMemo(() => {
    return orders.length ? orders[0] : null;
  }, [orders]);

  // ✅ pendientes: contar y sumar (por status === "pendiente")
  const pendientesResumen = useMemo(() => {
    const pend = orders.filter((o) => String(o.status || "").toLowerCase() === "pendiente");
    const count = pend.length;
    const total = pend.reduce((acc, o) => acc + Number(o.total || 0), 0);
    return { count, total };
  }, [orders]);

  return (
    <div className="max-w-[1100px] w-full bg-white text-black">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="text-sm text-black/60">Bienvenido</div>

        {/* ✅ Título con negocio */}
        <h1 className="mt-1 text-4xl font-semibold text-black">
          {businessName ? businessName : "Panel del cliente"}
        </h1>

        <p className="mt-2 text-sm text-black/60">
          Aquí podrás revisar tu historial y crear nuevos pedidos.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* ✅ KPI 1: pedidos por mes + select */}
          <KPI
            title="PEDIDOS POR MES"
            value={loading ? "…" : String(pedidosMesSeleccionadoCount)}
            note={
              loading
                ? "Cargando…"
                : monthsAvailable.length
                ? `Mes: ${selectedYm}`
                : "Aún no hay pedidos"
            }
          >
            {/* ✅ select desplegable de meses (solo si hay pedidos) */}
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
            value={loading ? "…" : ultimoPedido ? formatDate(ultimoPedido.created_at) : "—"}
            note={
              loading
                ? "Cargando…"
                : ultimoPedido
                ? `${STATUS_LABEL[ultimoPedido.status] || ultimoPedido.status} · ${formatMoney(
                    ultimoPedido.total
                  )}`
                : "Sin registros"
            }
          />

          {/* ✅ KPI 3: pendientes */}
          <KPI
            title="PENDIENTES"
            value={loading ? "…" : String(pendientesResumen.count)}
            note={
              loading
                ? "Cargando…"
                : pendientesResumen.count
                ? `${pendientesResumen.count} pedidos pendientes · Total ${formatMoney(pendientesResumen.total)}`
                : "Sin pedidos pendientes"
            }
          />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {/* BOTÓN PRINCIPAL */}
          <a
            href="/portal/cliente/pedidos/nuevo"
            className="inline-flex justify-center rounded-full px-6 py-3 text-sm text-white transition"
            style={{ backgroundColor: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
            onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
            onMouseUp={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
          >
            Crear pedido
          </a>

          {/* BOTÓN SECUNDARIO */}
          <a
            href="/portal/cliente/pedidos"
            className="inline-flex justify-center rounded-full border px-6 py-3 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: "#000" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = BRAND_GREEN;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#000";
            }}
            onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
          >
            Ver mis pedidos
          </a>

          {/* BOTÓN RECARGAR */}
          <button
            onClick={() => location.reload()}
            type="button"
            className="inline-flex justify-center rounded-full border px-6 py-3 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: "#000" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = BRAND_GREEN;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#000";
            }}
            onMouseDown={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
          >
            Recargar
          </button>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, note, children }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-xs tracking-wider text-black/50">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-black">{value}</div>
      <div className="mt-2 text-xs" style={{ color: "#31572c" }}>
        {note}
      </div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}
