"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";
const LOGO_PUBLIC_PATH = "/logo-xhunco.png"; // <- en /public

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

function formatDelivery(method) {
  const v = String(method || "").toLowerCase();
  if (v === "delivery") return "Entrega a domicilio";
  if (v === "pickup") return "Recolección en sucursal";
  return method ? String(method) : "—";
}

function formatPayment(method) {
  const v = String(method || "").toLowerCase();
  if (v === "cash") return "Efectivo";
  if (v === "tpv") return "TPV";
  if (v === "online") return "En línea";
  return method ? String(method) : "—";
}

function normalizeStatusLabel(statusRaw) {
  const status = String(statusRaw || "pendiente").toLowerCase().trim();
  const map = {
    pendiente: "Pendiente",
    "en proceso": "En proceso",
    proceso: "En proceso",
    finalizado: "Finalizado",
    entregado: "Finalizado",
    cancelado: "Cancelado",
  };
  return map[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pendiente");
}

function StatusBadge({ statusRaw }) {
  const status = String(statusRaw || "pendiente").toLowerCase().trim();

  const map = {
    pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    "en proceso": "bg-blue-100 text-blue-800 border-blue-300",
    proceso: "bg-blue-100 text-blue-800 border-blue-300",
    finalizado: "bg-green-100 text-green-800 border-green-300",
    entregado: "bg-green-100 text-green-800 border-green-300",
    cancelado: "bg-red-100 text-red-800 border-red-300",
  };

  const cls = map[status] || "bg-gray-100 text-gray-800 border-gray-300";
  const label = normalizeStatusLabel(status);

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ===== Helpers PDF (Empresa) =====
function safeText(v, fallback = "—") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

function getBusinessNameFromAddressSnapshot(order) {
  const a = order?.delivery_address_snapshot || {};
  return (
    a?.business_name ||
    a?.company ||
    a?.negocio ||
    a?.razon_social ||
    a?.nombre_negocio ||
    ""
  );
}

async function toDataUrlFromPublic(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function PedidoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || (params ? params[Object.keys(params)[0]] : null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [downloading, setDownloading] = useState(false);

  // 👇 nombre del negocio (para UI y PDF)
  const [businessName, setBusinessName] = useState("");

  const total = useMemo(() => formatMoney(order?.total), [order?.total]);
  const address = order?.delivery_address_snapshot || null;

  const load = async (silent = false) => {
    if (!id) {
      setLoading(false);
      setError("Falta id (revisa que la ruta sea /portal/cliente/pedidos/[id])");
      return;
    }

    if (!silent) setLoading(true);
    setError("");

    const res = await fetch(`/api/cliente/pedidos/${id}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (!silent) setLoading(false);
      setError(data?.error || "No se pudo cargar el pedido.");
      return;
    }

    setOrder(data?.order || null);
    setItems(Array.isArray(data?.items) ? data.items : []);
    if (!silent) setLoading(false);
  };

  // Cargar pedido
  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-refresh status (detener si finalizado/cancelado)
  useEffect(() => {
    if (!id) return;

    const st = String(order?.status || "").toLowerCase();
    if (st === "finalizado" || st === "cancelado" || st === "entregado") return;

    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, order?.status]);

  // Obtener business_name: primero del snapshot, si no, del perfil
  useEffect(() => {
    const run = async () => {
      if (!order) return;

      const fromSnap = getBusinessNameFromAddressSnapshot(order);
      if (fromSnap) {
        setBusinessName(fromSnap);
        return;
      }

      // Fallback: perfil (clients)
      try {
        const res = await fetch("/api/cliente/perfil", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setBusinessName(data?.client?.business_name || "");
        }
      } catch {
        // no rompemos
      }
    };
    run();
  }, [order]);

  const downloadPdf = async () => {
  if (!order) return;

  setDownloading(true);
  try {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    // ===== Config =====
    const BRAND_RGB = [49, 87, 44];
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;

    // ===== Logo =====
    let logoDataUrl = null;
    try {
      logoDataUrl = await toDataUrlFromPublic(LOGO_PUBLIC_PATH);
    } catch {
      logoDataUrl = null;
    }

    // ===== Datos =====
    const business = safeText(
      businessName || getBusinessNameFromAddressSnapshot(order) || "Cliente"
    );
    const folioShort = String(order?.id || "").slice(0, 8).toUpperCase();
    const uuid = safeText(order?.id, "—");
    const fecha = formatDateTime(order?.created_at);
    const statusLabel = normalizeStatusLabel(order?.status);
    const entrega = formatDelivery(order?.delivery_method);
    const pago = formatPayment(order?.payment_method);

    const a = order?.delivery_address_snapshot || null;
    const isDelivery = String(order?.delivery_method || "").toLowerCase() === "delivery";

    // ===== Header CLARO =====
    doc.setFillColor(247, 248, 249);
    doc.rect(0, 0, pageW, 26, "F");
    doc.setFillColor(...BRAND_RGB);
    doc.rect(0, 25, pageW, 1.2, "F");

    if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", margin, 6, 30, 12);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Comprobante de pedido", logoDataUrl ? margin + 34 : margin, 12);

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Xhunco Café", logoDataUrl ? margin + 34 : margin, 17);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Pedido #${folioShort}`, pageW - margin, 11, { align: "right" });
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(fecha, pageW - margin, 17, { align: "right" });

    // ===== Bloque Cliente / Pedido =====
    let y = 34;
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, pageW - margin * 2, 28, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Negocio", margin + 4, y + 7);
    doc.text("Estatus", pageW / 2, y + 7);
    doc.text("UUID", margin + 4, y + 18);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(business, margin + 4, y + 13);

    doc.setFontSize(10);
    doc.text(statusLabel, pageW / 2, y + 13);

    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text(uuid, margin + 4, y + 23);

    y += 36;

    // ===== Entrega / Pago =====
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, pageW - margin * 2, isDelivery ? 34 : 20, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Entrega", margin + 4, y + 7);
    doc.text("Pago", pageW / 2, y + 7);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(entrega, margin + 4, y + 13);
    doc.text(pago, pageW / 2, y + 13);

    if (isDelivery) {
      const line1 = `${a?.street || "—"}${a?.ext_number ? ` #${a.ext_number}` : ""}${a?.int_number ? ` Int ${a.int_number}` : ""}`;
      const line2 = `${a?.neighborhood || "—"}, ${a?.municipality || "—"}`;
      const line3 = `${a?.state || "—"} · CP ${a?.postal_code || "—"}`;

      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text("Domicilio", margin + 4, y + 20);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(line1, margin + 4, y + 26);
      doc.text(line2, margin + 4, y + 31);
      doc.text(line3, margin + 4, y + 36);

      y += 46;
    } else {
      y += 28;
    }

    // ===== Tabla Productos =====
    const rows = items.map((it, idx) => {
      const name =
        it?.suministros_xhunco?.nombre ||
        it?.nombre ||
        it?.suministro_nombre ||
        it?.product_name ||
        `Item ${idx + 1}`;

      const qty = Number(it?.qty ?? 0);
      const unit = Number(it?.unit_price ?? 0);
      const line =
        Number(it?.line_total ?? 0) ||
        (Number.isFinite(qty) && Number.isFinite(unit) ? qty * unit : 0);

      return [String(name), String(qty), formatMoney(unit), formatMoney(line)];
    });

    autoTable(doc, {
      startY: y,
      head: [["Producto", "Cant.", "Precio unit.", "Subtotal"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.4, lineColor: [230, 230, 230], lineWidth: 0.2 },
      headStyles: { fillColor: BRAND_RGB, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: "center", cellWidth: 18 },
        2: { halign: "right", cellWidth: 36 },
        3: { halign: "right", cellWidth: 36 },
      },
    });

    // ===== Total =====
    const tableEndY = doc.lastAutoTable?.finalY || y;
    const panelY = tableEndY + 8;

    doc.setDrawColor(...BRAND_RGB);
    doc.setFillColor(250, 252, 250);
    doc.roundedRect(pageW - margin - 78, panelY, 78, 20, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Total", pageW - margin - 74, panelY + 7);

    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(formatMoney(order?.total), pageW - margin - 74, panelY + 15);

    // ===== Footer =====
    const footerY = Math.min(panelY + 34, pageH - 18);
    doc.setDrawColor(235, 235, 235);
    doc.line(margin, footerY - 6, pageW - margin, footerY - 6);

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Xhunco Café — Gracias por tu compra.", margin, footerY);
    doc.text("En un momento nos comunicamos con ustedes para seguimiento y entrega.", margin, footerY + 5);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Este documento es un comprobante interno de pedido.", margin, footerY + 11);

    // ✅ En vez de doc.save() => abrir en pestaña + descargar
    const filename = `Xhunco_Pedido_${folioShort}.pdf`;

    // 1) Abrir en nueva pestaña (más confiable)
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank", "noopener,noreferrer");

    // 2) Descargar (opcional, para que el usuario guarde)
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.download = filename;
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();

    // liberar
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  } catch (e) {
    console.error(e);
    setError("No se pudo generar el PDF.");
  } finally {
    setDownloading(false);
  }
};


  if (loading) return <div className="text-gray-600">Cargando pedido…</div>;

  return (
    <div className="max-w-[1100px] w-full text-black">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Detalle del pedido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fecha:{" "}
            <span className="text-gray-900 font-medium">{formatDateTime(order?.created_at)}</span>
          </p>
          {businessName ? (
            <p className="mt-1 text-sm text-gray-600">
              Negocio: <span className="text-gray-900 font-medium">{businessName}</span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={!order || downloading}
            className="rounded-full px-5 py-2 text-sm text-white transition disabled:opacity-60"
            style={{ backgroundColor: BRAND_GREEN }}
            onMouseEnter={(e) => {
              if (!downloading) e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = BRAND_GREEN;
            }}
          >
            {downloading ? "Generando..." : "Descargar PDF"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/portal/cliente/pedidos")}
            className="rounded-full border px-5 py-2 text-sm transition"
            style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
          >
            Volver a Mis pedidos
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!order ? (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
          No hay información del pedido.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Izquierda */}
          <div className="lg:col-span-8 rounded-3xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-xs text-gray-500">Folio (UUID)</div>
                <div className="font-mono text-sm text-gray-900 break-all">{order?.id}</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500">Estatus</div>
                <div className="mt-1">
                  <StatusBadge statusRaw={order?.status} />
                </div>
                <div className="mt-1 text-[11px] text-gray-500">(Se actualiza automáticamente)</div>
              </div>
            </div>

            {/* Productos */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="text-sm font-semibold text-gray-900">Productos</div>

              <div className="mt-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-sm text-gray-600">No hay items.</div>
                ) : (
                  items.map((it, idx) => {
                    const name =
                      it?.suministros_xhunco?.nombre ||
                      it?.nombre ||
                      it?.suministro_nombre ||
                      it?.product_name ||
                      `Item ${idx + 1}`;

                    const qty = Number(it?.qty ?? 0);
                    const unit = Number(it?.unit_price ?? 0);
                    const line =
                      Number(it?.line_total ?? 0) ||
                      (Number.isFinite(qty) && Number.isFinite(unit) ? qty * unit : 0);

                    return (
                      <div
                        key={it?.id || `${idx}`}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">{name}</div>
                            <div className="text-sm text-gray-600">
                              {formatMoney(unit)} c/u · Cantidad: <b>{qty}</b>
                            </div>
                          </div>

                          <div className="text-sm font-semibold text-gray-900">{formatMoney(line)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Derecha */}
          <div className="lg:col-span-4 rounded-3xl border border-gray-200 bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Resumen</div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold text-gray-900">{total}</div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Entrega</div>
              <div className="text-sm font-semibold text-gray-900">{formatDelivery(order?.delivery_method)}</div>

              {String(order?.delivery_method || "").toLowerCase() === "delivery" ? (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <div className="text-xs text-gray-500">Domicilio</div>
                  <div>
                    {address?.street || "—"}
                    {address?.ext_number ? ` #${address.ext_number}` : ""}
                    {address?.int_number ? ` Int ${address.int_number}` : ""}
                  </div>
                  <div>
                    {address?.neighborhood || "—"}, {address?.municipality || "—"}
                  </div>
                  <div>
                    {address?.state || "—"} · {address?.postal_code || "—"}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Pago</div>
              <div className="text-sm font-semibold text-gray-900">{formatPayment(order?.payment_method)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
