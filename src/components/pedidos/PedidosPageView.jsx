"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  if (s === "transfer") return "Transferencia";
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

function normalizeStatusValue(v) {
  const s = String(v || "").toLowerCase().trim();

  if (s === "en preparación") return "en_preparacion";
  if (s === "en ruta") return "en_ruta";

  return s || "pendiente";
}

function statusBadgeClass(v) {
  const s = normalizeStatusValue(v);

  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold";

  if (s === "pendiente") {
    return `${base} border-gray-300 bg-gray-100 text-gray-700`;
  }

  if (s === "confirmado") {
    return `${base} border-blue-200 bg-blue-50 text-blue-700`;
  }

  if (s === "en_preparacion" || s === "en_ruta") {
    return `${base} border-yellow-300 bg-yellow-50 text-yellow-800`;
  }

  if (s === "entregado") {
    return `${base} border-green-200 bg-green-50 text-green-700`;
  }

  if (s === "cancelado") {
    return `${base} border-red-200 bg-red-50 text-red-700`;
  }

  return `${base} border-gray-300 bg-gray-100 text-gray-700`;
}

function statusSelectClass(v) {
  const s = normalizeStatusValue(v);

  const base =
    "w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none transition disabled:opacity-60";

  if (s === "pendiente") {
    return `${base} border-gray-300 bg-gray-100 text-gray-700`;
  }

  if (s === "confirmado") {
    return `${base} border-blue-200 bg-blue-50 text-blue-700`;
  }

  if (s === "en_preparacion" || s === "en_ruta") {
    return `${base} border-yellow-300 bg-yellow-50 text-yellow-800`;
  }

  if (s === "entregado") {
    return `${base} border-green-200 bg-green-50 text-green-700`;
  }

  if (s === "cancelado") {
    return `${base} border-red-200 bg-red-50 text-red-700`;
  }

  return `${base} border-gray-300 bg-gray-100 text-gray-700`;
}

function paymentBadgeClass(v) {
  const s = String(v || "pending").toLowerCase().trim();

  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold";

  if (s === "paid") {
    return `${base} border-blue-200 bg-blue-50 text-blue-700`;
  }

  return `${base} border-red-200 bg-red-50 text-red-700`;
}

function paymentSelectClass(v) {
  const s = String(v || "pending").toLowerCase().trim();

  const base =
    "w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none transition disabled:opacity-60";

  if (s === "paid") {
    return `${base} border-blue-200 bg-blue-50 text-blue-700`;
  }

  return `${base} border-red-200 bg-red-50 text-red-700`;
}


