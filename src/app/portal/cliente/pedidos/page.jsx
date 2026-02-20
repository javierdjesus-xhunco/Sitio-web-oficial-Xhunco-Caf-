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

  // ✅ Nuevo: filtro por mes
  // "all" = General (todos)
  // "YYYY-MM" = mes específico
  const [monthFilter, setMonthFilter] = useState("all");

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

  // ✅ Para mostrar “Pedido #N”: numeración viejo->nuevo y vista nuevo->viejo
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

  // ✅ Nuevo: opciones del dropdown (General + meses disponibles)
  const monthOptions = useMemo(() => {
    // Genera keys "YYYY-MM" únicas a partir de created_at
    const set = new Set();
    for (const o of items || []) {
      const ts = o?.created_at;
      if (!ts) continue;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      set.add(key);
    }

    // Ordenar de más reciente a más viejo
    const keys = Array.from(set).sort((a, b) => (a < b ? 1 : -1));

    const label = (key) => {
      const [y, m] = key.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      // Ej: "febrero 2026"
      const pretty = d.toLocaleString("es-MX", { month: "long", year: "numeric" });
      return pretty.charAt(0).toUpperCase() + pretty.slice(1);
    };

    return [
      { value: "all", label: "General (todos)" },
      ...keys.map((k) => ({ value: k, label: label(k) })),
    ];
  }, [items]);

  // ✅ Nuevo: aplicar filtro por mes
  const filteredOrders = useMemo(() => {
    if (monthFilter === "all") return viewOrders;

    return viewOrders.filter((o) => {
      const ts = o?.created_at;
      if (!ts) return false;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return false;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === monthFilter;
    });
  }, [viewOrders, monthFilter]);

  const hasItems = filteredOrders.length > 0;

  // (Ya no hay botón "Recargar", pero dejamos tu función por si la usas en otro lado)
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
            href="/portal/cliente/pedidos/nuevo"
            className="inline-flex justify-center rounded-full px-6 py-3 text-sm text-white transition"
            style={{ backgroundColor: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
          >
            Nuevo pedido
          </Link>

          {/* ✅ Reemplazo del botón Recargar -> Dropdown de meses */}
          <div className="w-full sm:w-auto">
            <label className="sr-only" htmlFor="monthFilter">
              Filtrar por mes
            </label>

            <select
              id="monthFilter"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full sm:w-[260px] rounded-full px-5 py-3 text-sm border transition bg-white"
              style={{ borderColor: BRAND_GREEN, color: "#111" }}
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Si quieres mantener “Recargar” oculto pero disponible: descomenta */}
            {/* <button onClick={handleReload} className="hidden" type="button" /> */}
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-black/60">Cargando pedidos…</div>
          ) : !hasItems ? (
            <div className="rounded-2xl border border-black/10 bg-black/5 p-5 text-sm text-black/70">
              {monthFilter === "all"
                ? "Aún no tienes pedidos."
                : "No hay pedidos en el mes seleccionado."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/portal/cliente/pedidos/${o.id}`}
                  className="rounded-2xl border border-black/10 bg-white p-5 hover:bg-black/5 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-black/50">Pedido</div>
                      <div className="mt-1 font-semibold">Pedido #{o.order_no || "—"}</div>

                      <div className="mt-2 text-xs text-black/50">
                        {formatDate(o.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} />

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
