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
  const v = String(method || "").toLowerCase().trim();
  if (v === "cash") return "Efectivo";
  if (v === "tpv") return "TPV";
  if (v === "online") return "En línea";
  if (v === "transfer" || v === "transferencia") return "Transferencia";
  return method ? String(method) : "—";
}

/** ===== Status (alineado a tu sistema real) ===== */
const STATUS_FLOW = [
  { key: "pendiente", label: "Pendiente" },
  { key: "confirmado", label: "Confirmado" },
  { key: "en_preparacion", label: "En preparación" },
  { key: "en_ruta", label: "En ruta" },
  { key: "entregado", label: "Entregado" },
];

function normalizeStatusKey(statusRaw) {
  const s = String(statusRaw || "pendiente").toLowerCase().trim();
  // tolerancia legacy
  if (s === "en proceso" || s === "proceso") return "en_preparacion";
  if (s === "finalizado") return "entregado";
  return s || "pendiente";
}

function statusLabelFromKey(key) {
  return STATUS_FLOW.find((x) => x.key === key)?.label || "Pendiente";
}

function StatusBadge({ statusRaw }) {
  const status = normalizeStatusKey(statusRaw);

  const map = {
    pendiente: "bg-gray-100 text-gray-800 border-gray-200",
    confirmado: "bg-blue-50 text-blue-800 border-blue-200",
    en_preparacion: "bg-yellow-50 text-yellow-800 border-yellow-200",
    en_ruta: "bg-purple-50 text-purple-800 border-purple-200",
    entregado: "bg-green-50 text-green-800 border-green-200",
    cancelado: "bg-red-50 text-red-800 border-red-200",
  };

  const cls = map[status] || "bg-gray-100 text-gray-800 border-gray-200";
  const label = statusLabelFromKey(status);

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function StatusTimeline({ statusRaw, createdAt }) {
  const status = normalizeStatusKey(statusRaw);

  if (status === "cancelado") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-semibold text-red-800">Pedido cancelado</div>
        <div className="mt-1 text-xs text-red-700">
          {createdAt ? `Creado: ${formatDateTime(createdAt)}` : null}
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.findIndex((s) => s.key === status);
  const idx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-900">Seguimiento</div>
        <div className="text-xs text-gray-500">{createdAt ? `Creado: ${formatDateTime(createdAt)}` : "—"}</div>
      </div>

      <div className="mt-4 space-y-3">
        {STATUS_FLOW.map((step, i) => {
          const done = i < idx;
          const active = i === idx;

          return (
            <div key={step.key} className="flex items-start gap-3">
              {/* Rail */}
              <div className="relative flex flex-col items-center">
                <div
                  className={[
                    "grid h-7 w-7 place-items-center rounded-full border text-xs font-bold",
                    done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : active
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-400",
                  ].join(" ")}
                  title={step.label}
                >
                  {done ? "✓" : i + 1}
                </div>

                {i !== STATUS_FLOW.length - 1 ? (
                  <div className={["mt-1 h-8 w-[2px] rounded-full", done ? "bg-emerald-200" : "bg-gray-200"].join(" ")} />
                ) : null}
              </div>

              {/* Text */}
              <div className="min-w-0 pt-0.5">
                <div
                  className={[
                    "text-sm font-semibold",
                    done ? "text-gray-900" : active ? "text-gray-900" : "text-gray-500",
                  ].join(" ")}
                >
                  {step.label}
                  {active ? <span className="ml-2 text-xs font-semibold text-gray-500">(actual)</span> : null}
                </div>

                <div className="mt-0.5 text-xs text-gray-500">
                  {step.key === "pendiente" && "Recibimos tu solicitud de pedido."}
                  {step.key === "confirmado" && "Un administrador validó tu pedido y lo confirmó."}
                  {step.key === "en_preparacion" && "Estamos preparando tu pedido."}
                  {step.key === "en_ruta" && "Tu pedido va en camino."}
                  {step.key === "entregado" && "Pedido entregado exitosamente."}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Helpers PDF (Empresa) =====
function safeText(v, fallback = "—") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

function getBusinessNameFromAddressSnapshot(order) {
  const a = order?.delivery_address_snapshot || {};
  return a?.business_name || a?.company || a?.negocio || a?.razon_social || a?.nombre_negocio || "";
}

// ✅ sirve para /public o URL absoluta (supabase)
async function toDataUrlFromAny(src) {
  const res = await fetch(src, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${src}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ✅ dibujar imagen manteniendo proporción y límite de alto
function addImageFit(doc, dataUrl, x, y, targetW, maxH) {
  const props = doc.getImageProperties(dataUrl);
  const ratio = props.height / props.width;

  let w = targetW;
  let h = w * ratio;

  if (maxH && h > maxH) {
    h = maxH;
    w = h / ratio;
  }

  doc.addImage(dataUrl, "PNG", x, y, w, h);
  return { w, h };
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

  // ✅ logo del cliente
  const [clientLogoUrl, setClientLogoUrl] = useState("");

  const total = useMemo(() => formatMoney(order?.total), [order?.total]);
  const address = order?.delivery_address_snapshot || null;

  // ✅ Snapshot de pago (banco/beneficiario/clabe)
  const paymentSnapshot = useMemo(() => {
    const snap = order?.payment_snapshot;
    return snap && typeof snap === "object" ? snap : null;
  }, [order?.payment_snapshot]);

  const isTransfer = useMemo(() => {
    const m = String(order?.payment_method || "").toLowerCase().trim();
    return m === "transfer" || m === "transferencia";
  }, [order?.payment_method]);

  const transferInfo = useMemo(() => {
    if (!isTransfer || !paymentSnapshot) return null;
    const bank = String(paymentSnapshot.bank_name || "").trim();
    const holder = String(paymentSnapshot.account_holder || "").trim();
    const clabe = String(paymentSnapshot.clabe || "").replace(/\s+/g, "");
    // Solo mostrar si hay algo
    if (!bank && !holder && !clabe) return null;
    return { bank, holder, clabe };
  }, [isTransfer, paymentSnapshot]);

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

  // Auto-refresh status (detener si entregado/cancelado)
  useEffect(() => {
    if (!id) return;

    const st = normalizeStatusKey(order?.status);
    if (st === "entregado" || st === "cancelado") return;

    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, order?.status]);

  // ✅ Traer negocio y logo desde /api/cliente/me
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/cliente/me", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          if (data?.client?.business_name) setBusinessName(data.client.business_name);
          if (data?.client?.logo_url) setClientLogoUrl(data.client.logo_url);
        }
      } catch {
        // no rompemos
      }
    };
    run();
  }, []);

  // Fallback: del snapshot si viene
  useEffect(() => {
    if (!order) return;
    const fromSnap = getBusinessNameFromAddressSnapshot(order);
    if (fromSnap) setBusinessName(fromSnap);
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

      // ===== Cargar ambos logos =====
      let xhuncoLogo = null;
      let clientLogo = null;

      try {
        xhuncoLogo = await toDataUrlFromAny(LOGO_PUBLIC_PATH);
      } catch {
        xhuncoLogo = null;
      }

      if (clientLogoUrl) {
        try {
          clientLogo = await toDataUrlFromAny(clientLogoUrl);
        } catch {
          clientLogo = null;
        }
      }

      // ===== Datos =====
      const business = safeText(businessName || getBusinessNameFromAddressSnapshot(order) || "Cliente");
      const folioShort = String(order?.id || "").slice(0, 8).toUpperCase();
      const uuid = safeText(order?.id, "—");
      const fecha = formatDateTime(order?.created_at);
      const statusLabel = statusLabelFromKey(normalizeStatusKey(order?.status));
      const entrega = formatDelivery(order?.delivery_method);
      const pago = formatPayment(order?.payment_method);

      const a = order?.delivery_address_snapshot || null;
      const isDelivery = String(order?.delivery_method || "").toLowerCase() === "delivery";

      // ===== Header =====
      doc.setFillColor(247, 248, 249);
      doc.rect(0, 0, pageW, 26, "F");
      doc.setFillColor(...BRAND_RGB);
      doc.rect(0, 25, pageW, 1.2, "F");

      // ===== Logos =====
      const logoY = 8.7;
      const maxH = 14;

      // Xhunco izquierda
      let leftW = 0;
      if (xhuncoLogo) {
        const r = addImageFit(doc, xhuncoLogo, margin, logoY, 38, maxH);
        leftW = r.w;
      }

      // ===== Bloque derecho: [logoCliente] Pedido #XXXX =====
      const pedidoText = `Pedido #${folioShort}`;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const pedidoTextW = doc.getTextWidth(pedidoText);

      const gap = 3;
      if (clientLogo) {
        const props = doc.getImageProperties(clientLogo);
        const ratio = props.height / props.width;

        let clientW = 14;
        let clientH = clientW * ratio;

        const clientMaxH = 10;
        if (clientH > clientMaxH) {
          clientH = clientMaxH;
          clientW = clientH / ratio;
        }

        const blockW = clientW + gap + pedidoTextW;
        const blockX = pageW - margin - blockW;

        // logo cliente ANTES
        doc.addImage(clientLogo, "PNG", blockX, 9.2, clientW, clientH);
        // texto después del logo
        doc.text(pedidoText, blockX + clientW + gap, 11);
      } else {
        doc.text(pedidoText, pageW - margin, 11, { align: "right" });
      }

      // Fecha abajo derecha
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(fecha, pageW - margin, 17, { align: "right" });

      // ===== Texto principal (izquierda-centro) =====
      const textX = xhuncoLogo ? margin + leftW + 6 : margin;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text("Comprobante de pedido", textX, 12);

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(business, textX, 17);

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

      // ✅ Abrir + descargar
      const filename = `Xhunco_Pedido_${folioShort}.pdf`;
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank", "noopener,noreferrer");

      const aTag = document.createElement("a");
      aTag.href = url;
      aTag.download = filename;
      document.body.appendChild(aTag);
      aTag.click();
      aTag.remove();

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
    <div className="w-full max-w-none min-w-0 text-black">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Detalle del pedido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fecha: <span className="text-gray-900 font-medium">{formatDateTime(order?.created_at)}</span>
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
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {!order ? (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">No hay información del pedido.</div>
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
                      <div key={it?.id || `${idx}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
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

            {/* ✅ TIMELINE PRO */}
            <div className="mt-4">
              <StatusTimeline statusRaw={order?.status} createdAt={order?.created_at} />
            </div>

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

            {/* ✅ Pago + Datos de transferencia */}
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Pago</div>
              <div className="text-sm font-semibold text-gray-900">{formatPayment(order?.payment_method)}</div>

              {isTransfer && transferInfo ? (
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                  <div className="text-xs font-semibold text-gray-900">Datos para transferencia</div>

                  <div className="mt-2 space-y-2 text-sm text-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Banco</span>
                      <span className="font-medium">{transferInfo.bank || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">Beneficiario</span>
                      <span className="font-medium">{transferInfo.holder || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600">CLABE</span>
                      <span className="font-mono font-semibold">{transferInfo.clabe || "—"}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}