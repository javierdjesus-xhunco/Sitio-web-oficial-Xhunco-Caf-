"use client";

import { useEffect, useMemo, useState } from "react";

const BRAND_GREEN = "#31572c";
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

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      const res = await fetch("/api/cliente/pedidos/list", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "No se pudieron cargar tus pedidos");
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(data.items || []);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const pedidosEsteMes = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.created_at);
      const oym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return oym === ym;
    }).length;
  }, [orders, ym]);

  const ultimoPedido = useMemo(() => {
    return orders.length ? orders[0] : null; // ya viene ordenado DESC en el endpoint
  }, [orders]);

  return (
    <div className="max-w-[1100px] w-full text-black">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="text-sm text-black/60">Bienvenido</div>
        <h1 className="mt-1 text-4xl font-semibold text-black">Panel del cliente</h1>
        <p className="mt-2 text-sm text-black/60">
          Aquí podrás revisar tu historial y crear nuevos pedidos.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <KPI
            title="PEDIDOS ESTE MES"
            value={loading ? "…" : String(pedidosEsteMes)}
            note={loading ? "Cargando…" : pedidosEsteMes ? `Mes: ${ym}` : "Aún no hay pedidos este mes"}
          />

          <KPI
            title="ÚLTIMO PEDIDO"
            value={loading ? "…" : ultimoPedido ? formatDate(ultimoPedido.created_at) : "—"}
            note={
              loading
                ? "Cargando…"
                : ultimoPedido
                ? `${STATUS_LABEL[ultimoPedido.status] || ultimoPedido.status || "—"} · ${formatMoney(
                    ultimoPedido.total
                  )}`
                : "Sin registros"
            }
          />

          <KPI title="ESTADO" value="Activo" note="Acceso habilitado" />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href="/portal/cliente/pedidos/nuevo"
            className="inline-flex justify-center rounded-full px-6 py-3 text-sm text-white transition"
            style={{ backgroundColor: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
          >
            Crear pedido
          </a>

          <a
            href="/portal/cliente/pedidos"
            className="inline-flex justify-center rounded-full border px-6 py-3 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f7f2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Ver mis pedidos
          </a>

          <button
            onClick={() => location.reload()}
            className="inline-flex justify-center rounded-full border px-6 py-3 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f7f2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            type="button"
          >
            Recargar
          </button>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-xs tracking-wider text-black/50">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-black">{value}</div>
      <div className="mt-2 text-xs" style={{ color: BRAND_GREEN }}>
        {note}
      </div>
    </div>
  );
}
