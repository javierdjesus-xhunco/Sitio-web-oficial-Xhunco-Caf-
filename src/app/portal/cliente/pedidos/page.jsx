"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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

    setItems(Array.isArray(data.items) ? data.items : []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("cliente-orders-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const next = payload.new;
          if (!next?.id) return;

          setItems((prev) => {
            const idx = prev.findIndex((x) => x.id === next.id);
            if (idx === -1) return prev;
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...next };
            return copy;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
    });
  }, [items]);

  const hasItems = sortedItems.length > 0;

  const handleReload = async () => {
    setReloading(true);
    await load();
    setReloading(false);
  };

  return (
    <div className="max-w-[1100px] w-full">
      <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-black/60">Cliente</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold">
              Mis pedidos
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Consulta tus pedidos con precios congelados por fecha.
            </p>
          </div>

          <Link
            href="/portal/cliente/dashboard"
            className="rounded-full border border-black/20 px-5 py-2 text-sm text-black hover:bg-black/5 transition"
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
            className="inline-flex justify-center rounded-full border border-emerald-500 px-6 py-3 text-sm text-emerald-700 hover:bg-emerald-50 transition"
          >
            Nuevo pedido
          </Link>

          <button
            onClick={handleReload}
            disabled={reloading}
            className="inline-flex justify-center rounded-full border border-emerald-500 px-6 py-3 text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 transition"
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
              {sortedItems.map((o) => (
                <Link
                  key={o.id}
                  href={`/portal/cliente/pedidos/${o.id}`}
                  className="rounded-2xl border border-black/10 bg-white p-5 hover:bg-black/5 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-black/50">Folio</div>
                      <div className="mt-1 font-medium break-all">
                        {o.id}
                      </div>
                      <div className="mt-2 text-xs text-black/50">
                        {formatDate(o.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-black/20 px-3 py-1 text-xs text-black">
                        {STATUS_LABEL[o.status] || o.status || "—"}
                      </span>

                      <div className="text-right">
                        <div className="text-xs text-black/50">Total</div>
                        <div className="mt-1 text-lg font-semibold">
                          {formatMoney(o.total)}
                        </div>
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
