import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/mailer";

function toQty(v) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : NaN;
}

function money(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(n || 0));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildCustomerEmailHtml({
  customerName,
  orderNo,
  items,
  total,
}) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.nombre)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.qty}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${money(
            item.qty * item.precio,
          )}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;">
      <h2 style="margin:0 0 12px;">Confirmación de pedido</h2>
      <p>Hola ${escapeHtml(customerName || "cliente")},</p>
      <p>Tu pedido fue recibido correctamente y ya se encuentra en revisión.</p>

      <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">
        <p style="margin:0 0 8px;"><strong>Número de pedido:</strong> ${escapeHtml(
          orderNo,
        )}</p>
        <p style="margin:0;"><strong>Estatus inicial:</strong> Pendiente</p>
      </div>

      <h3 style="margin:20px 0 10px;">Resumen del pedido</h3>

      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 0;border-bottom:1px solid #cbd5e1;">Producto</th>
            <th style="text-align:center;padding:10px 0;border-bottom:1px solid #cbd5e1;">Cant.</th>
            <th style="text-align:right;padding:10px 0;border-bottom:1px solid #cbd5e1;">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <p style="margin-top:16px;"><strong>Total:</strong> ${money(total)}</p>

      <p style="margin-top:24px;">Gracias por comprar con Xhunco Café.</p>
    </div>
  `;
}

function buildAdminEmailHtml({
  orderNo,
  customerName,
  businessName,
  total,
}) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;">
      <h2 style="margin:0 0 12px;">Nuevo pedido recibido</h2>
      <p>Se registró un nuevo pedido desde checkout.</p>

      <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">
        <p style="margin:0 0 8px;"><strong>Número de pedido:</strong> ${escapeHtml(
          orderNo,
        )}</p>
        <p style="margin:0 0 8px;"><strong>Cliente:</strong> ${escapeHtml(
          customerName || "-",
        )}</p>
        <p style="margin:0 0 8px;"><strong>Empresa:</strong> ${escapeHtml(
          businessName || "-",
        )}</p>
        <p style="margin:0;"><strong>Total:</strong> ${money(total)}</p>
      </div>
    </div>
  `;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const cliente = body?.cliente || {};
    const pago = body?.pago || {};
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!cliente.nombre?.trim()) {
      return NextResponse.json(
        { error: "El nombre del cliente es obligatorio." },
        { status: 400 },
      );
    }

    if (!cliente.email?.trim()) {
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email.trim())) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 },
      );
    }

    if (!cliente.telefono?.trim()) {
      return NextResponse.json(
        { error: "El teléfono es obligatorio." },
        { status: 400 },
      );
    }

    if (!/^\d{10}$/.test(cliente.telefono.trim())) {
      return NextResponse.json(
        { error: "El teléfono debe contener exactamente 10 dígitos." },
        { status: 400 },
      );
    }

    if (!cliente.direccion?.trim()) {
      return NextResponse.json(
        { error: "La dirección es obligatoria." },
        { status: 400 },
      );
    }

    if (!cliente.ciudad?.trim()) {
      return NextResponse.json(
        { error: "La ciudad es obligatoria." },
        { status: 400 },
      );
    }

    if (!items.length) {
      return NextResponse.json(
        { error: "No hay productos en el pedido." },
        { status: 400 },
      );
    }

    const normalizedItems = items.map((item) => {
      const qty = toQty(item.qty ?? item.cantidad);

      return {
        suministro_id: item.suministro_id || item.id || null,
        nombre: String(item.nombre || "").trim(),
        qty,
        precio: Number(item.precio || 0),
        imagen: item.imagen || null,
        categoria: item.categoria || null,
        sku: item.sku || null,
      };
    });

    for (const item of normalizedItems) {
      if (!item.nombre) {
        return NextResponse.json(
          { error: "Uno de los productos no tiene nombre válido." },
          { status: 400 },
        );
      }

      if (!Number.isFinite(item.qty) || item.qty < 1) {
        return NextResponse.json(
          { error: `Cantidad inválida para el producto ${item.nombre}.` },
          { status: 400 },
        );
      }

      if (!Number.isFinite(item.precio) || item.precio < 0) {
        return NextResponse.json(
          { error: `Precio inválido para el producto ${item.nombre}.` },
          { status: 400 },
        );
      }
    }

    const subtotal = normalizedItems.reduce(
      (acc, item) => acc + item.qty * item.precio,
      0,
    );
    const total = subtotal;

    const { data: orderNoData, error: orderNoError } = await supabaseAdmin.rpc(
      "generate_checkout_order_no",
    );

    if (orderNoError || !orderNoData) {
      console.error("Error generando número de pedido:", orderNoError);
      return NextResponse.json(
        { error: "No se pudo generar el número de pedido." },
        { status: 500 },
      );
    }

    const orderNo = String(orderNoData);

    const { data: createdOrder, error: createOrderError } = await supabaseAdmin
      .from("checkout_orders")
      .insert({
        order_no: orderNo,
        customer_name: cliente.nombre.trim(),
        customer_business: cliente.empresa?.trim() || null,
        customer_email: cliente.email.trim(),
        customer_phone: cliente.telefono.trim(),
        customer_address: cliente.direccion.trim(),
        customer_city: cliente.ciudad.trim(),
        customer_notes: cliente.notas?.trim() || null,
        payment_method: pago.metodo || "card",
        card_type: pago.tipoTarjeta || null,
        card_last4: pago.terminacion || null,
        status: "pendiente",
        payment_status: "pending",
        subtotal,
        total,
        source: "checkout_web",
      })
      .select("id, order_no, status, total, customer_name, customer_email")
      .single();

    if (createOrderError || !createdOrder) {
      console.error("Error creando checkout_order:", createOrderError);
      return NextResponse.json(
        { error: "No se pudo crear el pedido." },
        { status: 500 },
      );
    }

    const orderItemsPayload = normalizedItems.map((item) => ({
      checkout_order_id: createdOrder.id,
      suministro_id: item.suministro_id,
      nombre: item.nombre,
      categoria: item.categoria,
      sku: item.sku,
      imagen: item.imagen,
      qty: item.qty,
      unit_price: item.precio,
      line_total: item.qty * item.precio,
    }));

    const { error: createItemsError } = await supabaseAdmin
      .from("checkout_order_items")
      .insert(orderItemsPayload);

    if (createItemsError) {
      console.error("Error creando checkout_order_items:", createItemsError);

      await supabaseAdmin
        .from("checkout_orders")
        .delete()
        .eq("id", createdOrder.id);

      return NextResponse.json(
        { error: "No se pudieron guardar los productos del pedido." },
        { status: 500 },
      );
    }

    const { error: createLogError } = await supabaseAdmin
      .from("checkout_order_status_logs")
      .insert({
        checkout_order_id: createdOrder.id,
        from_status: null,
        to_status: "pendiente",
        changed_by: null,
      });

    if (createLogError) {
      console.error("Error creando log inicial:", createLogError);
    }

    const { data: adminsData, error: adminsError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, active")
      .in("role", ["admin", "super_admin"])
      .eq("active", true);

    if (adminsError) {
      console.error("Error obteniendo admins:", adminsError);
    }

    try {
      await sendEmail({
        to: cliente.email.trim(),
        subject: `Confirmación de pedido ${orderNo}`,
        html: buildCustomerEmailHtml({
          customerName: cliente.nombre.trim(),
          orderNo,
          items: normalizedItems.map((item) => ({
            nombre: item.nombre,
            qty: item.qty,
            precio: item.precio,
          })),
          total,
        }),
      });
    } catch (error) {
      console.error("Error enviando correo al cliente:", error);
    }

    if (adminsData?.length) {
      const adminEmails = adminsData
        .map((admin) => admin.email)
        .filter(Boolean);

      await Promise.allSettled(
        adminsData.map((admin) =>
          supabaseAdmin.from("notifications").insert({
            recipient_user_id: admin.id,
            recipient_role: admin.role,
            type: "checkout_order_created",
            title: "Nuevo pedido recibido",
            body: `Se registró el pedido ${orderNo} de ${cliente.nombre?.trim()}.`,
            url:
              admin.role === "super_admin"
                ? `/portal/super-admin/checkout-orders/${createdOrder.id}`
                : `/portal/admin/checkout-orders/${createdOrder.id}`,
            is_read: false,
          }),
        ),
      );

      await Promise.allSettled(
        adminEmails.map((email) =>
          sendEmail({
            to: email,
            subject: `Nuevo pedido ${orderNo}`,
            html: buildAdminEmailHtml({
              orderNo,
              customerName: cliente.nombre?.trim() || "",
              businessName: cliente.empresa?.trim() || "",
              total,
            }),
          }),
        ),
      );
    }

    return NextResponse.json({
      ok: true,
      order: {
        id: createdOrder.id,
        order_no: createdOrder.order_no,
        status: createdOrder.status,
        total: createdOrder.total,
      },
    });
  } catch (error) {
    console.error("POST /api/checkout-orders error:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el pedido." },
      { status: 500 },
    );
  }
}