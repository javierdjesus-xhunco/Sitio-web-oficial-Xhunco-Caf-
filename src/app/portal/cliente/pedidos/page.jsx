"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

function norm(v) {
  return String(v || "").toLowerCase().trim();
}

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

// Etiquetas pedido
const STATUS_LABEL = {
  pendiente: "Pendiente",
  "en proceso": "En proceso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
  confirmado: "Confirmado",
  confirmada: "Confirmada",
  aprobado: "Aprobado",
  enviado: "Enviado",
  entregado: "Entregado",
  rechazado: "Rechazado",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

function StatusBadge({ status }) {
  const s = norm(status) || "pendiente";

  const map = {
    pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    "en proceso": "bg-blue-100 text-blue-800 border-blue-300",
    aprobado: "bg-blue-100 text-blue-800 border-blue-300",
    confirmado: "bg-blue-100 text-blue-800 border-blue-300",
    confirmada: "bg-blue-100 text-blue-800 border-blue-300",
    enviado: "bg-indigo-100 text-indigo-800 border-indigo-300",
    entregado: "bg-green-100 text-green-800 border-green-300",
    finalizado: "bg-green-100 text-green-800 border-green-300",
    cancelado: "bg-red-100 text-red-800 border-red-300",
    cancelada: "bg-red-100 text-red-800 border-red-300",
    rechazado: "bg-red-100 text-red-800 border-red-300",
    rechazada: "bg-red-100 text-red-800 border-red-300",
  };

  const cls = map[s] || "bg-gray-100 text-gray-800 border-gray-300";
  const label = STATUS_LABEL[s] || (status ? String(status) : "—");

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// Etiquetas pago (soporta pending/paid y pendiente/pagado)
const PAYMENT_STATUS_LABEL = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  pendiente: "Pendiente de pago",
  pagado: "Pagado",
};

function PaymentBadge({ payment_status }) {
  const s = norm(payment_status) || "pending";

  const map = {
    pending: "bg-gray-100 text-gray-800 border-yellow--300",
    pendiente: "bg-gray-100 text-gray-800 border-yellow--300",
    paid: "bg-emerald-100 text-emerald-800 border-emerald-300",
    pagado: "bg-emerald-100 text-emerald-800 border-emerald-300",
  };

  const cls = map[s] || "bg-gray-100 text-gray-800 border-gray-300";
  const label = PAYMENT_STATUS_LABEL[s] || "—";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function ClientePedidosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  // ✅ filtros
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // ✅ Inicializar filtros desde querystring
  useEffect(() => {
    const qsStatus = norm(searchParams.get("status"));
    const qsPay = norm(searchParams.get("payment_status"));

    if (qsStatus) setStatusFilter(qsStatus);
    if (qsPay) setPaymentFilter(qsPay);
    // month por query si luego lo quieres: ?month=YYYY-MM
  }, [searchParams]);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/cliente/pedidos/list", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error || "No se pudieron cargar pedidos");
      setItems([]);
      return;
    }

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

  // Realtime (lo dejas igual)
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

  // Numeración Pedido #N
  const viewOrders = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];

    const asc = [...arr].sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return da - db;
    });

    const numberById = new Map();
    asc.forEach((o, idx) => numberById.set(o.id, idx + 1));

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

  // Opciones de mes
  const monthOptions = useMemo(() => {
    const set = new Set();
    for (const o of items || []) {
      const ts = o?.created_at;
      if (!ts) continue;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      set.add(key);
    }

    const keys = Array.from(set).sort((a, b) => (a < b ? 1 : -1));
    const label = (key) => {
      const [y, m] = key.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      const pretty = d.toLocaleString("es-MX", { month: "long", year: "numeric" });
      return pretty.charAt(0).toUpperCase() + pretty.slice(1);
    };

    return [{ value: "all", label: "General (todos)" }, ...keys.map((k) => ({ value: k, label: label(k) }))];
  }, [items]);

  // ✅ NUEVO: opciones status pedido + pago
  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Status pedido (todos)" },
      { value: "pendiente", label: "Pendiente" },
      { value: "confirmado", label: "Confirmado" },
      { value: "en proceso", label: "En proceso" },
      { value: "enviado", label: "Enviado" },
      { value: "entregado", label: "Entregado" },
      { value: "finalizado", label: "Finalizado" },
      { value: "cancelado", label: "Cancelado" },
    ],
    []
  );

  const paymentOptions = useMemo(
    () => [
      { value: "all", label: "Pago (todos)" },
      { value: "pending", label: "Pendiente de pago" },
      { value: "paid", label: "Pagado" },
    ],
    []
  );

  // ✅ aplicar filtros (mes + status pedido + status pago)
  const filteredOrders = useMemo(() => {
    let out = viewOrders;

    if (monthFilter !== "all") {
      out = out.filter((o) => {
        const ts = o?.created_at;
        if (!ts) return false;
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return false;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === monthFilter;
      });
    }

    if (statusFilter !== "all") {
      out = out.filter((o) => norm(o?.status) === statusFilter);
    }

    if (paymentFilter !== "all") {
      // soporta paid/pagado y pending/pendiente
      const want = paymentFilter; // "pending" | "paid"
      out = out.filter((o) => {
        const v = norm(o?.payment_status);
        if (want === "pending") return v === "pending" || v === "pendiente";
        if (want === "paid") return v === "paid" || v === "pagado";
        return true;
      });
    }

    return out;
  }, [viewOrders, monthFilter, statusFilter, paymentFilter]);

  const hasItems = filteredOrders.length > 0;

  const handleReload = async () => {
    setReloading(true);
    await load();
    setReloading(false);
  };

  // ✅ helper para limpiar query params rápido (opcional)
  const clearQueryFilters = () => {
    router.replace("/portal/cliente/pedidos");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  return (
    <div className="w-full max-w-none min-w-0 text-black">
      <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-black/60">Cliente</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold">Mis pedidos</h1>
            <p className="mt-2 text-sm text-black/60">Consulta tus pedidos con precios congelados por fecha.</p>
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

        {/* Acciones + Filtros */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-3">
          <Link
            href="/portal/cliente/pedidos/nuevo"
            className="inline-flex justify-center rounded-full px-6 py-3 text-sm text-white transition"
            style={{ backgroundColor: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
          >
            Nuevo pedido
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full rounded-full px-5 py-3 text-sm border transition bg-white"
              style={{ borderColor: BRAND_GREEN, color: "#111" }}
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-full px-5 py-3 text-sm border transition bg-white"
              style={{ borderColor: BRAND_GREEN, color: "#111" }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full rounded-full px-5 py-3 text-sm border transition bg-white"
              style={{ borderColor: BRAND_GREEN, color: "#111" }}
            >
              {paymentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReload}
              disabled={reloading}
              className="rounded-full border px-5 py-3 text-sm transition bg-white"
              style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
            >
              {reloading ? "Actualizando…" : "Actualizar"}
            </button>

            <button
              type="button"
              onClick={clearQueryFilters}
              className="rounded-full border px-5 py-3 text-sm transition bg-white"
              style={{ borderColor: "rgba(0,0,0,0.15)", color: "#111" }}
              title="Quitar filtros"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-black/60">Cargando pedidos…</div>
          ) : !hasItems ? (
            <div className="rounded-2xl border border-black/10 bg-black/5 p-5 text-sm text-black/70">
              No hay pedidos con los filtros seleccionados.
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

                      <div className="mt-2 text-xs text-black/50">{formatDate(o.created_at)}</div>

                      {(norm(o.payment_status) === "paid" || norm(o.payment_status) === "pagado") && o.paid_at ? (
                        <div className="mt-1 text-xs text-black/50">Pagado: {formatDate(o.paid_at)}</div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} />
                      <PaymentBadge payment_status={o.payment_status} />

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