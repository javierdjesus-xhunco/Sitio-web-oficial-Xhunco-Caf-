const GRAPH_VERSION = "v22.0";

export function normalizeMxPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return null;

  // Si ya viene como 52XXXXXXXXXX
  if (digits.startsWith("52") && digits.length >= 12) {
    return digits;
  }

  // Número mexicano normal de 10 dígitos
  if (digits.length === 10) {
    return `52${digits}`;
  }

  return digits;
}

export async function sendWhatsAppText({ to, message }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("WhatsApp no configurado: faltan variables de entorno.");
    return { ok: false, skipped: true };
  }

  const normalizedTo = normalizeMxPhone(to);

  if (!normalizedTo) {
    console.warn("WhatsApp omitido: teléfono inválido:", to);
    return { ok: false, skipped: true };
  }

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedTo,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Error enviando WhatsApp:", data);
    return { ok: false, data };
  }

  return { ok: true, data };
}