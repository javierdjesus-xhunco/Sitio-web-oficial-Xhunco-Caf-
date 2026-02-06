"use client";

import { useEffect, useMemo, useState } from "react";

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("es-MX");
  } catch {
    return iso || "—";
  }
}

const STATUS_LABEL = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function ClientePedidosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      const res = await fetch("/api/cliente/pedidos/list", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudieron cargar pedidos");
        setItems([]);
        setLoading(false);
        return;
      }
      setItems(data.items || []);
      setLoading(false);
    })();
  }, []);

  const hasItems = items.length > 0;

  return (
    <div className="max-w-[1100px] w-full">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_0_80px_rgba(255,255,255,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-white/70">Cliente</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold">Mis pedidos</h1>
            <p className="mt-2 text-sm text-white/60">
              Consulta tus pedidos con precios congelados por fecha.
            </p>
          </div>

          <a
            href="/portal/cliente/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Volver
          </a>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="/portal/cliente/pedidos/nuevo"
            className="inline-flex justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm text-white/90 hover:bg-emerald-400/15 transition"
          >
            Nuevo pedido
          </a>
          <button
            onClick={() => location.reload()}
            className="inline-flex justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Recargar
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-white/60">Cargando pedidos…</div>
          ) : !hasItems ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/70">
              Aún no tienes pedidos.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {items.map((o) => (
                <a
                  key={o.id}
                  href={`/portal/cliente/pedidos/${o.id}`}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5 hover:bg-white/5 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-xs text-white/50">Folio</div>
                      <div className="mt-1 font-medium break-all">{o.id}</div>
                      <div className="mt-2 text-xs text-white/50">
                        {formatDate(o.created_at)} · Tier:{" "}
                        <span className="text-white/70">{o.price_tier_snapshot || "—"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80">
                        {STATUS_LABEL[o.status] || o.status || "—"}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-white/50">Total</div>
                        <div className="mt-1 text-lg font-semibold">{formatMoney(o.total)}</div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
