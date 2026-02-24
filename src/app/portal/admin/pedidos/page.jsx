"use client";

import { useEffect, useMemo, useState } from "react";

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

// ✅ AGREGADO: etiquetas legibles
function deliveryLabel(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "delivery") return "Entrega a domicilio";
  if (s === "pickup") return "Recolección";
  // por si guardas otros valores
  if (!s) return "—";
  return s;
}

// ✅ AGREGADO: etiquetas legibles
function paymentLabel(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "cash") return "Efectivo";
  if (s === "tpv") return "TPV";
  if (s === "online") return "En línea";
  if (!s) return "—";
  return s;
}

const STATUS = [
  { v: "all", label: "Todos" },
  { v: "pendiente", label: "Pendiente" },
  { v: "confirmado", label: "Confirmado" },
  { v: "entregado", label: "Entregado" },
  { v: "cancelado", label: "Cancelado" },
];

export default function AdminPedidosPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [clients, setClients] = useState([]);
  const [rows, setRows] = useState([]);

  const [status, setStatus] = useState("all");
  const [clientUserId, setClientUserId] = useState("");

  // ✅ Paginación optimizada (cursor)
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [hasNext, setHasNext] = useState(false);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [cursorStack, setCursorStack] = useState([]);

  // ✅ Total real con filtros (si ya creaste /api/admin/orders/count)
  const [total, setTotal] = useState(0);

  async function loadClients() {
    const r = await fetch("/api/admin/clientes?page=1&pageSize=200", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error cargando clientes");
    setClients(j?.data || []);
  }

  // ✅ Conteo ligero
  async function loadTotal(next = {}) {
    const st = next.status ?? status;
    const cu = next.clientUserId ?? clientUserId;

    const sp = new URLSearchParams();
    sp.set("status", st);
    if (cu) sp.set("client_user_id", cu);

    const r = await fetch(`/api/admin/orders/count?${sp.toString()}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error contando pedidos");

    setTotal(Number(j?.total || 0));
  }

  async function loadOrders(next = {}) {
    const st = next.status ?? status;
    const cu = next.clientUserId ?? clientUserId;

    const cursorToUse =
      Object.prototype.hasOwnProperty.call(next, "cursor") ? next.cursor : currentCursor;

    const sp = new URLSearchParams();
    sp.set("pageSize", String(pageSize));
    sp.set("status", st);
    if (cu) sp.set("client_user_id", cu);
    if (cursorToUse) sp.set("cursor", cursorToUse);

    const r = await fetch(`/api/admin/orders?${sp.toString()}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error cargando pedidos");

    setRows(j?.data || []);
    setHasNext(Boolean(j?.hasNext));
    setNextCursor(j?.nextCursor || null);
    setCurrentCursor(cursorToUse ?? null);
  }

  async function resetAndLoad(next = {}) {
    setPage(1);
    setCursorStack([]);
    setCurrentCursor(null);
    setNextCursor(null);

    // ✅ al cambiar filtros recalcula total y carga página 1
    try {
      await Promise.all([loadTotal(next), loadOrders({ ...next, cursor: null })]);
    } catch (e) {
      // si count falla por algo, igual carga pedidos
      await loadOrders({ ...next, cursor: null }).catch(() => {});
      console.error(e);
    }
  }

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([loadClients(), resetAndLoad({ status: "all", clientUserId: "" })]);
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      setRows((prev) => prev.map((x) => (x.id === orderId ? { ...x, status: nextStatus } : x)));

      // ✅ si estás filtrando, el total puede cambiar cuando cambias status
      await loadTotal({ status, clientUserId });
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
          <h1 className="text-3xl font-semibold text-black">Pedidos</h1>
          <p className="text-sm text-gray-500">Cambia el status y los clientes verán el avance en su portal.</p>
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
            <div className="text-xs font-semibold text-gray-700 mb-1">Status</div>
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
            <div className="text-xs font-semibold text-gray-700 mb-1">Negocio</div>
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

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
            <div className="text-xs text-gray-600">
              Mostrando {rows.length} de {total} (pág. {page})
            </div>
            <div className="text-lg font-semibold text-black">Total: {total} pedidos</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Cargando…</div>
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
                <div key={o.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 w-full">
                      <div className="text-sm font-semibold text-black truncate">Pedido: {o.id}</div>

                      <div className="text-xs text-gray-600">
                        Cliente: <span className="font-semibold text-black">{clienteNombre}</span>
                      </div>

                      <div className="text-xs text-gray-600">
                        Negocio: <span className="font-semibold text-black">{negocioNombre}</span>
                      </div>

                      {/* ✅ AGREGADO: Tipo de entrega */}
                      <div className="text-xs text-gray-600">
                        Entrega:{" "}
                        <span className="font-semibold text-black">{deliveryLabel(o.delivery_method)}</span>
                      </div>

                      {/* ✅ AGREGADO: Método de pago (si lo quieres) */}
                      <div className="text-xs text-gray-600">
                        Método de Pago:{" "}
                        <span className="font-semibold text-black">{paymentLabel(o.payment_method)}</span>
                      </div>

                      <div className="text-xs text-gray-600">Creado el: {fmtDate(o.created_at)}</div>
                      <div className="text-xs text-gray-600">Total: {money(o.total ?? o.subtotal)}</div>

                      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Productos</div>

                        {Array.isArray(o.items) && o.items.length > 0 ? (
                          <div className="space-y-2">
                            {o.items.map((it) => {
                              const meta = [it?.marca, it?.presentacion, it?.unidad]
                                .filter(Boolean)
                                .join(" · ");

                              const qty = Number(it?.qty || 0);
                              const unit = Number(it?.unit_price || 0);
                              const line = Number(it?.line_total || qty * unit);

                              return (
                                <div key={it.id} className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-black truncate">
                                      {it?.nombre || "Producto"}{" "}
                                      <span className="text-xs text-gray-500">({it?.sku || "—"})</span>
                                    </div>

                                    {meta ? <div className="text-xs text-gray-600">{meta}</div> : null}

                                    <div className="text-[11px] text-gray-500">
                                      {qty} × {money(unit)}
                                    </div>
                                  </div>

                                  <div className="text-sm font-semibold text-black">{money(line)}</div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600">Sin detalle de productos.</div>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-[280px]">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Cambiar status</div>
                      <select
                        value={o.status || "pendiente"}
                        disabled={busy}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none disabled:opacity-60"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>

                      {busy ? <div className="mt-1 text-[11px] text-gray-500">Actualizando…</div> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              disabled={page <= 1}
              onClick={goPrev}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40"
            >
              Anterior
            </button>

            <div className="text-sm font-semibold">{page}</div>

            <button
              disabled={!hasNext}
              onClick={goNext}
              className="px-4 py-2 rounded-lg text-white disabled:opacity-40"
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