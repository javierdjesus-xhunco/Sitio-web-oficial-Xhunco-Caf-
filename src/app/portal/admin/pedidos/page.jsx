"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const BRAND_GREEN = "#31572c";

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "en_preparacion", label: "En preparación" },
  { value: "en_ruta", label: "En ruta" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

const STATUS_STYLES = {
  pendiente: "bg-gray-100 text-gray-800 border-gray-200",
  confirmado: "bg-blue-50 text-blue-800 border-blue-200",
  en_preparacion: "bg-yellow-50 text-yellow-800 border-yellow-200",
  en_ruta: "bg-purple-50 text-purple-800 border-purple-200",
  entregado: "bg-green-50 text-green-800 border-green-200",
  cancelado: "bg-red-50 text-red-800 border-red-200",
};

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function deliveryLabel(v) {
  const s = String(v || "").toLowerCase();
  if (s === "delivery") return "Entrega a domicilio";
  if (s === "pickup") return "Recolección";
  return v || "—";
}

function paymentLabel(v) {
  const s = String(v || "").toLowerCase();
  if (s === "cash" || s === "efectivo") return "Efectivo";
  if (s === "tpv") return "TPV";
  if (s === "online" || s === "en_linea") return "En línea";
  return v || "—";
}

function statusLabel(v) {
  return STATUS_OPTIONS.find((s) => s.value === v)?.label || v || "—";
}

/** Toasts (mini notificaciones) */
function ToastStack({ toasts, removeToast }) {
  return (
    <div className="fixed right-6 top-6 z-50 flex w-[360px] max-w-[90vw] flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "rounded-2xl border bg-white p-4 shadow-sm transition",
            t.type === "success"
              ? "border-green-200"
              : t.type === "error"
              ? "border-red-200"
              : "border-gray-200",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            {t.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
            )}

            <div className="flex-1">
              <div className="text-sm font-semibold text-black">{t.title}</div>
              {t.message && <div className="mt-1 text-xs text-gray-600">{t.message}</div>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPedidosPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);

  // Mapa: orderId -> boolean (si está actualizando)
  const [updatingMap, setUpdatingMap] = useState({});
  // Toasts
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef(new Map());

  function pushToast({ type, title, message, ttlMs = 2800 }) {
    const id = crypto.randomUUID?.() || String(Date.now() + Math.random());
    setToasts((prev) => [{ id, type, title, message }, ...prev].slice(0, 4)); // máx 4
    const timer = setTimeout(() => removeToast(id), ttlMs);
    toastTimers.current.set(id, timer);
  }

  function removeToast(id) {
    const timer = toastTimers.current.get(id);
    if (timer) clearTimeout(timer);
    toastTimers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/orders", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setOrders(j?.data || []);
    } catch (e) {
      setError(String(e?.message || e));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    return () => {
      // cleanup toasts timers
      for (const [, timer] of toastTimers.current.entries()) clearTimeout(timer);
      toastTimers.current.clear();
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (orders || []).filter((o) => {
      if (statusFilter !== "all" && (o.status || "pendiente") !== statusFilter) return false;
      if (!term) return true;

      const cliente = (o.cliente_nombre || "").toLowerCase();
      const id = (o.id || "").toLowerCase();
      const status = (o.status || "").toLowerCase();
      const items = (o.items || [])
        .map((it) => `${it.nombre} ${it.sku} ${it.marca} ${it.presentacion} ${it.unidad}`)
        .join(" ")
        .toLowerCase();

      return cliente.includes(term) || id.includes(term) || status.includes(term) || items.includes(term);
    });
  }, [orders, q, statusFilter]);

  /**
   * ✅ Update status
   * - Optimistic UI
   * - Si nextStatus === "confirmado", automáticamente pasa a "en_preparacion" (sin notificaciones extra).
   */
  async function updateStatus(orderId, nextStatus, opts = {}) {
    const { chainAfterConfirm = true } = opts;

    // Optimistic UI
    const prevStatus = orders.find((o) => o.id === orderId)?.status || "pendiente";

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
    setUpdatingMap((m) => ({ ...m, [orderId]: true }));

    try {
      const r = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        // rollback
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: prevStatus } : o)));

        pushToast({
          type: "error",
          title: "No se pudo actualizar el status",
          message: j?.error ? `${j.error}` : `HTTP ${r.status}`,
          ttlMs: 4000,
        });
        return;
      }

      pushToast({
        type: "success",
        title: "Se actualizó el status correctamente",
        message: `Pedido ${orderId.slice(0, 8)}… → ${statusLabel(nextStatus)}`,
      });

      // ✅ CADENA: confirmado -> en_preparacion (automático)
      if (chainAfterConfirm && nextStatus === "confirmado") {
        setTimeout(() => {
          updateStatus(orderId, "en_preparacion", { chainAfterConfirm: false });
        }, 300);
      }
    } catch (e) {
      // rollback
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: prevStatus } : o)));

      pushToast({
        type: "error",
        title: "Error de red",
        message: String(e?.message || e),
        ttlMs: 4000,
      });
    } finally {
      setUpdatingMap((m) => ({ ...m, [orderId]: false }));
    }
  }

  return (
    <section className="space-y-6">
      <ToastStack toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-black">Pedidos</h1>
          <p className="text-sm text-gray-500">Admin: visualizar pedidos y actualizar status.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none"
          >
            <option value="all">Todos los status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por cliente, id o producto…"
            className="w-full sm:w-[360px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          />

          <button
            onClick={load}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: BRAND_GREEN }}
          >
            Recargar
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Body */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            Cargando pedidos…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            No hay pedidos para mostrar.
          </div>
        ) : (
          filtered.map((o) => {
            const st = o.status || "pendiente";
            const updating = !!updatingMap[o.id];

            return (
              <div key={o.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                {/* Top */}
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Cliente</div>
                    <div className="text-lg font-semibold text-black">{o.cliente_nombre || "—"}</div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
                      <span className="rounded-full border border-gray-200 px-3 py-1">
                        Pedido: {o.id}
                      </span>

                      <span className="rounded-full border border-gray-200 px-3 py-1">
                        Fecha: {fmtDate(o.created_at)}
                      </span>

                      <span className="rounded-full border border-gray-200 px-3 py-1">
                        Entrega: {deliveryLabel(o.delivery_method)}
                      </span>

                      <span className="rounded-full border border-gray-200 px-3 py-1">
                        Pago: {paymentLabel(o.payment_method)}
                      </span>

                      <span className="rounded-full border border-gray-200 px-3 py-1 font-semibold">
                        Total: {money(o.total)}
                      </span>

                      {/* Badge status */}
                      <span
                        className={[
                          "rounded-full border px-3 py-1 font-semibold",
                          STATUS_STYLES[st] || "bg-gray-100 text-gray-800 border-gray-200",
                        ].join(" ")}
                      >
                        {statusLabel(st)}
                      </span>
                    </div>
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-3">
                    <select
                      value={st}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      disabled={updating}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    {/* Indicator */}
                    <div
                      className={[
                        "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold",
                        updating
                          ? "border-gray-300 bg-gray-50 text-gray-800"
                          : "border-green-200 bg-green-50 text-green-800",
                      ].join(" ")}
                      title={updating ? "Guardando cambios…" : "Actualizado"}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Actualizando…</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Actualizado</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <div className="mb-2 text-xs font-semibold text-gray-700">Pedido</div>

                  <ul className="space-y-2">
                    {(o.items || []).map((it) => (
                      <li key={it.id} className="flex items-start justify-between gap-4 text-sm">
                        <div className="text-black">
                          <div className="font-medium">
                            {it.nombre} <span className="text-gray-500">({it.sku})</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {it.marca ? `${it.marca} · ` : ""}
                            {it.presentacion ? `${it.presentacion} · ` : ""}
                            Cant: {it.qty} · Unit: {money(it.unit_price)}
                          </div>
                        </div>
                        <div className="shrink-0 font-semibold text-gray-900">{money(it.line_total)}</div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex justify-end gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                      <div className="text-gray-600">Subtotal</div>
                      <div className="font-semibold text-black">{money(o.subtotal)}</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                      <div className="text-gray-600">Total</div>
                      <div className="font-semibold text-black">{money(o.total)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
