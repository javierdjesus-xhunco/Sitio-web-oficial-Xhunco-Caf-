function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function infoRow(label, value) {
  return `
    <tr>
      <td style="padding:10px 0;color:#6b7280;font-size:13px;vertical-align:top;width:110px;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;vertical-align:top;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

function baseTemplate({
  eyebrow = "Xhunco Café",
  title,
  intro,
  summaryRows = [],
  bodyHtml = "",
  ctaLabel,
  ctaUrl,
  secondaryNote = "",
  footerNote = "Este mensaje fue generado automáticamente por la plataforma de Xhunco Café.",
}) {
  const summaryTable = summaryRows.length
    ? `
      <div style="margin:24px 0 0 0;border:1px solid #e5e7eb;border-radius:16px;background:#f9fafb;padding:18px 18px 8px 18px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${summaryRows.join("")}
        </table>
      </div>
    `
    : "";

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
        <div style="margin-top:28px;">
          <a
            href="${ctaUrl}"
            target="_blank"
            rel="noreferrer"
            style="
              display:inline-block;
              background:#31572c;
              color:#ffffff;
              text-decoration:none;
              font-size:14px;
              font-weight:700;
              line-height:1;
              padding:14px 20px;
              border-radius:999px;
            "
          >
            ${escapeHtml(ctaLabel)}
          </a>
        </div>
      `
      : "";

  const secondaryBlock = secondaryNote
    ? `
      <div style="margin-top:22px;font-size:13px;line-height:1.6;color:#6b7280;">
        ${secondaryNote}
      </div>
    `
    : "";

  return `
    <div style="margin:0;padding:0;background:#f3f5f7;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f5f7;">
        <tr>
          <td align="center" style="padding:28px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;">
              <tr>
                <td style="padding:0 0 14px 4px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">
                  ${escapeHtml(eyebrow)}
                </td>
              </tr>

              <tr>
                <td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;">
                  <div style="height:6px;background:#31572c;"></div>

                  <div style="padding:34px 28px 30px 28px;font-family:Arial,sans-serif;">
                    <div style="font-size:30px;line-height:1.15;font-weight:800;color:#111827;margin:0 0 14px 0;">
                      ${title}
                    </div>

                    <div style="font-size:15px;line-height:1.7;color:#374151;margin:0;">
                      ${intro}
                    </div>

                    ${summaryTable}

                    ${
                      bodyHtml
                        ? `
                      <div style="margin-top:22px;font-size:14px;line-height:1.7;color:#374151;">
                        ${bodyHtml}
                      </div>
                    `
                        : ""
                    }

                    ${ctaBlock}
                    ${secondaryBlock}

                    <div style="margin-top:30px;padding-top:18px;border-top:1px solid #e5e7eb;font-size:14px;line-height:1.7;color:#374151;">
                      Saludos,<br />
                      <strong style="color:#111827;">Equipo Xhunco Café</strong>
                    </div>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 8px 0 8px;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;text-align:center;">
                  ${footerNote}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function adminNewOrderEmail({ clienteNombre, orderId, panelUrl, isSuperAdmin = false }) {
  const title = "Nuevo pedido pendiente";
  const intro = "Se registró un nuevo pedido en la plataforma y ya está disponible para revisión en el panel correspondiente.";

  return {
    subject: "Nuevo pedido pendiente en Xhunco",
    html: baseTemplate({
      title,
      intro,
      summaryRows: [
        infoRow("Cliente", clienteNombre),
        infoRow("Pedido", orderId),
        infoRow("Panel", isSuperAdmin ? "Super administración" : "Administración"),
      ],
      ctaLabel: isSuperAdmin ? "Abrir panel de super admin" : "Abrir panel de pedidos",
      ctaUrl: panelUrl,
      secondaryNote:
        "Te recomendamos revisar el pedido lo antes posible para validar su información y continuar con el seguimiento operativo.",
    }),
    text: `Nuevo pedido pendiente en Xhunco.\nCliente: ${clienteNombre}\nPedido: ${orderId}\nPanel: ${panelUrl}`,
  };
}

export function clientOrderReceivedEmail({ clienteNombre, orderId, orderUrl }) {
  return {
    subject: "Recibimos tu pedido en Xhunco",
    html: baseTemplate({
      title: "Recibimos tu pedido",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, hemos recibido correctamente tu pedido y nuestro equipo lo revisará en breve.`,
      summaryRows: [infoRow("Pedido", orderId), infoRow("Estatus", "Pendiente de revisión")],
      ctaLabel: "Ver detalle del pedido",
      ctaUrl: orderUrl,
      secondaryNote:
        "Podrás consultar el avance de tu pedido desde tu portal en cualquier momento.",
    }),
    text: `Hola ${clienteNombre}. Recibimos correctamente tu pedido.\nPedido: ${orderId}\nConsulta el detalle aquí: ${orderUrl}`,
  };
}

