"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

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

// Etiquetas (ajusta a los status reales que uses)
const STATUS_LABEL = {
  pendiente: "Pendiente",
  "en proceso": "En proceso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

function StatusBadge({ status }) {
  const s = String(status || "pendiente").toLowerCase();

  const map = {
    pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    "en proceso": "bg-blue-100 text-blue-800 border-blue-300",
    finalizado: "bg-green-100 text-green-800 border-green-300",
    cancelado: "bg-red-100 text-red-800 border-red-300",
  };

  const cls = map[s] || "bg-gray-100 text-gray-800 border-gray-300";
  const label = STATUS_LABEL[s] || (status ? String(status) : "—");

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function ClientePedidosPage() {
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/cliente/pedidos/list", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error || "No se pudieron cargar pedidos");
      setItems([]);
      return;
    }

    // tu endpoint /list debe devolver { ok, orders } o { items }
    const arr = Array.isArray(data.orders)
      ? data.orders
      : Array.isArray(data.items)
        ? data.items
        : [];

    setItems(arr);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  // Realtime (si ya lo usas y te funciona, lo dejamos)
  useEffect(() => {
    const channel = supabase
      .channel("cliente-orders-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        const next = payload.new;
        if (!next?.id) return;

        setItems((prev) => {
          const idx = prev.findIndex((x) => x.id === next.id);
          if (idx === -1) return prev;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...next };
          return copy;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Para mostrar “Pedido #N”: construimos la numeración con base en orden viejo->nuevo
  // y además mostramos la lista en orden nuevo->viejo (como ya lo tenías)
  const viewOrders = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];

    // base para numeración: viejo -> nuevo
    const asc = [...arr].sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return da - db;
    });

    const numberById = new Map();
    asc.forEach((o, idx) => numberById.set(o.id, idx + 1));

    // vista: nuevo -> viejo
    const desc = [...arr].sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
    });

    return desc.map((o) => ({
      ...o,
      order_no: numberById.get(o.id) || null,
    }));
  }, [items]);

  const hasItems = viewOrders.length > 0;

  const handleReload = async () => {
    setReloading(true);
    await load();
    setReloading(false);
  };

  return (
    <div className="max-w-[1100px] w-full text-black">
      <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-black/60">Cliente</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold">Mis pedidos</h1>
            <p className="mt-2 text-sm text-black/60">
              Consulta tus pedidos con precios congelados por fecha.
            </p>
          </div>

          <Link
            href="/portal/cliente/dashboard"
            className="rounded-full border px-5 py-2 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
          >
            Volver
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/portal/cliente/pedidos/(acciones)/nuevo"
            className="inline-flex justify-center rounded-full px-6 py-3 text-sm text-white transition"
            style={{ backgroundColor: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
          >
            Nuevo pedido
          </Link>

          <button
            onClick={handleReload}
            disabled={reloading}
            className="inline-flex justify-center rounded-full px-6 py-3 text-sm text-white disabled:opacity-60 transition"
            style={{ backgroundColor: BRAND_GREEN }}
            onMouseEnter={(e) => {
              if (!reloading) e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
            }}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
            type="button"
          >
            {reloading ? "Recargando..." : "Recargar"}
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-black/60">Cargando pedidos…</div>
          ) : !hasItems ? (
            <div className="rounded-2xl border border-black/10 bg-black/5 p-5 text-sm text-black/70">
              Aún no tienes pedidos.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {viewOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/portal/cliente/pedidos/${o.id}`}
                  className="rounded-2xl border border-black/10 bg-white p-5 hover:bg-black/5 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-black/50">Pedido</div>
                      <div className="mt-1 font-semibold">
                        Pedido #{o.order_no || "—"}
                      </div>

                      <div className="mt-2 text-xs text-black/50">
                        {formatDate(o.created_at)}
                      </div>

                      {/* UUID se mantiene internamente (no visible). 
                          Si quieres, lo ponemos en un tooltip o en detalle únicamente */}
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} />

                      <div className="text-right">
                        <div className="text-xs text-black/50">Total</div>
                        <div className="mt-1 text-lg font-semibold">{formatMoney(o.total)}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
