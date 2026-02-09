"use client";

import { useEffect, useMemo, useState } from "react";

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
    <div className="max-w-[1100px] w-full">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_80px_rgba(255,255,255,0.06)]">
        <div className="text-sm text-white/70">Bienvenido</div>
        <h1 className="mt-1 text-4xl font-semibold">Panel del cliente</h1>
        <p className="mt-2 text-sm text-white/60">
          Aquí podrás revisar tu historial y crear nuevos pedidos.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
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
            className="inline-flex justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm text-white/90 hover:bg-emerald-400/15 transition"
          >
            Crear pedido
          </a>

          <a
            href="/portal/cliente/pedidos"
            className="inline-flex justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Ver mis pedidos
          </a>

          <button
            onClick={() => location.reload()}
            className="inline-flex justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 transition"
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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5">
      <div className="text-xs tracking-wider text-white/50">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-xs text-emerald-300/90">{note}</div>
    </div>
  );
}
