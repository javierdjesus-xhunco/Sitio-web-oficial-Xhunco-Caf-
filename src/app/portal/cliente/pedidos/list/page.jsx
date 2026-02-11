"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

function normalizeStatus(s) {
  const v = String(s || "").toLowerCase().trim();
  // soporta variantes
  if (["pendiente", "pending"].includes(v)) return "Pendiente";
  if (["en proceso", "proceso", "processing", "in_progress"].includes(v)) return "En proceso";
  if (["finalizado", "completado", "completed", "done"].includes(v)) return "Finalizado";
  if (["cancelado", "canceled", "cancelled"].includes(v)) return "Cancelado";
  return s ? String(s) : "Pendiente";
}

function statusStyles(label) {
  const v = String(label || "").toLowerCase();
  if (v.includes("pend")) return "border-amber-200 bg-amber-50 text-amber-800";
  if (v.includes("proceso")) return "border-sky-200 bg-sky-50 text-sky-800";
  if (v.includes("final")) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (v.includes("canc")) return "border-red-200 bg-red-50 text-red-700";
  return "border-gray-200 bg-gray-50 text-gray-700";
}

export default function MisPedidosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");

    // ✅ Ajusta si tu endpoint lista es otro
    const res = await fetch("/api/cliente/pedidos", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data?.error || "No se pudieron cargar tus pedidos.");
      return;
    }

    // soporta distintos formatos: {orders: []} o {items: []}
    const list = data?.orders || data?.items || [];
    setOrders(Array.isArray(list) ? list : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Ordenar por fecha desc (más nuevo arriba)
  const sorted = useMemo(() => {
    const arr = [...orders];
    arr.sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));
    return arr;
  }, [orders]);

  // Calcular Pedido # (más viejo = #1, más nuevo = #N)
  const numbered = useMemo(() => {
    const n = sorted.length;
    return sorted.map((o, idx) => ({
      ...o,
      pedido_no: n - idx,
    }));
  }, [sorted]);

  return (
    <div className="max-w-[1100px] w-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900">Mis pedidos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Consulta tus pedidos con precios congelados por fecha.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/cliente/pedidos/nuevo"
            className="rounded-full border px-5 py-2 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
          >
            Nuevo pedido
          </Link>

          <button
            type="button"
            onClick={load}
            className="rounded-full border px-5 py-2 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
          >
            Recargar
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-10 text-gray-600">Cargando pedidos…</div>
      ) : (
        <div className="mt-8 space-y-4">
          {numbered.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
              Aún no tienes pedidos.
            </div>
          ) : (
            numbered.map((o) => {
              const statusLabel = normalizeStatus(o?.status);
              const created = formatDateTime(o?.created_at);
              const total = formatMoney(o?.total);

              return (
                <Link
                  key={o.id}
                  href={`/portal/cliente/pedidos/${o.id}`}
                  className="block rounded-3xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="text-sm text-gray-500">Pedido</div>
                      <div className="text-xl font-semibold text-gray-900">
                        #{o.pedido_no}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">{created}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={[
                          "rounded-full border px-3 py-1 text-xs font-medium",
                          statusStyles(statusLabel),
                        ].join(" ")}
                      >
                        {statusLabel}
                      </span>

                      <div className="text-right">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-lg font-semibold text-gray-900">{total}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
