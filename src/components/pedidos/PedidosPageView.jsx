"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

const BRAND_GREEN = "#31572c";

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("es-MX");
  } catch {
    return iso || "—";
  }
}

function deliveryLabel(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "delivery") return "Entrega a domicilio";
  if (s === "pickup") return "Recolección";
  if (!s) return "—";
  return s;
}

function paymentLabel(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "cash") return "Efectivo";
  if (s === "tpv") return "TPV";
  if (s === "online") return "En línea";
  if (!s) return "—";
  return s;
}

function paymentStatusLabel(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "paid") return "Pagado";
  if (s === "pending") return "Pendiente de pago";
  if (!s) return "—";
  return s;
}

function statusLabel(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "pendiente") return "Pendiente";
  if (s === "confirmado") return "Confirmado";
  if (s === "en_preparacion") return "En preparación";
  if (s === "en preparación") return "En preparación";
  if (s === "en ruta") return "En ruta";
  if (s === "en_ruta") return "En ruta";
  if (s === "entregado") return "Entregado";
  if (s === "cancelado") return "Cancelado";
  return v || "—";
}

const STATUS = [
  { v: "all", label: "Todos" },
  { v: "pendiente", label: "Pendiente" },
  { v: "confirmado", label: "Confirmado" },
  { v: "en_preparacion", label: "En preparación" },
  { v: "en_ruta", label: "En ruta" },
  { v: "entregado", label: "Entregado" },
  { v: "cancelado", label: "Cancelado" },
];

