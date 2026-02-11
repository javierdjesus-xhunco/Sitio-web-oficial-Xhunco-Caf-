"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const BRAND_GREEN = "#31572c";

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function formatDateTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDelivery(method) {
  const v = String(method || "").toLowerCase();
  if (v === "delivery") return "Entrega a domicilio";
  if (v === "pickup") return "Recolección en sucursal";
  return method ? String(method) : "—";
}

function formatPayment(method) {
  const v = String(method || "").toLowerCase();
  if (v === "cash") return "Efectivo";
  if (v === "tpv") return "TPV";
  if (v === "online") return "En línea";
  return method ? String(method) : "—";
}

export default function PedidoDetallePage() {
  const router = useRouter();
  const params = useParams();

  const id =
    params?.id ||
    (params ? params[Object.keys(params)[0]] : null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const total = useMemo(() => formatMoney(order?.total), [order?.total]);

  const load = async (silent = false) => {
    if (!id) {
      setLoading(false);
      setError("Falta id (revisa que la ruta sea /portal/cliente/pedidos/[id])");
      return;
    }

    if (!silent) setLoading(true);
    setError("");

    const res = await fetch(`/api/cliente/pedidos/${id}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (!silent) setLoading(false);
      setError(data?.error || "No se pudo cargar el pedido.");
      return;
    }

    setOrder(data?.order || null);
    setItems(Array.isArray(data?.items) ? data.items : []);
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Auto-refresh: trae status actualizado cuando el admin lo cambie
  useEffect(() => {
    if (!id) return;

    const t = setInterval(() => {
      load(true); // silent refresh
    }, 8000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="text-gray-600">Cargando pedido…</div>;

  const address = order?.delivery_address_snapshot || null;

  return (
    <div className="max-w-[1100px] w-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Detalle del pedido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fecha:{" "}
            <span className="text-gray-900 font-medium">
              {formatDateTime(order?.created_at)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/portal/cliente/pedidos/list")}
          className="rounded-full border px-5 py-2 text-sm transition"
          style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
        >
          Volver a Mis pedidos
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!order ? (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
          No hay información del pedido.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Izquierda */}
          <div className="lg:col-span-8 rounded-3xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-xs text-gray-500">Folio (UUID)</div>
                <div className="font-mono text-sm text-gray-900 break-all">
                  {order?.id}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500">Estatus</div>
                <div className="text-sm font-semibold text-gray-900">
                  {String(order?.status || "Pendiente")}
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  (Se actualiza automáticamente)
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="text-sm font-semibold text-gray-900">Productos</div>

              <div className="mt-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-sm text-gray-600">No hay items.</div>
                ) : (
                  items.map((it, idx) => {
                    const name =
                      it?.suministros_xhunco?.nombre ||
                      it?.nombre ||
                      it?.suministro_nombre ||
                      it?.product_name ||
                      `Item ${idx + 1}`;

                    const qty = Number(it?.qty ?? it?.cantidad ?? 0);
                    const unit = Number(it?.unit_price ?? it?.price ?? 0);
                    const line =
                      Number(it?.line_total ?? 0) ||
                      (Number.isFinite(qty) && Number.isFinite(unit) ? qty * unit : 0);

                    return (
                      <div
                        key={it?.id || `${idx}`}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">{name}</div>
                            <div className="text-sm text-gray-600">
                              {formatMoney(unit)} c/u · Cantidad: <b>{qty}</b>
                            </div>
                          </div>

                          <div className="text-sm font-semibold text-gray-900">
                            {formatMoney(line)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Derecha */}
          <div className="lg:col-span-4 rounded-3xl border border-gray-200 bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Resumen</div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold text-gray-900">{total}</div>
            </div>

            {/* Entrega */}
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Entrega</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDelivery(order?.delivery_method)}
              </div>

              {String(order?.delivery_method || "").toLowerCase() === "delivery" ? (
                <div className="mt-2 text-sm text-gray-700">
                  <div className="text-xs text-gray-500 mb-1">Domicilio</div>
                  {address ? (
                    <>
                      <div>
                        {address?.street || "—"}{" "}
                        {address?.ext_number ? `#${address.ext_number}` : ""}
                        {address?.int_number ? ` Int ${address.int_number}` : ""}
                      </div>
                      <div>
                        {address?.neighborhood || "—"}, {address?.municipality || "—"}
                      </div>
                      <div>
                        {address?.state || "—"} · {address?.postal_code || "—"}
                      </div>
                    </>
                  ) : (
                    <div className="text-red-700 text-sm">
                      No hay domicilio guardado en el pedido.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Pago */}
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Pago</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatPayment(order?.payment_method)}
              </div>

              {/* si guardaste payment_snapshot, puedes mostrar últimos 4 */}
              {order?.payment_snapshot?.card_ui?.number_last4 ? (
                <div className="mt-1 text-sm text-gray-700">
                  Tarjeta •••• {order.payment_snapshot.card_ui.number_last4}
                </div>
              ) : null}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Nota: pago/entrega se muestran si fueron guardados en <b>orders</b>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
