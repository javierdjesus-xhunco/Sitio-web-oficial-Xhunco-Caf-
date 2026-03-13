"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
  ClipboardList,
  Building2,
} from "lucide-react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

const STATUSES = [
  { v: "pendiente", label: "Pendientes" },
  { v: "confirmada", label: "Confirmadas" },
  { v: "rechazada", label: "Rechazadas" },
  { v: "cancelada", label: "Canceladas" },
];

function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX");
}

function badgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pendiente") return "bg-amber-100 text-amber-800 border-amber-200";
  if (s === "confirmada") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "rechazada") return "bg-red-100 text-red-800 border-red-200";
  if (s === "cancelada") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function SolicitudesSuministrosPageView({ role = "admin" }) {
  const isSuperAdmin = role === "super_admin";

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("pendiente");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(null);

  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientUserId, setClientUserId] = useState("");

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);

  const totalPages = useMemo(() => {
    const c = Number(count);
    if (!Number.isFinite(c) || c < 0) return null;
    return Math.max(1, Math.ceil(c / limit));
  }, [count, limit]);

  const canPrev = offset > 0 && !loading;

  const canNext = useMemo(() => {
    if (loading) return false;
    const c = Number(count);
    if (!Number.isFinite(c)) return rows.length === limit;
    return offset + limit < c;
  }, [loading, count, offset, limit, rows.length]);

  async function loadClientsOnce() {
    const r = await fetch("/api/admin/clientes?page=1&pageSize=500", {
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Error cargando clientes");
    setClients(j?.data || []);
  }

  async function load(next = {}) {
    const st = next.status ?? status;
    const lim = next.limit ?? limit;
    const off = next.offset ?? offset;
    const cu = Object.prototype.hasOwnProperty.call(next, "clientUserId")
      ? next.clientUserId
      : clientUserId;

    setError("");
    setLoading(true);

    try {
      const sp = new URLSearchParams();
      sp.set("status", st);
      sp.set("limit", String(lim));
      sp.set("offset", String(off));
      if (cu) sp.set("client_user_id", cu);

      const r = await fetch(`/api/admin/suministros/solicitudes?${sp.toString()}`, {
        cache: "no-store",
      });
      const j = await r.json().catch(() => ({}));

      if (!r.ok) throw new Error(j?.error || "No se pudieron cargar solicitudes");

      setRows(j?.items || []);
      setCount(
        typeof j?.count !== "undefined" && j?.count !== null ? Number(j.count) : null
      );
    } catch (e) {
      setRows([]);
      setCount(null);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await loadClientsOnce();
      } catch (e) {
        console.error(e);
      } finally {
        await load({ status: "pendiente", offset: 0 }).catch(() => {});
      }
    })();
  }, []);

  useEffect(() => {
    setOffset(0);
    load({ status, limit, offset: 0, clientUserId }).catch(() => {});
  }, [status, limit, clientUserId]);

  useEffect(() => {
    load({ status, limit, offset, clientUserId }).catch(() => {});
  }, [offset]);

  async function updateStatus(id, nextStatus) {
    setBusyId(id);
    setError("");

    try {
      const r = await fetch("/api/admin/suministros/solicitudes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "No se pudo actualizar el status");

      setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status: nextStatus } : x)));

      if (String(status).toLowerCase() === "pendiente") {
        setRows((prev) => prev.filter((x) => x.id !== id));
        if (Number.isFinite(Number(count))) {
          setCount((c) => Math.max(0, Number(c || 0) - 1));
        }
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList size={22} color={BRAND_GREEN} />
            <h1 className="text-3xl font-semibold text-black">
              Solicitudes de suministros {isSuperAdmin ? "· Super administrador" : ""}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Confirma o rechaza solicitudes. El cliente verá el estatus en su portal.
          </p>
        </div>

        <button
          onClick={() => load({ status, limit, offset, clientUserId })}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: BRAND_GREEN }}
          type="button"
        >
          <RefreshCw size={16} />
          Recargar
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Filter size={14} />
              Estatus
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Building2 size={14} />
              Negocio
            </div>
            <select
              value={clientUserId}
              onChange={(e) => setClientUserId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="">Todos los negocios</option>
              {(clients || [])
                .filter((c) => c?.user_id)
                .map((c) => (
                  <option key={c.user_id} value={c.user_id}>
                    {c.label || c.user_id}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-gray-700">Tamaño de página</div>
            <select
              value={String(limit)}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs text-gray-600">
              Mostrando <span className="font-semibold text-black">{rows.length}</span>
              {Number.isFinite(Number(count)) ? (
                <>
                  {" "}
                  de <span className="font-semibold text-black">{count}</span>
                </>
              ) : null}{" "}
              · pág. <span className="font-semibold text-black">{page}</span>
              {totalPages ? (
                <>
                  {" "}
                  / <span className="font-semibold text-black">{totalPages}</span>
                </>
              ) : null}
            </div>
            <div className="text-[11px] text-gray-500">Tip: Pendientes es el flujo principal.</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr className="text-left text-xs text-gray-600">
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Negocio</th>
                <th className="px-4 py-3 font-semibold">Suministro</th>
                <th className="px-4 py-3 font-semibold">Cantidad</th>
                <th className="px-4 py-3 font-semibold">Estatus</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={7}>
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={7}>
                    No hay solicitudes con ese filtro.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const busy = busyId === r.id;
                  const st = String(r.status || "").toLowerCase();

                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">
                        <div className="font-semibold text-black">{fmtDate(r.created_at)}</div>
                        <div className="truncate text-[11px] text-gray-500">ID: {r.id}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-[240px] truncate font-semibold text-black">
                          {r.client_name || "—"}
                        </div>
                        {r.client_email ? (
                          <div className="max-w-[240px] truncate text-[11px] text-gray-500">
                            {r.client_email}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-[240px] truncate font-semibold text-black">
                          {r.business_name || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-[320px] truncate font-semibold text-black">
                          {r.suministro_nombre || "—"}
                        </div>
                        <div className="max-w-[320px] truncate text-[11px] text-gray-500">
                          {r.suministro_marca ? `${r.suministro_marca} · ` : ""}
                          {r.suministro_categoria ? `${r.suministro_categoria} · ` : ""}
                          {r.suministro_sku ? `SKU: ${r.suministro_sku}` : ""}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-xl border border-gray-200 bg-white px-3 py-1 font-semibold text-black">
                          {r.qty}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${badgeClass(
                            st
                          )}`}
                        >
                          {st.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={busy || st !== "pendiente"}
                            onClick={() => updateStatus(r.id, "confirmada")}
                            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50"
                            style={{
                              borderColor: "rgba(0,0,0,0.12)",
                              color: BRAND_GREEN,
                              backgroundColor: "white",
                            }}
                            title="Confirmar"
                          >
                            <CheckCircle2 size={16} />
                            Confirmar
                          </button>

                          <button
                            type="button"
                            disabled={busy || st !== "pendiente"}
                            onClick={() => updateStatus(r.id, "rechazada")}
                            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50"
                            style={{
                              borderColor: "rgba(0,0,0,0.12)",
                              color: "#b91c1c",
                              backgroundColor: "white",
                            }}
                            title="Rechazar"
                          >
                            <XCircle size={16} />
                            Rechazar
                          </button>
                        </div>

                        {busy ? (
                          <div className="mt-1 text-right text-[11px] text-gray-500">
                            Actualizando…
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3">
          <div className="text-xs text-gray-500">
            Página <span className="font-semibold text-black">{page}</span>
            {totalPages ? (
              <>
                {" "}
                de <span className="font-semibold text-black">{totalPages}</span>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setOffset((v) => Math.max(0, v - limit))}
              className="rounded-xl border bg-white px-4 py-2 text-sm transition disabled:opacity-50"
              style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={!canNext}
              onClick={() => setOffset((v) => v + limit)}
              className="rounded-xl px-4 py-2 text-sm text-white transition disabled:opacity-50"
              style={{ backgroundColor: BRAND_GREEN }}
              onMouseEnter={(e) => {
                if (canNext) e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = BRAND_GREEN;
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}