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

// ✅ NUEVO: estado de pago legible
function formatPaymentStatus(s) {
  const v = String(s || "pending").toLowerCase().trim();
  if (v === "paid") return "Pagado";
  if (v === "pending") return "Pendiente de pago";
  return s ? String(s) : "—";
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
        <div className="mt-1 text-xs text-red-700">{createdAt ? `Creado: ${formatDateTime(createdAt)}` : null}</div>
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

  const [businessName, setBusinessName] = useState("");
  const [clientLogoUrl, setClientLogoUrl] = useState("");

  const total = useMemo(() => formatMoney(order?.total), [order?.total]);
  const address = order?.delivery_address_snapshot || null;

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

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const st = normalizeStatusKey(order?.status);
    if (st === "entregado" || st === "cancelado") return;

    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, order?.status]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/cliente/me", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          if (data?.client?.business_name) setBusinessName(data.client.business_name);
          if (data?.client?.logo_url) setClientLogoUrl(data.client.logo_url);
        }
      } catch {}
    };
    run();
  }, []);

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

    const BRAND_RGB = [49, 87, 44];
    const DARK_RGB = [37, 68, 31];

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;

    const folioShort = String(order?.id || "").slice(0, 8).toUpperCase();
    const filename = `Xhunco_Pedido_${folioShort}.pdf`;

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

    const clientSnapshot = order?.client_snapshot || {};
    const snapshotAddress = clientSnapshot?.address || {};
    const deliveryAddress = order?.delivery_address_snapshot || {};

    const business = safeText(
      clientSnapshot?.business_name ||
        businessName ||
        getBusinessNameFromAddressSnapshot(order) ||
        "Cliente"
    );

    const uuid = safeText(order?.id, "—");
    const fecha = formatDateTime(order?.created_at);

    const isDelivery =
      String(order?.delivery_method || "").toLowerCase() === "delivery";

    const addressSource = isDelivery ? deliveryAddress : snapshotAddress;

    const domicilioLine1 = isDelivery
      ? `${addressSource?.street || "—"}${
          addressSource?.ext_number ? ` #${addressSource.ext_number}` : ""
        }${addressSource?.int_number ? ` Int ${addressSource.int_number}` : ""}`
      : `${snapshotAddress?.street || "El Tordo 31"}${
          snapshotAddress?.ext_number ? ` #${snapshotAddress.ext_number}` : ""
        }${snapshotAddress?.int_number ? ` Int ${snapshotAddress.int_number}` : ""}`;

    const domicilioLine2 = isDelivery
      ? `${addressSource?.neighborhood || "—"}, ${addressSource?.municipality || "—"}`
      : `${snapshotAddress?.neighborhood || "Los Potrillos"}, ${
          snapshotAddress?.municipality || "Ocotlán"
        }`;

    const domicilioLine3 = isDelivery
      ? `${addressSource?.state || "—"} · CP ${addressSource?.postal_code || "—"}`
      : `${snapshotAddress?.state || "Tlaxcala"} · CP ${
          snapshotAddress?.postal_code || "90014"
        }`;

    const addressFull = `${domicilioLine1}, ${domicilioLine2}, ${domicilioLine3}`;

    const clientName = safeText(clientSnapshot?.client_name || "—");
    const clientPhone = safeText(clientSnapshot?.phone || "—");
    const clientEmail = safeText(clientSnapshot?.email || "—");

    // =========================
    // HEADER
    // =========================
    doc.setFillColor(250, 250, 247);
    doc.rect(0, 0, pageW, 34, "F");

    doc.setFillColor(...BRAND_RGB);
    doc.rect(0, 33, pageW, 1.4, "F");

    if (xhuncoLogo) {
      addImageFit(doc, xhuncoLogo, margin, 8, 38, 13);
    } else {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(...BRAND_RGB);
      doc.text("XHUNCO Café", margin, 15);
    }

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Comprobante de pedido", 58, 13);

    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(business, 58, 19);

    if (clientLogo) {
      const props = doc.getImageProperties(clientLogo);
      const ratio = props.height / props.width;

      let logoW = 16;
      let logoH = logoW * ratio;

      if (logoH > 12) {
        logoH = 12;
        logoW = logoH / ratio;
      }

      doc.addImage(
        clientLogo,
        "PNG",
        pageW - margin - logoW,
        20.5,
        logoW,
        logoH
      );
    }

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Pedido #${folioShort}`, pageW - margin, 13, {
      align: "right",
    });

    doc.setFont(undefined, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(fecha, clientLogo ? pageW - margin - 20 : pageW - margin, 19, {
      align: "right",
    });

    // =========================
    // BLOQUE CORPORATIVO
    // =========================
    let y = 44;

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...DARK_RGB);
    doc.text("Corporativo Xhunco Foodservice", margin, y);

    doc.setFont(undefined, "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(71, 85, 105);
    doc.text("El Tordo 31 Col. Los Potrillos", margin, y + 6);
    doc.text("Ocotlán, Tlaxcala. Código Postal 90014", margin, y + 11);

    // Orden de compra sutil
    doc.setDrawColor(180, 198, 176);
    doc.setFillColor(247, 250, 247);
    doc.roundedRect(pageW - margin - 44, y - 5, 44, 16, 2.5, 2.5, "FD");

    doc.setTextColor(...DARK_RGB);
    doc.setFontSize(8.2);
    doc.setFont(undefined, "bold");
    doc.text("ORDEN DE COMPRA", pageW - margin - 22, y + 4.5, {
      align: "center",
    });

    // =========================
    // INFORMACIÓN DEL PEDIDO
    // =========================
    y = 72;

    doc.setDrawColor(224, 231, 224);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, pageW - margin * 2, 64, 3, 3, "FD");

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK_RGB);
    doc.text("Información del pedido", margin + 5, y + 8);

    doc.setFont(undefined, "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(100, 116, 139);

    doc.text("Negocio", margin + 5, y + 18);
    doc.text("UUID", margin + 5, y + 31);
    doc.text("Domicilio", margin + 5, y + 44);

    doc.text("Nombre del cliente", pageW / 2 + 4, y + 18);
    doc.text("Teléfono", pageW / 2 + 4, y + 31);
    doc.text("Correo electrónico", pageW / 2 + 4, y + 44);

    doc.setFont(undefined, "bold");
    doc.setFontSize(8.7);
    doc.setTextColor(15, 23, 42);
    doc.text(business, margin + 5, y + 23, { maxWidth: 80 });

    doc.setFont(undefined, "normal");
    doc.setFontSize(7.4);
    doc.text(uuid, margin + 5, y + 36, { maxWidth: 80 });
    doc.text(addressFull, margin + 5, y + 49, { maxWidth: 82 });

    doc.setFont(undefined, "bold");
    doc.setFontSize(8.7);
    doc.text(clientName, pageW / 2 + 4, y + 23, { maxWidth: 78 });
    doc.text(clientPhone, pageW / 2 + 4, y + 36, { maxWidth: 78 });
    doc.text(clientEmail, pageW / 2 + 4, y + 49, { maxWidth: 78 });

    // =========================
    // TABLA PRODUCTOS
    // =========================
    y = 154;

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
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8.8,
        cellPadding: 2.7,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        textColor: [15, 23, 42],
      },
      headStyles: {
        fillColor: BRAND_RGB,
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
      columnStyles: {
        0: { cellWidth: 92 },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "right", cellWidth: 36 },
        3: { halign: "right", cellWidth: 36 },
      },
    });

    const tableEndY = doc.lastAutoTable?.finalY || y;
    const panelY = tableEndY + 9;

    doc.setDrawColor(...BRAND_RGB);
    doc.setFillColor(250, 252, 250);
    doc.roundedRect(pageW - margin - 75, panelY, 75, 24, 3, 3, "FD");

    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Total", pageW - margin - 70, panelY + 8);

    doc.setFont(undefined, "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(formatMoney(order?.total), pageW - margin - 70, panelY + 17);

    let footerStartY = panelY + 36;

    if (isTransfer && transferInfo) {
      const boxY = panelY + 32;

      doc.setDrawColor(187, 247, 208);
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, boxY, pageW - margin * 2, 24, 3, 3, "FD");

      doc.setFont(undefined, "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK_RGB);
      doc.text("Datos para transferencia", margin + 5, boxY + 7);

      doc.setFont(undefined, "normal");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Banco: ${transferInfo.bank || "—"}`, margin + 5, boxY + 14);
      doc.text(`Beneficiario: ${transferInfo.holder || "—"}`, margin + 55, boxY + 14);
      doc.text(`CLABE: ${transferInfo.clabe || "—"}`, margin + 5, boxY + 20);

      footerStartY = boxY + 34;
    }

    const footerY = Math.max(footerStartY, pageH - 32);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 7, pageW - margin, footerY - 7);

    doc.setFont(undefined, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK_RGB);
    doc.text("Xhunco Café — Gracias por tu compra.", margin, footerY);

    doc.setFont(undefined, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      "El Tordo 31 Col. Los Potrillos. Ocotlán, Tlaxcala C.P. 90014 · soporte@xhunco.com · negocios.xhunco.com",
      margin,
      footerY + 5,
      { maxWidth: pageW - margin * 2 }
    );

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Este documento es un comprobante interno de pedido y no es un comprobante fiscal.",
      margin,
      footerY + 11
    );

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

            <div className="mt-4">
              <StatusTimeline statusRaw={order?.status} createdAt={order?.created_at} />
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold text-gray-900">{total}</div>
            </div>

            {/* ✅ NUEVO: Estado de pago independiente */}
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Estado de pago</div>
              <div className="text-sm font-semibold text-gray-900">{formatPaymentStatus(order?.payment_status)}</div>
              {String(order?.payment_status || "").toLowerCase() === "paid" && order?.paid_at ? (
                <div className="mt-1 text-xs text-gray-500">Pagado: {formatDateTime(order?.paid_at)}</div>
              ) : null}
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