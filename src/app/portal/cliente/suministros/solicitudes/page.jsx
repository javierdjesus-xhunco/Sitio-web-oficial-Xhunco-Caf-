"use client";

import { useEffect, useMemo, useState } from "react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX");
}

function badge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pendiente") return "bg-amber-100 text-amber-800 border-amber-200";
  if (s === "confirmada") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "rechazada") return "bg-red-100 text-red-800 border-red-200";
  if (s === "cancelada") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function MisSolicitudesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ default: pendientes
  const [status, setStatus] = useState("pendiente");
  const [items, setItems] = useState([]);

  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((count || 0) / limit));
  }, [count, limit]);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);

  const load = async (nextOffset = offset, nextStatus = status) => {
    setError("");
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      qs.set("offset", String(nextOffset));
      qs.set("status", nextStatus);

      const res = await fetch(`/api/cliente/suministros/solicitudes/list?${qs}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudieron cargar solicitudes");
        setItems([]);
        setCount(0);
        setLoading(false);
        return;
      }

      setItems(data.items || []);
      setCount(Number(data.count || 0));
      setLoading(false);
    } catch {
      setError("Error de red al cargar solicitudes");
      setLoading(false);
    }
  };

  // cambia filtro => reset offset y carga
  useEffect(() => {
    setOffset(0);
    load(0, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // cambia paginación => carga
  useEffect(() => {
    load(offset, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  return (
    <div className="w-full max-w-none text-black">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
            Mis solicitudes de suministros
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Da seguimiento al estatus de tus solicitudes (pendiente / confirmada / rechazada).
          </p>
        </div>

        <a
          href="/portal/cliente/dashboard"
          className="rounded-full border px-5 py-2 text-sm transition"
          style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, backgroundColor: "white" }}
        >
          Volver
        </a>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm font-semibold text-gray-900">
            Solicitudes{" "}
            <span className="text-gray-500 font-normal">({count || 0})</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600">Filtrar</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none"
              style={{ borderColor: "rgba(0,0,0,0.12)" }}
            >
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="rechazada">Rechazadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="ALL">Todas</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-sm text-gray-600">Cargando...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">
              No tienes solicitudes para este filtro.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
              {items.map((r) => (
                <div key={r.id} className="p-4 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {r.suministro_nombre}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        {r.suministro_marca ? `${r.suministro_marca} · ` : ""}
                        {r.suministro_categoria ? `${r.suministro_categoria} · ` : ""}
                        {r.suministro_sku ? `SKU: ${r.suministro_sku}` : ""}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Creada: {fmtDate(r.created_at)}
                        {r.handled_at ? ` · Atendida: ${fmtDate(r.handled_at)}` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-900">
                        Cantidad: <span className="font-semibold">{r.qty}</span>
                      </div>

                      <span className={`text-[11px] px-3 py-1 rounded-full border ${badge(r.status)}`}>
                        {String(r.status || "").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {String(r.status).toLowerCase() === "confirmada" ? (
                    <div className="mt-2 text-xs text-emerald-800">
                      ✅ Tu solicitud fue confirmada. Si necesitas seguimiento, contáctanos.
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Página <span className="text-gray-900 font-semibold">{page}</span> de{" "}
            <span className="text-gray-900 font-semibold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={offset <= 0 || loading}
              onClick={() => setOffset((v) => Math.max(0, v - limit))}
              className="rounded-xl border bg-white px-4 py-2 text-sm transition disabled:opacity-50"
              style={{ borderColor: "rgba(0,0,0,0.12)", color: BRAND_GREEN }}
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={offset + limit >= count || loading}
              onClick={() => setOffset((v) => v + limit)}
              className="rounded-xl px-4 py-2 text-sm text-white transition disabled:opacity-50"
              style={{ backgroundColor: BRAND_GREEN }}
              onMouseEnter={(e) => {
                if (!loading && offset + limit < count) {
                  e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                }
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
    </div>
  );
}