export default function PedidosPageView({ role = "admin" }) {
  const isSuperAdmin = role === "super_admin";

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [clients, setClients] = useState([]);
  const [rows, setRows] = useState([]);

  const [status, setStatus] = useState("all");
  const [clientUserId, setClientUserId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [hasNext, setHasNext] = useState(false);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [cursorStack, setCursorStack] = useState([]);

  const [total, setTotal] = useState(0);

  // expandir / contraer productos por pedido
  const [expandedProducts, setExpandedProducts] = useState({});

  // realtime
  const mountedRef = useRef(false);
  const realtimeTimerRef = useRef(null);
  const refreshingRealtimeRef = useRef(false);

  async function loadClients() {
    const r = await fetch("/api/admin/clientes?page=1&pageSize=200", {
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error cargando clientes");
    setClients(j?.data || []);
  }

  async function loadTotal(next = {}) {
    const st = next.status ?? status;
    const cu = next.clientUserId ?? clientUserId;

    const sp = new URLSearchParams();
    sp.set("status", st);
    if (cu) sp.set("client_user_id", cu);

    const r = await fetch(`/api/admin/orders/count?${sp.toString()}`, {
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error contando pedidos");

    setTotal(Number(j?.total || 0));
  }

  async function loadOrders(next = {}) {
    const st = next.status ?? status;
    const cu = next.clientUserId ?? clientUserId;

    const cursorToUse =
      Object.prototype.hasOwnProperty.call(next, "cursor")
        ? next.cursor
        : currentCursor;

    const sp = new URLSearchParams();
    sp.set("pageSize", String(pageSize));
    sp.set("status", st);
    if (cu) sp.set("client_user_id", cu);
    if (cursorToUse) sp.set("cursor", cursorToUse);

    const r = await fetch(`/api/admin/orders?${sp.toString()}`, {
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error cargando pedidos");

    setRows(j?.data || []);
    setHasNext(Boolean(j?.hasNext));
    setNextCursor(j?.nextCursor || null);
    setCurrentCursor(cursorToUse ?? null);
  }

  const refreshCurrentPage = useCallback(async () => {
    if (refreshingRealtimeRef.current) return;
    refreshingRealtimeRef.current = true;

    try {
      await Promise.all([
        loadTotal({ status, clientUserId }),
        loadOrders({ status, clientUserId, cursor: currentCursor }),
      ]);
    } catch (e) {
      console.error("Error refrescando pedidos en tiempo real:", e);
    } finally {
      refreshingRealtimeRef.current = false;
    }
  }, [status, clientUserId, currentCursor]);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);

    realtimeTimerRef.current = setTimeout(() => {
      refreshCurrentPage().catch(() => {});
    }, 500);
  }, [refreshCurrentPage]);

  async function resetAndLoad(next = {}) {
    setPage(1);
    setCursorStack([]);
    setCurrentCursor(null);
    setNextCursor(null);

    try {
      await Promise.all([loadTotal(next), loadOrders({ ...next, cursor: null })]);
    } catch (e) {
      await loadOrders({ ...next, cursor: null }).catch(() => {});
      console.error(e);
    }
  }

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([
        loadClients(),
        resetAndLoad({ status: "all", clientUserId: "" }),
      ]);
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  function toggleProducts(orderId) {
    setExpandedProducts((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const supabase = getSupabaseBrowser();

    const channel = supabase
      .channel(`orders-live-${role}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        () => {
          if (!mountedRef.current) return;
          scheduleRealtimeRefresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => {
          if (!mountedRef.current) return;
          scheduleRealtimeRefresh();
        }
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [role, scheduleRealtimeRefresh]);

  const clientLabelById = useMemo(() => {
    const m = new Map();
    (clients || []).forEach((c) => {
      if (c?.user_id) m.set(c.user_id, c.label || c.user_id);
    });
    return m;
  }, [clients]);

  async function updateStatus(orderId, nextStatus) {
    setSavingId(orderId);
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "No se pudo actualizar el status");

      setRows((prev) =>
        prev.map((x) => (x.id === orderId ? { ...x, status: nextStatus } : x))
      );

      await loadTotal({ status, clientUserId });
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setSavingId(null);
    }
  }

  async function updatePaymentStatus(orderId, nextPaymentStatus) {
    setSavingId(orderId);
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: nextPaymentStatus }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "No se pudo actualizar el estado de pago");

      const nextPaidAt = j?.paid_at ?? null;
      const nextPaidBy = j?.paid_by ?? null;

      setRows((prev) =>
        prev.map((x) =>
          x.id === orderId
            ? {
                ...x,
                payment_status: nextPaymentStatus,
                ...(nextPaidAt !== null ? { paid_at: nextPaidAt } : {}),
                ...(nextPaidBy !== null ? { paid_by: nextPaidBy } : {}),
              }
            : x
        )
      );
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setSavingId(null);
    }
  }

  async function goNext() {
    if (!hasNext || !nextCursor) return;

    setCursorStack((prev) => [...prev, currentCursor]);
    setPage((p) => p + 1);
    await loadOrders({ cursor: nextCursor });
  }

  async function goPrev() {
    if (page <= 1) return;

    const prevCursor = cursorStack[cursorStack.length - 1] ?? null;
    setCursorStack((prev) => prev.slice(0, -1));

    setPage((p) => Math.max(1, p - 1));
    await loadOrders({ cursor: prevCursor });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-black">
            Pedidos {isSuperAdmin ? "· Super administrador" : ""}
          </h1>
          <p className="text-sm text-gray-500">
            Cambia el status y los clientes verán el avance en su portal.
          </p>
        </div>

        <button
          onClick={() => resetAndLoad({ status, clientUserId })}
          disabled={loading}
          className="rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: BRAND_GREEN }}
        >
          Recargar
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="mb-1 text-xs font-semibold text-gray-700">Status</div>
            <select
              value={status}
              onChange={async (e) => {
                const v = e.target.value;
                setStatus(v);
                await resetAndLoad({ status: v, clientUserId });
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              {STATUS.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-gray-700">Negocio</div>
            <select
              value={clientUserId}
              onChange={async (e) => {
                const v = e.target.value;
                setClientUserId(v);
                await resetAndLoad({ status, clientUserId: v });
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="">Todos los negocios</option>
              {(clients || [])
                .filter((c) => c?.user_id)
                .map((c) => (
                  <option key={c.user_id} value={c.user_id}>
                    {c.label}
                  </option>
                ))}
            </select>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs text-gray-600">
              Mostrando {rows.length} de {total} (pág. {page})
            </div>
            <div className="text-lg font-semibold text-black">
              Total: {total} pedidos
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Cargando…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          No hay pedidos con esos filtros.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((o) => {
              const busy = savingId === o.id;

              const negocioNombre =
                o?.negocio_nombre ||
                clientLabelById.get(o.client_user_id) ||
                o.client_user_id ||
                "—";

              const clienteNombre = o?.cliente_nombre || "—";

              return (
                <div
                  key={o.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 w-full">
                      <div className="truncate text-sm font-semibold text-black">
                        Pedido: {o.id}
                      </div>

                      <div className="text-xs text-gray-600">
                        Cliente:{" "}
                        <span className="font-semibold text-black">
                          {clienteNombre}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        Negocio:{" "}
                        <span className="font-semibold text-black">
                          {negocioNombre}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        Entrega:{" "}
                        <span className="font-semibold text-black">
                          {deliveryLabel(o.delivery_method)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        Método de Pago:{" "}
                        <span className="font-semibold text-black">
                          {paymentLabel(o.payment_method)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        Pago:{" "}
                        <span className="font-semibold text-black">
                          {paymentStatusLabel(o.payment_status)}
                        </span>
                        {o?.paid_at ? (
                          <span className="text-gray-500">
                            {" "}
                            · {fmtDate(o.paid_at)}
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs text-gray-600">
                        Creado el: {fmtDate(o.created_at)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Total: {money(o.total ?? o.subtotal)}
                      </div>

                      <div className="text-xs text-gray-600">
                        Status actual:{" "}
                        <span className="font-semibold text-black">
                          {statusLabel(o.status)}
                        </span>
                      </div>

                      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-2 text-xs font-semibold text-gray-700">
                          Productos
                        </div>

                        {Array.isArray(o.items) && o.items.length > 0 ? (
                          (() => {
                            const isExpanded = !!expandedProducts[o.id];
                            const visibleItems = isExpanded ? o.items : o.items.slice(0, 3);
                            const hasMore = o.items.length > 3;

                            return (
                              <div className="space-y-2">
                                {visibleItems.map((it) => {
                                  const meta = [it?.marca, it?.presentacion, it?.unidad]
                                    .filter(Boolean)
                                    .join(" · ");

                                  const qty = Number(it?.qty || 0);
                                  const unit = Number(it?.unit_price || 0);
                                  const line = Number(it?.line_total || qty * unit);

                                  return (
                                    <div
                                      key={it.id}
                                      className="flex items-start justify-between gap-3"
                                    >
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-black">
                                          {it?.nombre || "Producto"}{" "}
                                          <span className="text-xs text-gray-500">
                                            ({it?.sku || "—"})
                                          </span>
                                        </div>

                                        {meta ? (
                                          <div className="text-xs text-gray-600">
                                            {meta}
                                          </div>
                                        ) : null}

                                        <div className="text-[11px] text-gray-500">
                                          {qty} × {money(unit)}
                                        </div>
                                      </div>

                                      <div className="text-sm font-semibold text-black">
                                        {money(line)}
                                      </div>
                                    </div>
                                  );
                                })}

                                {hasMore ? (
                                  <div className="pt-1">
                                    <button
                                      type="button"
                                      onClick={() => toggleProducts(o.id)}
                                      className="text-xs font-semibold hover:underline"
                                      style={{ color: BRAND_GREEN }}
                                    >
                                      {isExpanded
                                        ? "Mostrar menos"
                                        : `Mostrar todo (${o.items.length} productos)`}
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-xs text-gray-600">
                            Sin detalle de productos.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full space-y-3 md:w-[280px]">
                      <div>
                        <div className="mb-1 text-xs font-semibold text-gray-700">
                          Cambiar status
                        </div>
                        <select
                          value={o.status || "pendiente"}
                          disabled={busy}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none disabled:opacity-60"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="en_preparacion">En preparación</option>
                          <option value="en_ruta">En ruta</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-semibold text-gray-700">
                          Pago
                        </div>
                        <select
                          value={String(o.payment_status || "pending").toLowerCase()}
                          disabled={busy}
                          onChange={(e) => updatePaymentStatus(o.id, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none disabled:opacity-60"
                        >
                          <option value="pending">Pendiente de pago</option>
                          <option value="paid">Pagado</option>
                        </select>
                      </div>

                      {busy ? (
                        <div className="text-[11px] text-gray-500">
                          Actualizando…
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              disabled={page <= 1}
              onClick={goPrev}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 disabled:opacity-40"
            >
              Anterior
            </button>

            <div className="text-sm font-semibold">{page}</div>

            <button
              disabled={!hasNext}
              onClick={goNext}
              className="rounded-lg px-4 py-2 text-white disabled:opacity-40"
              style={{ background: BRAND_GREEN }}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  );
}