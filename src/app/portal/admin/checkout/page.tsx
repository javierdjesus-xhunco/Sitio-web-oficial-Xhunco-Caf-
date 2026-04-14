"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  PackageCheck,
  Search,
  Truck,
  X,
} from "lucide-react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

type CheckoutOrder = {
  id: string;
  order_no: string;
  customer_name: string;
  customer_business: string | null;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_notes: string | null;
  payment_method: string;
  card_type: string | null;
  card_last4: string | null;
  status: string;
  payment_status: string;
  subtotal: number;
  total: number;
  shipping_carrier: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
};

type StatusMessage = {
  type: "success" | "error" | "info";
  text: string;
};

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "en_preparacion", label: "En preparación" },
  { value: "en_ruta", label: "En ruta" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: ["en_preparacion", "cancelado"],
  en_preparacion: ["en_ruta", "cancelado"],
  en_ruta: ["entregado"],
  entregado: [],
  cancelado: [],
};

const CARRIER_OPTIONS = [
  "DHL",
  "FedEx",
  "Estafeta",
  "UPS",
  "Paquetexpress",
  "Redpack",
  "99 Minutos",
  "Entrega local",
  "Otra",
];

function money(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(n || 0));
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusLabel(status: string) {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  return found?.label || status;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "pendiente":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "confirmado":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "en_preparacion":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "en_ruta":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "entregado":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelado":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getAllowedNextStatuses(currentStatus: string) {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}

export default function AdminCheckoutOrdersPage() {
  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMsg, setStatusMsg] = useState<StatusMessage | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CheckoutOrder | null>(null);
  const [pendingStatus, setPendingStatus] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingError, setShippingError] = useState("");
  const [savingShipping, setSavingShipping] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setStatusMsg(null);

      const res = await fetch("/api/admin/checkout-orders", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMsg({
          type: "error",
          text: data?.error || "No se pudieron cargar los pedidos.",
        });
        return;
      }

      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (error) {
      console.error(error);
      setStatusMsg({
        type: "error",
        text: "Ocurrió un error al cargar los pedidos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.order_no?.toLowerCase().includes(term) ||
        order.customer_name?.toLowerCase().includes(term) ||
        order.customer_business?.toLowerCase().includes(term) ||
        order.customer_email?.toLowerCase().includes(term) ||
        order.customer_phone?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const updateOrderInState = (
    orderId: string,
    patch: Partial<CheckoutOrder>,
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, ...patch } : order,
      ),
    );
  };

  const updateStatus = async (
    order: CheckoutOrder,
    nextStatus: string,
    extra?: { shipping_carrier?: string; tracking_number?: string },
  ) => {
    try {
      setSavingOrderId(order.id);
      setStatusMsg(null);

      const res = await fetch(`/api/admin/checkout-orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          shipping_carrier: extra?.shipping_carrier,
          tracking_number: extra?.tracking_number,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMsg({
          type: "error",
          text: data?.error || "No se pudo actualizar el estatus.",
        });
        return false;
      }

      updateOrderInState(order.id, {
        status: nextStatus,
        shipping_carrier: extra?.shipping_carrier ?? order.shipping_carrier,
        tracking_number: extra?.tracking_number ?? order.tracking_number,
        updated_at: new Date().toISOString(),
      });

      setStatusMsg({
        type: "success",
        text: `Pedido ${order.order_no} actualizado a ${statusLabel(nextStatus)}.`,
      });

      return true;
    } catch (error) {
      console.error(error);
      setStatusMsg({
        type: "error",
        text: "Ocurrió un error al actualizar el pedido.",
      });
      return false;
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleStatusChange = async (
    order: CheckoutOrder,
    nextStatus: string,
  ) => {
    if (nextStatus === order.status) return;

    if (!getAllowedNextStatuses(order.status).includes(nextStatus)) {
      setStatusMsg({
        type: "error",
        text: `No se puede cambiar de ${statusLabel(order.status)} a ${statusLabel(nextStatus)}.`,
      });
      return;
    }

    if (nextStatus === "en_ruta") {
      setSelectedOrder(order);
      setPendingStatus(nextStatus);
      setShippingCarrier(order.shipping_carrier || "");
      setTrackingNumber(order.tracking_number || "");
      setShippingError("");
      setShippingModalOpen(true);
      return;
    }

    await updateStatus(order, nextStatus);
  };

  const closeShippingModal = () => {
    if (savingShipping) return;
    setShippingModalOpen(false);
    setSelectedOrder(null);
    setPendingStatus("");
    setShippingCarrier("");
    setTrackingNumber("");
    setShippingError("");
  };

  const submitShippingModal = async () => {
    if (!selectedOrder || !pendingStatus) return;

    if (!shippingCarrier.trim()) {
      setShippingError("Selecciona o escribe la paquetería.");
      return;
    }

    if (!trackingNumber.trim()) {
      setShippingError("Ingresa el número de guía.");
      return;
    }

    try {
      setSavingShipping(true);
      setShippingError("");

      const ok = await updateStatus(selectedOrder, pendingStatus, {
        shipping_carrier: shippingCarrier.trim(),
        tracking_number: trackingNumber.trim(),
      });

      if (ok) {
        closeShippingModal();
      }
    } finally {
      setSavingShipping(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f5f7f6_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#31572c]/15 bg-[#31572c]/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#31572c]">
            <PackageCheck className="h-3.5 w-3.5" />
            Gestión de pedidos
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Pedidos de checkout
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Administra los pedidos capturados desde el checkout, cambia su
            estatus y agrega información de envío cuando el pedido salga a ruta.
          </p>
        </div>

        {statusMsg ? (
          <StatusAlert type={statusMsg.type} text={statusMsg.text} />
        ) : null}

        <div className="mb-6 grid gap-4 rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:grid-cols-[1fr_220px] sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número de pedido, cliente, empresa, correo o teléfono"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="all">Todos los estatus</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Listado de pedidos
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Cargando pedidos..."
                    : `${filteredOrders.length} pedido(s) encontrados`}
                </p>
              </div>

              <button
                type="button"
                onClick={loadOrders}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Recargar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando pedidos...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-base font-semibold text-slate-800">
                  No se encontraron pedidos
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Ajusta la búsqueda o el filtro para ver resultados.
                </p>
              </div>
            ) : (
              <table className="min-w-full text-left">
                <thead className="bg-slate-50/80">
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4 font-semibold">Pedido</th>
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Contacto</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Estatus</th>
                    <th className="px-6 py-4 font-semibold">Actualizar</th>
                    <th className="px-6 py-4 font-semibold">Envío</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const isSaving = savingOrderId === order.id;
                    const allowedNextStatuses = getAllowedNextStatuses(order.status);

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-slate-200 align-top transition hover:bg-slate-50/50"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {order.order_no}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="min-w-[220px]">
                            <p className="font-medium text-slate-900">
                              {order.customer_name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {order.customer_business || "Sin empresa"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {order.customer_city}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="min-w-[240px] text-sm">
                            <p className="text-slate-800">{order.customer_email}</p>
                            <p className="mt-1 text-slate-500">
                              {order.customer_phone}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {order.customer_address}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-950">
                            {money(order.total)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {order.payment_method === "card"
                              ? `Tarjeta ${order.card_type || ""}`.trim()
                              : order.payment_method}
                            {order.card_last4 ? ` •••• ${order.card_last4}` : ""}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                              order.status,
                            )}`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="relative min-w-[180px]">
                            <select
                              value={order.status}
                              disabled={isSaving || allowedNextStatuses.length === 0}
                              onChange={(e) =>
                                handleStatusChange(order, e.target.value)
                              }
                              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value={order.status}>
                                {statusLabel(order.status)}
                              </option>

                              {allowedNextStatuses.map((nextStatus) => {
                                const option = STATUS_OPTIONS.find(
                                  (s) => s.value === nextStatus,
                                );
                                if (!option) return null;

                                return (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                );
                              })}
                            </select>

                            {isSaving ? (
                              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                            ) : (
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            )}
                          </div>

                          {allowedNextStatuses.length === 0 ? (
                            <p className="mt-2 text-xs text-slate-400">
                              Este pedido ya no admite más cambios de estatus.
                            </p>
                          ) : null}
                        </td>

                        <td className="px-6 py-5">
                          {order.shipping_carrier || order.tracking_number ? (
                            <div className="min-w-[200px] rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
                              <div className="flex items-center gap-2 font-semibold text-slate-800">
                                <Truck className="h-3.5 w-3.5" />
                                {order.shipping_carrier || "Paquetería"}
                              </div>
                              <p className="mt-1 text-slate-500">
                                Guía: {order.tracking_number || "-"}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">Sin datos de envío</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {shippingModalOpen && selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#31572c]/15 bg-[#31572c]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#31572c]">
                  <Truck className="h-3.5 w-3.5" />
                  Datos de envío
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  Marcar pedido como en ruta
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Captura la paquetería y el número de guía para notificar al
                  cliente por correo.
                </p>
              </div>

              <button
                type="button"
                onClick={closeShippingModal}
                className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {selectedOrder.order_no}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedOrder.customer_name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedOrder.customer_email}
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Paquetería <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    >
                      <option value="">Selecciona una opción</option>
                      {CARRIER_OPTIONS.map((carrier) => (
                        <option key={carrier} value={carrier}>
                          {carrier}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Número de guía <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ingresa la guía manualmente"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                {shippingError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{shippingError}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeShippingModal}
                disabled={savingShipping}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={submitShippingModal}
                disabled={savingShipping}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: BRAND_GREEN }}
                onMouseEnter={(e) => {
                  if (savingShipping) return;
                  e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                }}
                onMouseLeave={(e) => {
                  if (savingShipping) return;
                  e.currentTarget.style.backgroundColor = BRAND_GREEN;
                }}
              >
                {savingShipping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    Confirmar envío
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatusAlert({
  type,
  text,
}: {
  type: "success" | "error" | "info";
  text: string;
}) {
  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : type === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-slate-200 bg-slate-50 text-slate-800";

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
        ? AlertCircle
        : PackageCheck;

  return (
    <div className={`mb-6 rounded-2xl border p-4 ${styles}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
        <p className="text-sm leading-6">{text}</p>
      </div>
    </div>
  );
}