export function clientOrderConfirmedEmail({ clienteNombre, orderId, orderUrl }) {
  return {
    subject: "Tu pedido ha sido confirmado",
    html: baseTemplate({
      title: "Pedido confirmado",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, tu pedido ha sido confirmado correctamente y ya puedes darle seguimiento desde tu portal.`,
      summaryRows: [infoRow("Pedido", orderId), infoRow("Estatus", "Confirmado")],
      ctaLabel: "Ver detalle del pedido",
      ctaUrl: orderUrl,
      secondaryNote:
        "A partir de este momento nuestro equipo continuará con la preparación y logística correspondiente.",
    }),
    text: `Hola ${clienteNombre}. Tu pedido ha sido confirmado.\nPedido: ${orderId}\nConsulta el detalle aquí: ${orderUrl}`,
  };
}

export function clientOrderInPreparationEmail({ clienteNombre, orderId, orderUrl }) {
  return {
    subject: "Tu pedido está en preparación",
    html: baseTemplate({
      title: "Pedido en preparación",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, queremos informarte que tu pedido ya se encuentra en preparación.`,
      summaryRows: [infoRow("Pedido", orderId), infoRow("Estatus", "En preparación")],
      ctaLabel: "Ver seguimiento del pedido",
      ctaUrl: orderUrl,
      secondaryNote:
        "Seguimos trabajando para que tu pedido quede listo en el menor tiempo posible.",
    }),
    text: `Hola ${clienteNombre}. Tu pedido ya se encuentra en preparación.\nPedido: ${orderId}\nConsulta el seguimiento aquí: ${orderUrl}`,
  };
}

export function clientOrderOnTheWayEmail({ clienteNombre, orderId, orderUrl }) {
  return {
    subject: "Tu pedido va en camino",
    html: baseTemplate({
      title: "Pedido en ruta",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, tu pedido ya va en camino.`,
      summaryRows: [infoRow("Pedido", orderId), infoRow("Estatus", "En ruta")],
      ctaLabel: "Ver detalle del pedido",
      ctaUrl: orderUrl,
      secondaryNote:
        "Te sugerimos estar pendiente de la recepción de tu pedido en el punto de entrega registrado.",
    }),
    text: `Hola ${clienteNombre}. Tu pedido ya va en ruta.\nPedido: ${orderId}\nConsulta el detalle aquí: ${orderUrl}`,
  };
}

export function clientOrderDeliveredEmail({ clienteNombre, orderId, orderUrl }) {
  return {
    subject: "Tu pedido fue entregado",
    html: baseTemplate({
      title: "Pedido entregado",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, te confirmamos que tu pedido fue entregado correctamente.`,
      summaryRows: [infoRow("Pedido", orderId), infoRow("Estatus", "Entregado")],
      ctaLabel: "Ver detalle del pedido",
      ctaUrl: orderUrl,
      secondaryNote:
        "Gracias por tu confianza. Seguimos a tu disposición para futuros pedidos.",
    }),
    text: `Hola ${clienteNombre}. Tu pedido fue entregado correctamente.\nPedido: ${orderId}\nConsulta el detalle aquí: ${orderUrl}`,
  };
}

export function clientOrderCancelledEmail({ clienteNombre, orderId, orderUrl }) {
  return {
    subject: "Actualización sobre tu pedido",
    html: baseTemplate({
      title: "Pedido cancelado",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, te informamos que tu pedido fue cancelado.`,
      summaryRows: [infoRow("Pedido", orderId), infoRow("Estatus", "Cancelado")],
      ctaLabel: "Ver detalle del pedido",
      ctaUrl: orderUrl,
      secondaryNote:
        "Si necesitas apoyo o deseas aclarar cualquier detalle, nuestro equipo estará disponible para ayudarte.",
    }),
    text: `Hola ${clienteNombre}. Tu pedido fue cancelado.\nPedido: ${orderId}\nConsulta el detalle aquí: ${orderUrl}`,
  };
}

export function clientPaymentConfirmedEmail({ clienteNombre, orderId, orderUrl }) {
  return {
    subject: "Pago confirmado de tu pedido",
    html: baseTemplate({
      title: "Pago confirmado",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, el pago de tu pedido ha sido confirmado correctamente.`,
      summaryRows: [infoRow("Pedido", orderId), infoRow("Pago", "Confirmado")],
      ctaLabel: "Ver detalle del pedido",
      ctaUrl: orderUrl,
      secondaryNote:
        "Puedes revisar la información actualizada de tu pedido desde tu portal.",
    }),
    text: `Hola ${clienteNombre}. El pago de tu pedido ha sido confirmado correctamente.\nPedido: ${orderId}\nConsulta el detalle aquí: ${orderUrl}`,
  };
}

