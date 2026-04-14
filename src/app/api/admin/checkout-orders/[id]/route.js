import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/mailer";

const ALLOWED_TRANSITIONS = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: ["en_preparacion", "cancelado"],
  en_preparacion: ["en_ruta", "cancelado"],
  en_ruta: ["entregado"],
  entregado: [],
  cancelado: [],
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusLabel(status) {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "confirmado":
      return "Confirmado";
    case "en_preparacion":
      return "En preparación";
    case "en_ruta":
      return "En ruta";
    case "entregado":
      return "Entregado";
    case "cancelado":
      return "Cancelado";
    default:
      return status;
  }
}

function buildStatusEmailHtml({
  orderNo,
  customerName,
  status,
  shippingCarrier,
  trackingNumber,
}) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;">
      <h2 style="margin:0 0 12px;">Actualización de tu pedido</h2>
      <p>Hola ${escapeHtml(customerName || "cliente")},</p>
      <p>
        Tu pedido <strong>${escapeHtml(orderNo)}</strong> cambió a
        <strong>${escapeHtml(statusLabel(status))}</strong>.
      </p>

      ${
        status === "en_ruta"
          ? `
        <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">
          <p style="margin:0 0 8px;"><strong>Paquetería:</strong> ${escapeHtml(
            shippingCarrier || "-",
          )}</p>
          <p style="margin:0;"><strong>Número de guía:</strong> ${escapeHtml(
            trackingNumber || "-",
          )}</p>
        </div>
      `
          : ""
      }

      <p style="margin-top:24px;">Gracias por confiar en Xhunco Café.</p>
    </div>
  `;
}

export async function GET(req, context) {
  try {
    const { id } = await context.params;

    const { data: order, error } = await supabaseAdmin
      .from("checkout_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("GET order error:", error);
      return NextResponse.json(
        { error: "No se pudo obtener el pedido." },
        { status: 500 },
      );
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("checkout_order_items")
      .select("*")
      .eq("checkout_order_id", id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("GET items error:", itemsError);
      return NextResponse.json(
        { error: "No se pudieron obtener los productos del pedido." },
        { status: 500 },
      );
    }

    const { data: logs, error: logsError } = await supabaseAdmin
      .from("checkout_order_status_logs")
      .select("*")
      .eq("checkout_order_id", id)
      .order("created_at", { ascending: false });

    if (logsError) {
      console.error("GET logs error:", logsError);
      return NextResponse.json(
        { error: "No se pudo obtener el historial del pedido." },
        { status: 500 },
      );
    }

    return NextResponse.json({ order, items, logs });
  } catch (error) {
    console.error("GET /api/admin/checkout-orders/[id] error:", error);
    return NextResponse.json(
      { error: "Error interno al obtener el detalle del pedido." },
      { status: 500 },
    );
  }
}

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { status, shipping_carrier, tracking_number } = body || {};

    if (!status) {
      return NextResponse.json(
        { error: "El estatus es obligatorio." },
        { status: 400 },
      );
    }

    const { data: currentOrder, error: currentError } = await supabaseAdmin
      .from("checkout_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (currentError || !currentOrder) {
      console.error("PATCH current order error:", currentError);
      return NextResponse.json(
        { error: "No se encontró el pedido." },
        { status: 404 },
      );
    }

    const currentStatus = currentOrder.status;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        {
          error: `No se puede cambiar de ${statusLabel(
            currentStatus,
          )} a ${statusLabel(status)}.`,
        },
        { status: 400 },
      );
    }

    if (status === "en_ruta") {
      if (!shipping_carrier?.trim() || !tracking_number?.trim()) {
        return NextResponse.json(
          {
            error:
              "Debes ingresar la paquetería y el número de guía para marcar el pedido como en ruta.",
          },
          { status: 400 },
        );
      }
    }

    const updateData = {
      status,
    };

    if (status === "en_ruta") {
      updateData.shipping_carrier = shipping_carrier.trim();
      updateData.tracking_number = tracking_number.trim();
      updateData.shipped_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("checkout_orders")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("PATCH update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "No se pudo actualizar el pedido." },
        { status: 500 },
      );
    }

    const { error: logError } = await supabaseAdmin
      .from("checkout_order_status_logs")
      .insert({
        checkout_order_id: id,
        from_status: currentStatus,
        to_status: status,
        changed_by: null,
      });

    if (logError) {
      console.error("PATCH log error:", logError);
    }

    try {
      await sendEmail({
        to: currentOrder.customer_email,
        subject: `Actualización de pedido ${currentOrder.order_no}`,
        html: buildStatusEmailHtml({
          orderNo: currentOrder.order_no,
          customerName: currentOrder.customer_name,
          status,
          shippingCarrier: shipping_carrier,
          trackingNumber: tracking_number,
        }),
      });
    } catch (mailError) {
      console.error("PATCH mail error:", mailError);
    }

    return NextResponse.json({
      ok: true,
      message: "Estatus actualizado correctamente.",
      previous_status: currentStatus,
      current_status: status,
    });
  } catch (error) {
    console.error("PATCH /api/admin/checkout-orders/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno al actualizar el pedido." },
      { status: 500 },
    );
  }
}