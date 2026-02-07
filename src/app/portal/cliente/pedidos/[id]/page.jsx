"use client";

import { useEffect, useState } from "react";

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

export default function PedidoDetallePage({ params }) {
  const orderId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/cliente/pedidos/${orderId}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudo cargar el pedido");
        setOrder(null);
        setItems([]);
        setLoading(false);
        return;
      }
      setOrder(data.order || null);
      setItems(data.items || []);
      setLoading(false);
    })();
  }, [orderId]);

  return (
    <div className="max-w-[1100px] w-full">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_0_80px_rgba(255,255,255,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-white/70">Cliente</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold">Detalle de pedido</h1>
            <p className="mt-2 text-sm text-white/60 break-all">Folio: {orderId}</p>
          </div>

          <a
            href="/portal/cliente/pedidos"
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

        {loading ? (
          <div className="mt-6 text-sm text-white/60">Cargando…</div>
        ) : order ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <KPI title="STATUS" value={STATUS_LABEL[order.status] || order.status || "—"} note="Estado actual" />
              <KPI title="TIER" value={order.price_tier_snapshot || "—"} note="Congelado al crear" />
              <KPI title="FECHA" value={formatDate(order.created_at)} note="Creación" />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-medium text-white/80">Productos</div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {items.map((it) => {
                  const s = it.suministro;
                  return (
                    <div
                      key={it.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="font-medium">
                            {s?.nombre || "Producto"}
                          </div>
                          <div className="mt-1 text-xs text-white/60">
                            {(s?.marca ? `${s.marca} · ` : "")}
                            {(s?.presentacion ? `${s.presentacion}` : "")}
                            {(s?.unidad ? ` · ${s.unidad}` : "")}
                            {s?.sku ? ` · ${s.sku}` : ""}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xs text-white/50">Cantidad</div>
                            <div className="mt-1 font-semibold">{it.qty}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/50">Precio unit.</div>
                            <div className="mt-1 font-semibold">{formatMoney(it.unit_price)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/50">Total</div>
                            <div className="mt-1 text-lg font-semibold">{formatMoney(it.line_total)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="text-sm text-white/60">Subtotal</div>
                <div className="text-lg font-semibold">{formatMoney(order.subtotal)}</div>
              </div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="text-sm text-white/60">Total</div>
                <div className="text-2xl font-semibold">{formatMoney(order.total)}</div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function KPI({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5">
      <div className="text-xs tracking-wider text-white/50">{title}</div>
      <div className="mt-2 break-words text-lg font-semibold md:text-2xl">{value}</div>
      <div className="mt-2 text-xs text-emerald-300/90">{note}</div>
    </div>
  );
}