export function adminSupplyRequestCreatedEmail({
  clienteNombre,
  businessName,
  suministroNombre,
  qty,
  requestId,
  panelUrl,
  isSuperAdmin = false,
}) {
  return {
    subject: "Nueva solicitud de suministro en Xhunco",
    html: baseTemplate({
      title: "Nueva solicitud de suministro",
      intro: "Se registró una nueva solicitud de suministro en la plataforma y ya está disponible para revisión.",
      summaryRows: [
        infoRow("Cliente", clienteNombre),
        infoRow("Negocio", businessName || "—"),
        infoRow("Suministro", suministroNombre),
        infoRow("Cantidad", String(qty)),
        infoRow("Solicitud", requestId),
        infoRow("Panel", isSuperAdmin ? "Super administración" : "Administración"),
      ],
      ctaLabel: isSuperAdmin ? "Abrir panel de super admin" : "Abrir panel de solicitudes",
      ctaUrl: panelUrl,
      secondaryNote:
        "Te recomendamos revisar la solicitud para dar seguimiento oportuno al cliente.",
    }),
    text: `Nueva solicitud de suministro en Xhunco.\nCliente: ${clienteNombre}\nNegocio: ${businessName || "—"}\nSuministro: ${suministroNombre}\nCantidad: ${qty}\nSolicitud: ${requestId}\nPanel: ${panelUrl}`,
  };
}

export function clientSupplyRequestReceivedEmail({
  clienteNombre,
  suministroNombre,
  qty,
  requestId,
  requestsUrl,
}) {
  return {
    subject: "Recibimos tu solicitud de suministro",
    html: baseTemplate({
      title: "Solicitud recibida",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, hemos recibido correctamente tu solicitud de suministro.`,
      summaryRows: [
        infoRow("Solicitud", requestId),
        infoRow("Suministro", suministroNombre),
        infoRow("Cantidad", String(qty)),
        infoRow("Estatus", "Pendiente"),
      ],
      ctaLabel: "Ver solicitudes",
      ctaUrl: requestsUrl,
      secondaryNote:
        "Nuestro equipo revisará tu solicitud y te notificará cualquier actualización desde tu portal.",
    }),
    text: `Hola ${clienteNombre}. Recibimos tu solicitud de suministro.\nSolicitud: ${requestId}\nSuministro: ${suministroNombre}\nCantidad: ${qty}\nConsulta el detalle aquí: ${requestsUrl}`,
  };
}

export function clientSupplyRequestConfirmedEmail({
  clienteNombre,
  suministroNombre,
  qty,
  requestId,
  requestsUrl,
}) {
  return {
    subject: "Tu solicitud de suministro fue confirmada",
    html: baseTemplate({
      title: "Solicitud confirmada",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, tu solicitud de suministro fue confirmada correctamente.`,
      summaryRows: [
        infoRow("Solicitud", requestId),
        infoRow("Suministro", suministroNombre),
        infoRow("Cantidad", String(qty)),
        infoRow("Estatus", "Confirmada"),
      ],
      ctaLabel: "Ver solicitudes",
      ctaUrl: requestsUrl,
      secondaryNote:
        "Nuestro equipo dará seguimiento para atender esta solicitud.",
    }),
    text: `Hola ${clienteNombre}. Tu solicitud de suministro fue confirmada.\nSolicitud: ${requestId}\nSuministro: ${suministroNombre}\nCantidad: ${qty}\nConsulta aquí: ${requestsUrl}`,
  };
}

export function clientSupplyRequestRejectedEmail({
  clienteNombre,
  suministroNombre,
  qty,
  requestId,
  requestsUrl,
}) {
  return {
    subject: "Actualización sobre tu solicitud de suministro",
    html: baseTemplate({
      title: "Solicitud rechazada",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, te informamos que tu solicitud de suministro fue rechazada.`,
      summaryRows: [
        infoRow("Solicitud", requestId),
        infoRow("Suministro", suministroNombre),
        infoRow("Cantidad", String(qty)),
        infoRow("Estatus", "Rechazada"),
      ],
      ctaLabel: "Ver solicitudes",
      ctaUrl: requestsUrl,
      secondaryNote:
        "Si necesitas apoyo o deseas aclarar cualquier detalle, nuestro equipo estará disponible para ayudarte.",
    }),
    text: `Hola ${clienteNombre}. Tu solicitud de suministro fue rechazada.\nSolicitud: ${requestId}\nSuministro: ${suministroNombre}\nCantidad: ${qty}\nConsulta aquí: ${requestsUrl}`,
  };
}

export function clientSupplyRequestCancelledEmail({
  clienteNombre,
  suministroNombre,
  qty,
  requestId,
  requestsUrl,
}) {
  return {
    subject: "Tu solicitud de suministro fue cancelada",
    html: baseTemplate({
      title: "Solicitud cancelada",
      intro: `Hola <strong>${escapeHtml(clienteNombre)}</strong>, tu solicitud de suministro fue cancelada.`,
      summaryRows: [
        infoRow("Solicitud", requestId),
        infoRow("Suministro", suministroNombre),
        infoRow("Cantidad", String(qty)),
        infoRow("Estatus", "Cancelada"),
      ],
      ctaLabel: "Ver solicitudes",
      ctaUrl: requestsUrl,
      secondaryNote:
        "Puedes revisar esta actualización desde tu portal cuando lo necesites.",
    }),
    text: `Hola ${clienteNombre}. Tu solicitud de suministro fue cancelada.\nSolicitud: ${requestId}\nSuministro: ${suministroNombre}\nCantidad: ${qty}\nConsulta aquí: ${requestsUrl}`,
  };
}