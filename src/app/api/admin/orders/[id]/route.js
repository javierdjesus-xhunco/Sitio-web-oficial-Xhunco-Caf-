import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/mailer";
import {
  clientOrderConfirmedEmail,
  clientOrderInPreparationEmail,
  clientOrderOnTheWayEmail,
  clientOrderDeliveredEmail,
  clientOrderCancelledEmail,
  clientPaymentConfirmedEmail,
} from "@/lib/emailTemplates";

const ALLOWED = new Set([
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_ruta",
  "entregado",
  "cancelado",
]);

const ALLOWED_PAYMENT = new Set([
  "pending",
  "paid",
  "canceled",
]);

const STATUS_FLOW = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_ruta",
  "entregado",
];

function getIdFromUrl(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

function normalizeStatus(input) {
  const s = String(input || "").trim().toLowerCase();

  if (!s) return "";

  if (
    s === "en preparación" ||
    s === "en preparacion"
  ) {
    return "en_preparacion";
  }

  if (s === "en ruta") {
    return "en_ruta";
  }

  return s;
}

function normalizePaymentStatus(input) {
  const s = String(input || "").trim().toLowerCase();

  if (!s) return "";

  if (s === "pagado") {
    return "paid";
  }

  if (
    s === "pendiente" ||
    s === "pendiente_de_pago" ||
    s === "pendiente de pago" ||
    s === "pendiente_pago"
  ) {
    return "pending";
  }

  if (
    s === "cancelado" ||
    s === "cancelada" ||
    s === "canceled" ||
    s === "cancelled"
  ) {
    return "canceled";
  }

  return s;
}

function buildOrigin(req) {
  return (
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

function safeName(profile) {
  if (!profile) return "Cliente";

  const fullName = [
    profile.first_name,
    profile.last_name_paterno,
    profile.last_name_materno,
  ]
    .map((x) => (x || "").trim())
    .filter(Boolean)
    .join(" ");

  return fullName || profile.email || "Cliente";
}

function getNextStatus(currentStatus) {
  const index = STATUS_FLOW.indexOf(currentStatus);

  if (index < 0) return null;

  return STATUS_FLOW[index + 1] || null;
}

function isValidStatusTransition(prevStatus, nextStatus) {
  if (prevStatus === nextStatus) {
    return true;
  }

  if (prevStatus === "cancelado") {
    return false;
  }

  if (prevStatus === "entregado") {
    return false;
  }

  if (nextStatus === "cancelado") {
    return true;
  }

  return getNextStatus(prevStatus) === nextStatus;
}

function getAllowedNextStatuses(prevStatus) {
  if (prevStatus === "cancelado") {
    return [];
  }

  if (prevStatus === "entregado") {
    return [];
  }

  const next = getNextStatus(prevStatus);

  const allowed = [];

  if (next) {
    allowed.push(next);
  }

  allowed.push("cancelado");

  return allowed;
}

export async function PATCH(req, ctx) {
  const supabase = await supabaseServer();

  /*
   * Next.js puede entregar params como Promise.
   * Se intenta leer primero desde params y se mantiene
   * el fallback por URL para compatibilidad.
   */
  const params = await ctx?.params;

  const idFromParams = params?.id;

  const id = idFromParams || getIdFromUrl(req);

  if (!id) {
    return NextResponse.json(
      {
        error: "Falta id",
        debug: {
          params: params ?? null,
          url: req.url,
        },
      },
      { status: 400 }
    );
  }

  // =========================================================
  // AUTENTICACIÓN
  // =========================================================

  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return NextResponse.json(
      {
        error: "No autenticado",
      },
      { status: 401 }
    );
  }

  // =========================================================
  // PERFIL Y ROL
  // =========================================================

  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) {
    return NextResponse.json(
      {
        error: profErr.message,
      },
      { status: 400 }
    );
  }

  const prof = profRows?.[0];

  if (!prof?.active) {
    return NextResponse.json(
      {
        error: "Usuario inactivo",
      },
      { status: 403 }
    );
  }

  /*
   * Normalizamos el rol para aceptar:
   *
   * admin
   * superadmin
   * super_admin
   */
  const userRole = String(prof.role || "")
    .trim()
    .toLowerCase();

  const isAdmin = userRole === "admin";

  const isSuperAdmin =
    userRole === "superadmin" ||
    userRole === "super_admin";

  if (!isAdmin && !isSuperAdmin) {
    return NextResponse.json(
      {
        error: "No autorizado",
      },
      { status: 403 }
    );
  }

  // =========================================================
  // BODY
  // =========================================================

  const body = await req.json().catch(() => ({}));

  const wantsStatus = Object.prototype.hasOwnProperty.call(
    body || {},
    "status"
  );

  const nextStatus = wantsStatus
    ? normalizeStatus(body?.status)
    : "";

  const wantsPayment =
    Object.prototype.hasOwnProperty.call(
      body || {},
      "payment_status"
    ) ||
    nextStatus === "cancelado";

  let nextPaymentStatus =
    Object.prototype.hasOwnProperty.call(
      body || {},
      "payment_status"
    )
      ? normalizePaymentStatus(body?.payment_status)
      : "";

  /*
   * Cuando el pedido se cancela,
   * el pago pasa automáticamente a canceled.
   */
  if (nextStatus === "cancelado") {
    nextPaymentStatus = "canceled";
  }

  if (!wantsStatus && !wantsPayment) {
    return NextResponse.json(
      {
        error: "Nada que actualizar",
      },
      { status: 400 }
    );
  }

  // =========================================================
  // VALIDAR STATUS
  // =========================================================

  if (wantsStatus && !ALLOWED.has(nextStatus)) {
    return NextResponse.json(
      {
        error: "Status inválido",
        received: nextStatus,
      },
      { status: 400 }
    );
  }

  // =========================================================
  // VALIDAR PAYMENT STATUS
  // =========================================================

  if (
    wantsPayment &&
    !ALLOWED_PAYMENT.has(nextPaymentStatus)
  ) {
    return NextResponse.json(
      {
        error: "payment_status inválido",
        received: nextPaymentStatus,
      },
      { status: 400 }
    );
  }

  // =========================================================
  // OBTENER PEDIDO ACTUAL
  // =========================================================

  const { data: order, error: ordErr } = await supabaseAdmin
    .from("orders")
    .select(
      "id, status, client_user_id, payment_status"
    )
    .eq("id", id)
    .single();

  if (ordErr) {
    return NextResponse.json(
      {
        error: ordErr.message,
      },
      { status: 400 }
    );
  }

  if (!order) {
    return NextResponse.json(
      {
        error: "Pedido no encontrado",
      },
      { status: 404 }
    );
  }

  const prevStatus = normalizeStatus(order.status);

  const prevPaymentStatus = normalizePaymentStatus(
    order.payment_status || "pending"
  );

  const clientUserId = order.client_user_id;

  const origin = buildOrigin(req);

  const statusChanged =
    wantsStatus &&
    prevStatus !== nextStatus;

  const paymentChanged =
    wantsPayment &&
    prevPaymentStatus !== nextPaymentStatus;

  // =========================================================
  // SIN CAMBIOS
  // =========================================================

  if (!statusChanged && !paymentChanged) {
    return NextResponse.json({
      ok: true,
      id,
      status: prevStatus,
      payment_status: prevPaymentStatus,
      message: "Sin cambios",
    });
  }

  // =========================================================
  // PEDIDO CANCELADO
  //
  // NINGÚN ROL puede modificar un pedido cancelado.
  // =========================================================

  if (prevStatus === "cancelado") {
    return NextResponse.json(
      {
        error:
          "Este pedido está cancelado y ya no permite cambios.",
      },
      { status: 409 }
    );
  }

  // =========================================================
  // PEDIDO ENTREGADO
  //
  // ADMIN:
  // ❌ No puede hacer ningún cambio.
  //
  // SUPERADMIN:
  // ✅ Puede modificar el pedido.
  // =========================================================

  if (
    prevStatus === "entregado" &&
    !isSuperAdmin
  ) {
    return NextResponse.json(
      {
        error:
          "Este pedido ya fue entregado y no puede ser modificado por un administrador.",
        current_status: prevStatus,
        role: userRole,
      },
      { status: 409 }
    );
  }

  // =========================================================
  // VALIDAR FLUJO DE STATUS
  //
  // Admin:
  //   debe respetar el flujo.
  //
  // Superadmin:
  //   puede hacer override, incluso desde entregado.
  // =========================================================

  if (
    statusChanged &&
    !isSuperAdmin &&
    !isValidStatusTransition(
      prevStatus,
      nextStatus
    )
  ) {
    return NextResponse.json(
      {
        error:
          "No puedes saltarte pasos del pedido. Debes seguir el flujo correcto.",
        current_status: prevStatus,
        requested_status: nextStatus,
        allowed_next_statuses:
          getAllowedNextStatuses(prevStatus),
      },
      { status: 409 }
    );
  }

  // =========================================================
  // VALIDACIONES DE PAYMENT STATUS
  // =========================================================

  if (paymentChanged) {
    // -------------------------------------------------------
    // Pago cancelado
    // -------------------------------------------------------

    if (prevPaymentStatus === "canceled") {
      return NextResponse.json(
        {
          error:
            "Este pago está cancelado y ya no permite cambios.",
        },
        { status: 409 }
      );
    }

    // -------------------------------------------------------
    // Pago ya pagado
    // -------------------------------------------------------

    if (
      prevPaymentStatus === "paid" &&
      nextPaymentStatus !== "paid" &&
      nextStatus !== "cancelado"
    ) {
      return NextResponse.json(
        {
          error:
            "Este pago ya está marcado como pagado y no permite cambios manuales.",
        },
        { status: 409 }
      );
    }

    // -------------------------------------------------------
    // Solo se puede cancelar pago cuando se cancela pedido
    // -------------------------------------------------------

    if (
      nextPaymentStatus === "canceled" &&
      nextStatus !== "cancelado"
    ) {
      return NextResponse.json(
        {
          error:
            "El pago solo puede pasar a cancelado cuando el pedido se cancela.",
        },
        { status: 409 }
      );
    }

    // -------------------------------------------------------
    // Pendiente → Pendiente
    // -------------------------------------------------------

    if (
      prevPaymentStatus === "pending" &&
      nextPaymentStatus === "pending"
    ) {
      return NextResponse.json(
        {
          error: "El pago ya está pendiente.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------------
    // Validación general
    // -------------------------------------------------------

    if (
      prevPaymentStatus === "pending" &&
      !["paid", "canceled"].includes(
        nextPaymentStatus
      )
    ) {
      return NextResponse.json(
        {
          error: "Cambio de pago inválido.",
        },
        { status: 409 }
      );
    }
  }

  // =========================================================
  // CONSTRUIR PATCH
  // =========================================================

  const patch = {};

  if (statusChanged) {
    patch.status = nextStatus;
  }

  if (paymentChanged) {
    patch.payment_status = nextPaymentStatus;

    if (nextPaymentStatus === "paid") {
      patch.paid_at = new Date().toISOString();
      patch.paid_by = auth.user.id;
    }

    if (
      nextPaymentStatus === "pending" ||
      nextPaymentStatus === "canceled"
    ) {
      patch.paid_at = null;
      patch.paid_by = null;
    }
  }

  // =========================================================
  // ACTUALIZAR PEDIDO
  // =========================================================

  const { error: updErr } = await supabaseAdmin
    .from("orders")
    .update(patch)
    .eq("id", id);

  if (updErr) {
    return NextResponse.json(
      {
        error: updErr.message,
      },
      { status: 400 }
    );
  }

  // =========================================================
  // PERFIL DEL CLIENTE
  // =========================================================

  let clientProf = null;

  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, first_name, last_name_paterno, last_name_materno"
      )
      .eq("id", clientUserId)
      .single();

    clientProf = data || null;
  } catch (e) {
    console.error(
      "Error leyendo perfil cliente:",
      e
    );
  }

  const clienteEmail =
    clientProf?.email || "";

  const clienteNombre =
    safeName(clientProf);

  // =========================================================
  // STATUS CAMBIADO
  // =========================================================

  if (statusChanged) {
    // -------------------------------------------------------
    // LOG DE CAMBIO
    // -------------------------------------------------------

    try {
      await supabaseAdmin
        .from("order_status_logs")
        .insert([
          {
            order_id: id,
            changed_by: auth.user.id,
            from_status:
              prevStatus || null,
            to_status: nextStatus,
          },
        ]);
    } catch (e) {
      console.error(
        "order_status_logs insert failed:",
        e
      );
    }

    const orderUrl =
      `${origin}/portal/cliente/pedidos/${id}`;

    let email = null;
    let notifType = "";
    let notifTitle = "";
    let notifBody = "";

    // -------------------------------------------------------
    // CONFIRMADO
    // -------------------------------------------------------

    if (nextStatus === "confirmado") {
      email = clientOrderConfirmedEmail({
        clienteNombre,
        orderId: id,
        orderUrl,
      });

      notifType = "order_confirmed";

      notifTitle =
        "Tu pedido fue confirmado";

      notifBody =
        `Tu pedido ${id} fue confirmado.`;
    }

    // -------------------------------------------------------
    // EN PREPARACIÓN
    // -------------------------------------------------------

    if (
      nextStatus === "en_preparacion"
    ) {
      email =
        clientOrderInPreparationEmail({
          clienteNombre,
          orderId: id,
          orderUrl,
        });

      notifType =
        "order_in_preparation";

      notifTitle =
        "Tu pedido está en preparación";

      notifBody =
        `Tu pedido ${id} ya está en preparación.`;
    }

    // -------------------------------------------------------
    // EN RUTA
    // -------------------------------------------------------

    if (nextStatus === "en_ruta") {
      email =
        clientOrderOnTheWayEmail({
          clienteNombre,
          orderId: id,
          orderUrl,
        });

      notifType =
        "order_on_the_way";

      notifTitle =
        "Tu pedido va en camino";

      notifBody =
        `Tu pedido ${id} va en camino.`;
    }

    // -------------------------------------------------------
    // ENTREGADO
    // -------------------------------------------------------

    if (nextStatus === "entregado") {
      email =
        clientOrderDeliveredEmail({
          clienteNombre,
          orderId: id,
          orderUrl,
        });

      notifType =
        "order_delivered";

      notifTitle =
        "Tu pedido fue entregado";

      notifBody =
        `Tu pedido ${id} fue entregado.`;
    }

    // -------------------------------------------------------
    // CANCELADO
    // -------------------------------------------------------

    if (nextStatus === "cancelado") {
      email =
        clientOrderCancelledEmail({
          clienteNombre,
          orderId: id,
          orderUrl,
        });

      notifType =
        "order_cancelled";

      notifTitle =
        "Tu pedido fue cancelado";

      notifBody =
        `Tu pedido ${id} fue cancelado.`;
    }

    // =======================================================
    // NOTIFICACIÓN + EMAIL AL CLIENTE
    // =======================================================

    if (email && clientUserId) {
      try {
        const notif = {
          recipient_user_id:
            clientUserId,

          recipient_role:
            "cliente",

          type: notifType,

          title: notifTitle,

          body: notifBody,

          url:
            `/portal/cliente/pedidos/${id}`,

          is_read: false,
        };

        const { error: nErr } =
          await supabaseAdmin
            .from("notifications")
            .insert([notif]);

        if (nErr) {
          console.error(
            `Error insert ${notifType} notification:`,
            nErr
          );
        }

        if (clienteEmail) {
          try {
            await sendEmail({
              to: [clienteEmail],
              subject: email.subject,
              html: email.html,
              text: email.text,
            });
          } catch (mailErr) {
            console.error(
              `Error enviando correo de status ${nextStatus}:`,
              mailErr
            );
          }
        }
      } catch (e) {
        console.error(
          `Error notifying client on status ${nextStatus}:`,
          e
        );
      }
    }

    // =======================================================
    // REPOSICIÓN DE STOCK AL CANCELAR
    // =======================================================

    if (
      nextStatus === "cancelado" &&
      prevStatus !== "cancelado"
    ) {
      const {
        data: items,
        error: itemsErr,
      } = await supabaseAdmin
        .from("order_items")
        .select("suministro_id, qty")
        .eq("order_id", id);

      if (itemsErr) {
        return NextResponse.json(
          {
            error:
              `Status actualizado pero no se pudo leer order_items: ${itemsErr.message}`,
          },
          { status: 400 }
        );
      }

      const agg = new Map();

      for (const it of items || []) {
        const suministroId =
          it?.suministro_id;

        const qty = Math.max(
          0,
          Number(it?.qty || 0)
        );

        if (
          !suministroId ||
          qty <= 0
        ) {
          continue;
        }

        agg.set(
          suministroId,
          (agg.get(suministroId) || 0) +
            qty
        );
      }

      const ids =
        Array.from(agg.keys());

      if (ids.length > 0) {
        const {
          data: prods,
          error: prodsErr,
        } = await supabaseAdmin
          .from("suministros_xhunco")
          .select("id, stock")
          .in("id", ids);

        if (prodsErr) {
          return NextResponse.json(
            {
              error:
                `Pedido cancelado pero no se pudo leer suministros: ${prodsErr.message}`,
            },
            { status: 400 }
          );
        }

        const stockById =
          new Map(
            (prods || []).map((p) => [
              p.id,
              Math.max(
                0,
                Number(p.stock || 0)
              ),
            ])
          );

        const updates =
          ids.map(
            async (suministro_id) => {
              const current =
                stockById.get(
                  suministro_id
                );

              if (current == null) {
                console.error(
                  "Stock restore: suministro no encontrado:",
                  suministro_id
                );

                return;
              }

              const qty =
                agg.get(
                  suministro_id
                ) || 0;

              const nextStock =
                Math.max(
                  0,
                  Number(current) +
                    Number(qty)
                );

              const {
                error: stockUpdErr,
              } = await supabaseAdmin
                .from(
                  "suministros_xhunco"
                )
                .update({
                  stock: nextStock,
                })
                .eq(
                  "id",
                  suministro_id
                );

              if (stockUpdErr) {
                throw new Error(
                  `No se pudo reponer stock (${suministro_id}): ${stockUpdErr.message}`
                );
              }
            }
          );

        try {
          await Promise.all(updates);
        } catch (e) {
          return NextResponse.json(
            {
              error:
                `Pedido cancelado pero falló la reposición de stock: ${String(
                  e?.message || e
                )}`,
            },
            { status: 400 }
          );
        }
      }
    }
  }

  // =========================================================
  // NOTIFICACIÓN DE PAGO CONFIRMADO
  // =========================================================

  if (
    paymentChanged &&
    nextPaymentStatus === "paid" &&
    clientUserId
  ) {
    try {
      const orderUrl =
        `${origin}/portal/cliente/pedidos/${id}`;

      const notif = {
        recipient_user_id:
          clientUserId,

        recipient_role:
          "cliente",

        type: "order_paid",

        title:
          "Pago confirmado",

        body:
          `El pago de tu pedido ${id} fue marcado como pagado.`,

        url:
          `/portal/cliente/pedidos/${id}`,

        is_read: false,
      };

      const {
        error: pErr,
      } = await supabaseAdmin
        .from("notifications")
        .insert([notif]);

      if (pErr) {
        console.error(
          "Error insert order_paid notification:",
          pErr
        );
      }

      if (clienteEmail) {
        try {
          const email =
            clientPaymentConfirmedEmail({
              clienteNombre,
              orderId: id,
              orderUrl,
            });

          await sendEmail({
            to: [clienteEmail],
            subject: email.subject,
            html: email.html,
            text: email.text,
          });
        } catch (mailErr) {
          console.error(
            "Error enviando correo de pago confirmado:",
            mailErr
          );
        }
      }
    } catch (e) {
      console.error(
        "Error notifying client on payment paid:",
        e
      );
    }
  }

  // =========================================================
  // RESPUESTA FINAL
  // =========================================================

  return NextResponse.json({
    ok: true,

    id,

    status: statusChanged
      ? nextStatus
      : prevStatus,

    payment_status: paymentChanged
      ? nextPaymentStatus
      : prevPaymentStatus,

    paid_at:
      Object.prototype.hasOwnProperty.call(
        patch,
        "paid_at"
      )
        ? patch.paid_at
        : null,

    paid_by:
      Object.prototype.hasOwnProperty.call(
        patch,
        "paid_by"
      )
        ? patch.paid_by
        : null,

    role: userRole,

    superadmin_override:
      isSuperAdmin &&
      prevStatus === "entregado" &&
      statusChanged,
  });
}