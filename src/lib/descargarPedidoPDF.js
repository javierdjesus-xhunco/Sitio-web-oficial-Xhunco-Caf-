import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeStatus(status) {
  const map = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    en_preparacion: "En preparación",
    en_ruta: "En ruta",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  return map[status] || status || "—";
}

function normalizePaymentMethod(method) {
  const map = {
    cash: "Efectivo",
    tpv: "Terminal",
    online: "Pago en línea",
    transfer: "Transferencia",
  };

  return map[method] || method || "—";
}

function normalizeDeliveryMethod(method) {
  const map = {
    pickup: "Recoger en tienda",
    delivery: "Entrega a domicilio",
  };

  return map[method] || method || "—";
}

export async function descargarPedidoPDF(pedidoId, endpointBase = "/api/admin/orders") {
  try {
    if (!pedidoId) {
      alert("No se encontró el ID del pedido.");
      return;
    }

    const res = await fetch(`${endpointBase}/${pedidoId}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "No se pudo obtener el pedido.");
      return;
    }

    const pedido = data?.order || data?.pedido || data;

    if (!pedido) {
      alert("No se encontró la información del pedido.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 42;

    // Header
    doc.setFillColor(248, 246, 240);
    doc.rect(0, 0, pageWidth, 120, "F");

    doc.setTextColor(49, 87, 44);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Xhunco Café", marginX, 52);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Comprobante de pedido", marginX, 75);

    doc.setTextColor(49, 87, 44);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(`Pedido #${String(pedido.id).slice(0, 8).toUpperCase()}`, pageWidth - marginX, 52, {
      align: "right",
    });

    doc.setTextColor(90, 90, 90);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(formatDate(pedido.created_at), pageWidth - marginX, 75, {
      align: "right",
    });

    let y = 150;

    // Cliente
    const cliente =
      pedido.clients?.business_name ||
      pedido.client?.business_name ||
      pedido.business_name ||
      pedido.cliente ||
      "Cliente";

    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Información del pedido", marginX, y);

    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    doc.text(`Cliente: ${cliente}`, marginX, y);
    y += 16;

    doc.text(`Estatus: ${normalizeStatus(pedido.status)}`, marginX, y);
    y += 16;

    doc.text(`Método de entrega: ${normalizeDeliveryMethod(pedido.delivery_method)}`, marginX, y);
    y += 16;

    doc.text(`Método de pago: ${normalizePaymentMethod(pedido.payment_method)}`, marginX, y);
    y += 24;

    // Dirección si existe
    const address = pedido.delivery_address_snapshot;

    if (address && typeof address === "object") {
      const addressText = [
        address.street,
        address.ext_number ? `Ext. ${address.ext_number}` : "",
        address.int_number ? `Int. ${address.int_number}` : "",
        address.neighborhood,
        address.municipality,
        address.state,
        address.postal_code ? `C.P. ${address.postal_code}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      if (addressText) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Dirección de entrega", marginX, y);

        y += 16;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);

        const splitAddress = doc.splitTextToSize(addressText, pageWidth - marginX * 2);
        doc.text(splitAddress, marginX, y);

        y += splitAddress.length * 13 + 18;
      }
    }

    const items =
      pedido.order_items ||
      pedido.items ||
      pedido.detalle ||
      [];

    const rows = items.map((item) => {
      const nombre =
        item.snapshot?.nombre ||
        item.suministros_xhunco?.nombre ||
        item.nombre ||
        "Producto";

      const sku =
        item.snapshot?.sku ||
        item.suministros_xhunco?.sku ||
        item.sku ||
        "—";

      const qty = item.qty || item.cantidad || 0;
      const unitPrice = item.unit_price || item.precio_unitario || 0;
      const lineTotal = item.line_total || Number(qty) * Number(unitPrice);

      return [
        sku,
        nombre,
        qty,
        money(unitPrice),
        money(lineTotal),
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [["SKU", "Producto", "Cant.", "Precio", "Total"]],
      body: rows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 7,
        textColor: [50, 50, 50],
        lineColor: [225, 225, 225],
      },
      headStyles: {
        fillColor: [49, 87, 44],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 70 },
        2: { halign: "center", cellWidth: 45 },
        3: { halign: "right", cellWidth: 70 },
        4: { halign: "right", cellWidth: 75 },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 28;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text("Subtotal", pageWidth - 170, finalY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(money(pedido.subtotal || pedido.total), pageWidth - marginX, finalY, {
      align: "right",
    });

    doc.setFontSize(14);
    doc.setTextColor(49, 87, 44);
    doc.text("Total", pageWidth - 170, finalY + 24);

    doc.text(money(pedido.total), pageWidth - marginX, finalY + 24, {
      align: "right",
    });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 130, 130);
    doc.text(
      "Este documento es un comprobante interno de pedido emitido por Xhunco Café.",
      marginX,
      doc.internal.pageSize.getHeight() - 35
    );

    doc.save(`pedido-${String(pedido.id).slice(0, 8)}.pdf`);
  } catch (error) {
    console.error("Error descargando PDF:", error);
    alert("Ocurrió un error al generar el PDF.");
  }
}