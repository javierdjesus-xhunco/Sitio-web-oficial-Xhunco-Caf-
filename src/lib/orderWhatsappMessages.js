export function formatMoneyMXN(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export function formatDateMX(value) {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function paymentLabel(method) {
  const value = String(method || "").toLowerCase();

  if (value === "cash") return "Efectivo";
  if (value === "transfer") return "Transferencia";
  if (value === "tpv") return "TPV";
  if (value === "online") return "Pago en línea";

  return method || "No especificado";
}

export function deliveryLabel(method) {
  const value = String(method || "").toLowerCase();

  if (value === "pickup") return "Recolección";
  if (value === "delivery") return "Entrega a domicilio / negocio";

  return method || "No especificado";
}

export function buildAddressText(client) {
  if (!client) return "No especificada";

  return [
    `${client.street || ""} ${client.ext_number ? `#${client.ext_number}` : ""}${
      client.int_number ? ` Int. ${client.int_number}` : ""
    }`.trim(),
    `${client.neighborhood || ""}, ${client.municipality || ""}`.trim(),
    `${client.state || ""} ${client.postal_code || ""}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

export function buildClientOrderMessage({
  clientName,
  businessName,
  orderId,
  createdAt,
  paymentMethod,
  total,
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://xhunco.com";

  return `☕ ¡Gracias por tu pedido!

Hola, ${clientName || "cliente"}.

Hemos recibido correctamente tu pedido y ya se encuentra en proceso de validación.

📦 Pedido: ${orderId}
📅 Fecha: ${formatDateMX(createdAt)}
💳 Método de pago: ${paymentLabel(paymentMethod)}
💵 Total: ${formatMoneyMXN(total)}

🏢 Negocio: ${businessName || "No especificado"}

Puedes consultar el estado de tu pedido en cualquier momento desde tu portal:

${siteUrl}/portal

Agradecemos tu confianza en Xhunco® Café. Nuestro equipo comenzará a preparar tu pedido para entregarlo inmediatamente.`;
}

export function buildAdminOrderMessage({
  businessName,
  clientName,
  clientPhone,
  total,
  paymentMethod,
  items,
  deliveryMethod,
  address,
  createdAt,
  orderId,
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://xhunco.com";

  const productsText = (items || [])
    .map((item) => {
      const name =
        item.nombre ||
        item.name ||
        item.suministros_xhunco?.nombre ||
        "Producto";

      const qty = Number(item.qty || item.quantity || 0);

      return `• ${name} × ${qty}`;
    })
    .join("\n");

  return `🔔 NUEVO PEDIDO RECIBIDO

🏢 Cliente: ${businessName || "No especificado"}
👤 Contacto: ${clientName || "No especificado"}
📱 Teléfono: ${clientPhone || "No especificado"}

💰 Total del pedido: ${formatMoneyMXN(total)}
💳 Pago: ${paymentLabel(paymentMethod)}

📦 Productos solicitados

${productsText || "Sin productos"}

📍 Entrega
${deliveryLabel(deliveryMethod)}
${address || "No especificada"}

🕒 Fecha del pedido
${formatDateMX(createdAt)}

🆔 UUID
${orderId}

🔗 Administrar pedido
${siteUrl}/portal`;
}