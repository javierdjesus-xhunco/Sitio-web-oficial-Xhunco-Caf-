import "server-only";

const GRAPH_VERSION =
  process.env.WHATSAPP_GRAPH_VERSION || "v25.0";

function getWhatsAppConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return null;
  }

  return {
    token,
    phoneNumberId,
  };
}

export function normalizeMxPhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return null;

  // Convierte formato mexicano antiguo 521XXXXXXXXXX a 52XXXXXXXXXX
  if (digits.startsWith("521") && digits.length === 13) {
    digits = `52${digits.slice(3)}`;
  }

  // Número mexicano nacional de 10 dígitos
  if (digits.length === 10) {
    return `52${digits}`;
  }

  // Número mexicano con código de país
  if (digits.startsWith("52") && digits.length === 12) {
    return digits;
  }

  // Permite números internacionales en formato E.164 sin "+"
  if (digits.length >= 11 && digits.length <= 15) {
    return digits;
  }

  return null;
}

async function sendWhatsAppPayload(payload) {
  const config = getWhatsAppConfig();

  if (!config) {
    console.warn(
      "WhatsApp no configurado: faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID."
    );

    return {
      ok: false,
      skipped: true,
      error: "missing_whatsapp_config",
    };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Error enviando WhatsApp:", {
        status: res.status,
        data,
      });

      return {
        ok: false,
        status: res.status,
        data,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
      messageId: data?.messages?.[0]?.id || null,
    };
  } catch (error) {
    console.error("Error de red enviando WhatsApp:", error);

    return {
      ok: false,
      error: "whatsapp_network_error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Mensaje libre.
 * Solo debe usarse dentro de la ventana de atención abierta por el cliente.
 */
export async function sendWhatsAppText({ to, message }) {
  const normalizedTo = normalizeMxPhone(to);
  const cleanMessage = String(message || "").trim();

  if (!normalizedTo) {
    return {
      ok: false,
      skipped: true,
      error: "invalid_phone",
    };
  }

  if (!cleanMessage) {
    return {
      ok: false,
      skipped: true,
      error: "empty_message",
    };
  }

  return sendWhatsAppPayload({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizedTo,
    type: "text",
    text: {
      preview_url: false,
      body: cleanMessage,
    },
  });
}

/**
 * Plantilla aprobada por Meta.
 * Se usa para confirmaciones de pedido y notificaciones
 * iniciadas por Xhunco.
 */
export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "es_MX",
  components = [],
}) {
  const normalizedTo = normalizeMxPhone(to);

  if (!normalizedTo) {
    return {
      ok: false,
      skipped: true,
      error: "invalid_phone",
    };
  }

  if (!templateName) {
    return {
      ok: false,
      skipped: true,
      error: "missing_template_name",
    };
  }

  const template = {
    name: templateName,
    language: {
      code: languageCode,
    },
  };

  if (components.length > 0) {
    template.components = components;
  }

  return sendWhatsAppPayload({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizedTo,
    type: "template",
    template,
  });
}