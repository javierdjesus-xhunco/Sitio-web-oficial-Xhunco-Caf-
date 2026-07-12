import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/mailer";
import {
  adminNewOrderEmail,
  clientOrderReceivedEmail,
} from "@/lib/emailTemplates";

import { sendWhatsAppText, normalizeMxPhone } from "@/lib/whatsapp";
import {
  buildClientOrderMessage,
  buildAdminOrderMessage,
  buildAddressText,
} from "@/lib/orderWhatsappMessages";


function buildOrigin(req) {
  return req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function safeName(profile) {
  if (!profile) return "Cliente";
  const fullName = [profile.first_name, profile.last_name_paterno, profile.last_name_materno]
    .map((x) => (x || "").trim())
    .filter(Boolean)
    .join(" ");
  return fullName || profile.email || "Cliente";
}

// ✅ LISTA: Mis pedidos
export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, total, created_at")
      .eq("client_user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, orders: orders || [] });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ✅ CREAR: Nuevo pedido
export async function POST(req) {
  try {
    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = authData.user.id;
    const origin = buildOrigin(req);

    const body = await req.json().catch(() => ({}));
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items requerido" }, { status: 400 });
    }

    // 1) Crear pedido con tu RPC
    const { data: orderId, error } = await supabase.rpc("create_order", { items });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2) Guardar entrega/pago
    const patch = {
      delivery_method: body?.delivery_method || null,
      payment_method: body?.payment_method || null,
      delivery_address_snapshot: body?.address || null,
      payment_snapshot: body?.payment_details || null,
      draft_no: body?.draft_no || null,
    };

    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update(patch)
      .eq("id", orderId)
      .eq("client_user_id", userId);

    if (updErr) {
      console.error("No se pudo guardar entrega/pago:", updErr);
      return NextResponse.json(
        {
          error: `Pedido creado pero no se guardó entrega/pago: ${updErr.message}`,
          order_id: orderId,
        },
        { status: 400 }
      );
    }

    // 3) Perfil cliente
    let clienteNombre = "Cliente";
    let clienteEmail = "";
    let clientePhoneProfile = "";

    try {
      const { data: prof, error: profErr } = await supabaseAdmin
        .from("profiles")
      .select("id, role, active, email, phone, first_name, last_name_paterno, last_name_materno")
        .eq("id", userId)
        .single();

      if (profErr) {
        console.error("No se pudo leer perfil del cliente:", profErr);
      } else {
        clienteNombre = safeName(prof);
        clienteEmail = prof?.email || "";
        clientePhoneProfile = prof?.phone || "";
      }
    } catch (e) {
      console.error("Error leyendo perfil cliente:", e);
    }
   
        // 3.1) Datos completos para WhatsApp
    let clientData = null;
    let createdOrder = null;
    let orderProducts = [];

    try {
      const { data: cData, error: clientErr } = await supabaseAdmin
        .from("clients")
        .select(`
          business_name,
          owner_name,
          phone,
          street,
          ext_number,
          int_number,
          neighborhood,
          municipality,
          state,
          postal_code
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (clientErr) {
        console.error("No se pudo leer cliente para WhatsApp:", clientErr);
      } else {
        clientData = cData;
      }

      const { data: oData, error: orderErr } = await supabaseAdmin
        .from("orders")
        .select("id, total, created_at, delivery_method, payment_method, delivery_address_snapshot")
        .eq("id", orderId)
        .maybeSingle();

      if (orderErr) {
        console.error("No se pudo leer pedido para WhatsApp:", orderErr);
      } else {
        createdOrder = oData;
      }

      const { data: productsData, error: productsErr } = await supabaseAdmin
        .from("order_items")
        .select(`
          qty,
          unit_price,
          line_total,
          suministros_xhunco (
            nombre,
            marca,
            presentacion
          )
        `)
        .eq("order_id", orderId);

      if (productsErr) {
        console.error("No se pudieron leer productos para WhatsApp:", productsErr);
      } else {
        orderProducts = productsData || [];
      }
    } catch (e) {
      console.error("Error preparando datos para WhatsApp:", e);
    }
    
        // 3.2) 📲 WhatsApp al cliente y a admins/superadmins
    try {
      const businessName = clientData?.business_name || "No especificado";
      const clientPhone = clientData?.phone || clientePhoneProfile || "";
      const clientContactName = clientData?.owner_name || clienteNombre || "Cliente";

      const finalOrder = {
        id: orderId,
        total: createdOrder?.total || 0,
        created_at: createdOrder?.created_at || new Date().toISOString(),
        delivery_method: createdOrder?.delivery_method || body?.delivery_method || null,
        payment_method: createdOrder?.payment_method || body?.payment_method || null,
        delivery_address_snapshot:
          createdOrder?.delivery_address_snapshot || body?.address || null,
      };

      const whatsappItems = (orderProducts || []).map((item) => {
        const product = item?.suministros_xhunco || {};

        return {
          nombre: [
            product?.nombre,
             product?.marca,
            product?.presentacion,

          ]
            .filter(Boolean)
            .join(" "),
          qty: item?.qty || 0,
        };
      });

      // Cliente
      if (clientPhone) {
        const clientMessage = buildClientOrderMessage({
          clientName: clientContactName,
          businessName,
          orderId: finalOrder.id,
          createdAt: finalOrder.created_at,
          paymentMethod: finalOrder.payment_method,
          total: finalOrder.total,
        });

        await sendWhatsAppText({
          to: clientPhone,
          message: clientMessage,
        });
      } else {
        console.warn("WhatsApp cliente omitido: el cliente no tiene teléfono registrado.");
      }

      // Admins y superadmins
      const { data: whatsappAdmins, error: whatsappAdminsErr } = await supabaseAdmin
        .from("profiles")
        .select("id, phone, role, active")
        .in("role", ["admin", "super_admin", "superadmin"])
        .eq("active", true);

      if (whatsappAdminsErr) {
        console.error("No se pudieron leer admins para WhatsApp:", whatsappAdminsErr);
      } else {
        const companyPhone = process.env.XHUNCO_WHATSAPP_ADMIN_PHONE;

        const adminPhones = [
          ...(whatsappAdmins || []).map((admin) => admin.phone),
          companyPhone,
        ]
          .filter(Boolean)
          .map((phone) => normalizeMxPhone(phone))
          .filter(Boolean);

        const uniqueAdminPhones = [...new Set(adminPhones)];

        const addressText =
          finalOrder.delivery_method === "delivery"
            ? buildAddressText(finalOrder.delivery_address_snapshot || clientData)
            : "Recolección en sucursal Xhunco";

        const adminMessage = buildAdminOrderMessage({
          businessName,
          clientName: clientContactName,
          clientPhone,
          total: finalOrder.total,
          paymentMethod: finalOrder.payment_method,
          items: whatsappItems,
          deliveryMethod: finalOrder.delivery_method,
          address: addressText,
          createdAt: finalOrder.created_at,
          orderId: finalOrder.id,
        });

        await Promise.allSettled(
          uniqueAdminPhones.map((phone) =>
            sendWhatsAppText({
              to: phone,
              message: adminMessage,
            })
          )
        );
      }
    } catch (whatsappErr) {
      console.error("El pedido se creó, pero falló el envío de WhatsApp:", whatsappErr);
    }



    // 4) 🔔 Notificación + 📧 correo a admins/superadmins
    try {
      const { data: admins, error: adminsErr } = await supabaseAdmin
        .from("profiles")
        .select("id, email, role, active")
        .in("role", ["admin", "super_admin", "superadmin"])
        .eq("active", true);

      if (adminsErr) {
        console.error("No se pudieron leer admins/superadmins:", adminsErr);
      } else {
        const notifRows = (admins || [])
          .filter((u) => u?.id)
          .map((u) => ({
            recipient_user_id: u.id,
            recipient_role: u.role,
            type: "order_created",
            title: "Nuevo pedido pendiente",
            body: `${clienteNombre} creó un pedido (${String(orderId).slice(0, 8)}…).`,
            url:
              u.role === "super_admin" || u.role === "superadmin"
                ? "/portal/super-admin/pedidos"
                : "/portal/admin/pedidos",
            is_read: false,
          }));

        if (notifRows.length > 0) {
          const { error: nErr } = await supabaseAdmin.from("notifications").insert(notifRows);
          if (nErr) console.error("Error insert notifications:", nErr);
        }

        const adminRecipients = (admins || []).filter((u) => u?.email);

        for (const admin of adminRecipients) {
          const panelUrl =
            admin.role === "super_admin" || admin.role === "superadmin"
              ? `${origin}/portal/super-admin/pedidos`
              : `${origin}/portal/admin/pedidos`;

          try {
            const email = adminNewOrderEmail({
              clienteNombre,
              orderId,
              panelUrl,
              isSuperAdmin: admin.role === "super_admin" || admin.role === "superadmin",
            });

            await sendEmail({
              to: [admin.email],
              subject: email.subject,
              html: email.html,
              text: email.text,
            });
          } catch (mailErr) {
            console.error(`Error enviando correo a ${admin.email}:`, mailErr);
          }
        }
      }
    } catch (e) {
      console.error("Error al notificar admins/superadmins:", e);
    }

    // 5) 📧 Correo al cliente: pedido recibido
    if (clienteEmail) {
      try {
        const orderUrl = `${origin}/portal/cliente/pedidos/${orderId}`;
        const email = clientOrderReceivedEmail({
          clienteNombre,
          orderId,
          orderUrl,
        });

        await sendEmail({
          to: [clienteEmail],
          subject: email.subject,
          html: email.html,
          text: email.text,
        });
      } catch (mailErr) {
        console.error("Error enviando correo al cliente:", mailErr);
      }
    }

    return NextResponse.json({ ok: true, order_id: orderId });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}