function loadImageAsBase64(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function getAddressText(order, clientData = null) {
  const address =
    order?.delivery_address ||
    order?.delivery_address_snapshot ||
    order?.domicilio ||
    null;

  if (typeof address === "string" && address.trim()) {
    return address;
  }

  if (address && typeof address === "object") {
    const addressFromOrder = [
      address.street,
      address.ext_number ? `#${address.ext_number}` : "",
      address.int_number ? `Int. ${address.int_number}` : "",
      address.neighborhood,
      address.municipality,
      address.state,
      address.postal_code ? `CP ${address.postal_code}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    if (addressFromOrder.trim()) return addressFromOrder;
  }

  const addressFromClient = [
    clientData?.street,
    clientData?.ext_number ? `#${clientData.ext_number}` : "",
    clientData?.int_number ? `Int. ${clientData.int_number}` : "",
    clientData?.neighborhood,
    clientData?.municipality,
    clientData?.state,
    clientData?.postal_code ? `CP ${clientData.postal_code}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return addressFromClient.trim() || "—";
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

  const [expandedProducts, setExpandedProducts] = useState({});

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

    const cursorToUse = Object.prototype.hasOwnProperty.call(next, "cursor")
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
      await Promise.all([
        loadTotal(next),
        loadOrders({ ...next, cursor: null }),
      ]);
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

const clientByUserId = useMemo(() => {
  const m = new Map();

  (clients || []).forEach((c) => {
    if (c?.user_id) m.set(c.user_id, c);
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

      if (!r.ok)
        throw new Error(j?.error || "No se pudo actualizar el estado de pago");

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

async function downloadOrderPDF(order) {
  try {
    if (!order?.id) {
      alert("No se encontró el pedido.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginX = 48;
    const green = [49, 87, 44];
    const dark = [20, 35, 25];
    const muted = [85, 102, 118];
    const softBorder = [210, 224, 210];

    const folio = String(order.id).slice(0, 8).toUpperCase();

    const clientData = clientByUserId.get(order.client_user_id) || null;

    const negocioNombre =
      order?.negocio_nombre ||
      clientData?.business_name ||
      clientData?.label ||
      clientLabelById.get(order.client_user_id) ||
      order.client_user_id ||
      "—";

    const clienteNombre =
      order?.cliente_nombre ||
      clientData?.owner_name ||
      clientData?.contact_name ||
      clientData?.responsable ||
      clientData?.full_name ||
      "—";

    const telefono =
      order?.telefono ||
      order?.phone ||
      order?.cliente_telefono ||
      order?.client_phone ||
      clientData?.phone ||
      clientData?.telefono ||
      "—";

    const correo =
      order?.email ||
      order?.correo ||
      order?.cliente_email ||
      order?.client_email ||
      order?.correo_electronico ||
      clientData?.email ||
      clientData?.correo ||
      "—";

    const addressText = getAddressText(order, clientData);

    const items = Array.isArray(order.items) ? order.items : [];

    const totalValue = Number(order.total ?? order.subtotal ?? 0);
    const subtotalValue = Number(order.subtotal ?? order.total ?? 0);

    const logoBase64 = await loadImageAsBase64("/logo-xhunco.png");

    let y = 34;

    // =========================
    // HEADER
    // =========================

    if (logoBase64) {
      // Ajuste de proporción para que el logo no se vea aplastado
      doc.addImage(logoBase64, "PNG", marginX, y - 6, 128, 22);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...green);
      doc.text("Xhunco Café", marginX, y + 10);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text("Comprobante de pedido", pageWidth / 2, y + 8, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(String(negocioNombre), pageWidth / 2, y + 25, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    doc.text(`Pedido #${folio}`, pageWidth - marginX, y + 6, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(fmtDate(order.created_at), pageWidth - marginX, y + 23, {
      align: "right",
    });

    doc.setDrawColor(...green);
    doc.setLineWidth(3);
    doc.line(0, 92, pageWidth, 92);

    // =========================
    // BLOQUE CORPORATIVO
    // =========================

    y = 120;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text("Corporativo Xhunco Foodservice", marginX, y);

    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("El Tordo 31 Col. Los Potrillos", marginX, y);

    y += 12;
    doc.text("Ocotlán, Tlaxcala. Código Postal 90014", marginX, y);

    const badgeW = 126;
    const badgeH = 46;
    const badgeX = pageWidth - marginX - badgeW;
    const badgeY = 108;

    doc.setDrawColor(...green);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 7, 7, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...green);
    doc.text("ORDEN DE COMPRA", badgeX + badgeW / 2, badgeY + 27, {
      align: "center",
    });

    // =========================
    // CARD INFORMACIÓN DEL PEDIDO
    // =========================

    y = 204;

    const cardX = marginX;
    const cardW = pageWidth - marginX * 2;
    const cardH = 158;

    doc.setDrawColor(...softBorder);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, y, cardW, cardH, 8, 8, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text("Información del pedido", cardX + 16, y + 24);

    const leftX = cardX + 16;
    const rightX = cardX + cardW / 2 + 12;
    const infoY = y + 52;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("Negocio", leftX, infoY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(String(negocioNombre), leftX, infoY + 12, {
      maxWidth: 210,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("UUID", leftX, infoY + 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...dark);

    const uuidLines = doc.splitTextToSize(String(order.id), 190);
    doc.text(uuidLines, leftX, infoY + 46);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("Dirección", leftX, infoY + 76);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...dark);

    const addressLines = doc.splitTextToSize(String(addressText), 210);
    doc.text(addressLines, leftX, infoY + 88);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("Nombre del cliente", rightX, infoY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(String(clienteNombre), rightX, infoY + 12, {
      maxWidth: 200,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("Teléfono", rightX, infoY + 34);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(String(telefono), rightX, infoY + 46, {
      maxWidth: 200,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("Correo electrónico", rightX, infoY + 68);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);

    const emailLines = doc.splitTextToSize(String(correo), 200);
    doc.text(emailLines, rightX, infoY + 80);

    // =========================
    // CARD ENTREGA / PAGO
    // =========================

    y = 392;

    const payCardH = 82;

    doc.setDrawColor(...softBorder);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, y, cardW, payCardH, 8, 8, "FD");

    const col1 = cardX + 24;
    const col2 = cardX + cardW / 2 - 25;
    const col3 = cardX + cardW - 150;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("Entrega", col1, y + 28);
    doc.text("Pago", col2, y + 28);
    doc.text("Estado de pago", col3, y + 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(deliveryLabel(order.delivery_method), col1, y + 44);
    doc.text(paymentLabel(order.payment_method), col2, y + 44);
    doc.text(paymentStatusLabel(order.payment_status), col3, y + 44);

    // =========================
    // TABLA PRODUCTOS
    // =========================

    y = 508;

    const tableRows = items.map((item) => {
      const qty = Number(item?.qty || 0);
      const unit = Number(item?.unit_price || 0);
      const line = Number(item?.line_total || qty * unit);

      return [item?.nombre || "Producto", qty, money(unit), money(line)];
    });

    autoTable(doc, {
      startY: y,
      head: [["Producto", "Cant.", "Precio unit.", "Subtotal"]],
      body: tableRows.length
        ? tableRows
        : [["Sin detalle de productos", "—", "—", "—"]],
      theme: "grid",

      // Permite dividir automáticamente en varias hojas
      pageBreak: "auto",
      rowPageBreak: "avoid",
      showHead: "everyPage",

      // Reserva espacio para total/footer
      margin: {
        left: marginX,
        right: marginX,
        bottom: 150,
      },

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 8,
        textColor: dark,
        lineColor: [224, 232, 224],
        lineWidth: 0.6,
        valign: "middle",
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [250, 252, 250],
      },
      columnStyles: {
        0: {
          cellWidth: 275,
          halign: "left",
        },
        1: {
          cellWidth: 55,
          halign: "center",
        },
        2: {
          cellWidth: 95,
          halign: "right",
        },
        3: {
          cellWidth: 95,
          halign: "right",
        },
      },
    });

    // =========================
    // TOTAL Y FOOTER EN ÚLTIMA HOJA
    // =========================

    let finalY = doc.lastAutoTable.finalY + 24;

    const totalBoxW = 112;
    const totalBoxH = 50;
    const footerHeight = 92;

    const footerY = pageHeight - footerHeight;
    const maxTotalY = footerY - totalBoxH - 22;

    if (finalY > maxTotalY) {
      doc.addPage();
      finalY = 80;
    }

    const totalBoxX = pageWidth - marginX - totalBoxW;

    doc.setDrawColor(...green);
    doc.setLineWidth(1);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(totalBoxX, finalY, totalBoxW, totalBoxH, 7, 7, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text("Total", totalBoxX + 12, finalY + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...dark);
    doc.text(money(totalValue || subtotalValue), totalBoxX + 12, finalY + 38);

    // Footer siempre al fondo de la última hoja
    const finalFooterY = pageHeight - 92;

    doc.setDrawColor(225, 230, 225);
    doc.setLineWidth(0.8);
    doc.line(marginX, finalFooterY, pageWidth - marginX, finalFooterY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text("Xhunco Café — Gracias por tu compra.", marginX, finalFooterY + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(
      "El Tordo 31 Col. Los Potrillos, Ocotlán, Tlaxcala C.P. 90014 · soporte@xhunco.com · negocios.xhunco.com",
      marginX,
      finalFooterY + 38
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(120, 130, 140);
    doc.text(
      "Este documento es un comprobante interno de pedido y no es un comprobante fiscal.",
      marginX,
      finalFooterY + 56
    );

    doc.save(`pedido-${folio}.pdf`);
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("No se pudo generar el PDF del pedido.");
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
            <div className="mb-1 text-xs font-semibold text-gray-700">
              Status
            </div>

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
            <div className="mb-1 text-xs font-semibold text-gray-700">
              Negocio
            </div>

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
  className="rounded-2xl border border-[#b9d4ad] bg-[#e9f4e3] p-4 shadow-sm"
  >
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 w-full">
        <div className="truncate text-sm font-semibold text-[#1f2f1f]">
          Pedido: {o.id}
        </div>

        <div className="mt-3 rounded-xl border border-[#dbe8d3] bg-[#f4faf0] p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-[#31572c]">
            Datos del pedido
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="text-xs text-gray-700">
              Cliente:{" "}
              <span className="font-semibold text-black">
                {clienteNombre}
              </span>
            </div>

            <div className="text-xs text-gray-700">
              Negocio:{" "}
              <span className="font-semibold text-black">
                {negocioNombre}
              </span>
            </div>

            <div className="text-xs text-gray-700">
              Entrega:{" "}
              <span className="font-semibold text-black">
                {deliveryLabel(o.delivery_method)}
              </span>
            </div>

            <div className="text-xs text-gray-700">
              Método de Pago:{" "}
              <span className="font-semibold text-black">
                {paymentLabel(o.payment_method)}
              </span>
            </div>

            <div className="text-xs text-gray-700">
              Pago:{" "}
              <span className={paymentBadgeClass(o.payment_status)}>
                {paymentStatusLabel(o.payment_status)}
              </span>

              {o?.paid_at ? (
                <span className="ml-1 text-gray-500">
                  · {fmtDate(o.paid_at)}
                </span>
              ) : null}
            </div>

            <div className="text-xs text-gray-700">
              Creado el:{" "}
              <span className="font-semibold text-black">
                {fmtDate(o.created_at)}
              </span>
            </div>

            <div className="text-xs text-gray-700">
              Total:{" "}
              <span className="font-semibold text-black">
                {money(o.total ?? o.subtotal)}
              </span>
            </div>

            <div className="text-xs text-gray-700">
              Status actual:{" "}
              <span className={statusBadgeClass(o.status)}>
                {statusLabel(o.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[#e1ecd9] bg-[#fafdf7] p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-[#31572c]">
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
                    const meta = [
                      it?.marca,
                      it?.presentacion,
                      it?.unidad,
                    ]
                      .filter(Boolean)
                      .join(" · ");

                    const qty = Number(it?.qty || 0);
                    const unit = Number(it?.unit_price || 0);
                    const line = Number(it?.line_total || qty * unit);

                    return (
                      <div
                        key={it.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-[#e4eee0] bg-white px-3 py-2"
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

                        <div className="shrink-0 text-sm font-semibold text-black">
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
className="rounded-lg bg-[#f0f7ec] px-3 py-1.5 text-xs font-semibold text-[#31572c] transition hover:bg-[#e5f0df]"                      >
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
            <div className="rounded-lg border border-[#dcefd6] bg-white/80 px-3 py-2 text-xs text-gray-600">
              Sin detalle de productos.
            </div>
          )}
        </div>
      </div>

      <div className="w-full space-y-3 md:w-[280px]">
        <button
          type="button"
          onClick={() => downloadOrderPDF(o)}
          disabled={busy}
          className="w-full rounded-xl border border-[#31572c]/20 bg-[#f8f6f0] px-4 py-2.5 text-sm font-semibold text-[#31572c] shadow-sm transition hover:bg-[#f1eadf] disabled:opacity-60"
        >
          Descargar PDF
        </button>

        <div>
          <div className="mb-1 text-xs font-semibold text-gray-700">
            Cambiar status
          </div>

          <select
            value={o.status || "pendiente"}
            disabled={busy}
            onChange={(e) => updateStatus(o.id, e.target.value)}
            className={statusSelectClass(o.status)}
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
            className={paymentSelectClass(o.payment_status)}
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