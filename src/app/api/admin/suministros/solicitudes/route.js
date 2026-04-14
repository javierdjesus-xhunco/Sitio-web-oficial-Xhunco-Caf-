import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/mailer";

const ALLOWED_ROLES = ["admin", "super_admin", "superadmin"];
const ALLOWED_STATUSES = ["pendiente", "confirmada", "rechazada", "cancelada"];

function buildOrigin(req) {
  return req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function normalizeStatus(v) {
  return String(v || "").trim().toLowerCase();
}

function safeName(profile) {
  const firstName = String(profile?.first_name || "").trim();
  if (firstName) return firstName;
  return profile?.email || "Cliente";
}

async function requireAdminUser() {
  const supabase = await supabaseServer();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }

  const { data: me, error: meErr } = await supabaseAdmin
    .from("profiles")
    .select("id, role, active")
    .eq("id", auth.user.id)
    .single();

  if (meErr || !me) {
    return { error: NextResponse.json({ error: "Perfil no encontrado" }, { status: 403 }) };
  }

  if (!me.active) {
    return { error: NextResponse.json({ error: "Usuario inactivo" }, { status: 403 }) };
  }

  if (!ALLOWED_ROLES.includes(String(me.role || "").toLowerCase())) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return {
    supabase,
    user: auth.user,
    profile: me,
  };
}

function buildClientStatusEmail({
  clienteNombre,
  suministroNombre,
  qty,
  requestId,
  requestsUrl,
  nextStatus,
}) {
  const title =
    nextStatus === "confirmada"
      ? "Solicitud confirmada"
      : nextStatus === "rechazada"
      ? "Solicitud rechazada"
      : "Solicitud actualizada";

  const intro =
    nextStatus === "confirmada"
      ? `Hola ${clienteNombre}, tu solicitud de suministro fue confirmada correctamente.`
      : nextStatus === "rechazada"
      ? `Hola ${clienteNombre}, tu solicitud de suministro fue rechazada.`
      : `Hola ${clienteNombre}, tu solicitud de suministro fue actualizada.`;

  const detail =
    nextStatus === "confirmada"
      ? "Ya puedes dar seguimiento desde tu portal."
      : nextStatus === "rechazada"
      ? "Puedes revisar el detalle en tu portal y, si aplica, generar una nueva solicitud."
      : "Consulta el detalle actualizado en tu portal.";

  const prettyStatus =
    nextStatus === "confirmada"
      ? "Confirmada"
      : nextStatus === "rechazada"
      ? "Rechazada"
      : "Actualizada";

  const subject =
    nextStatus === "confirmada"
      ? "Tu solicitud de suministro fue confirmada"
      : nextStatus === "rechazada"
      ? "Tu solicitud de suministro fue rechazada"
      : "Tu solicitud de suministro fue actualizada";

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f6f7f8; padding:24px;">
      <div style="max-width:720px; margin:0 auto; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #e5e7eb;">
        <div style="height:8px; background:#31572c;"></div>
        <div style="padding:32px 28px;">
          <div style="font-size:12px; letter-spacing:3px; color:#6b7280; margin-bottom:14px;">XHUNCO CAFÉ</div>
          <h1 style="margin:0 0 18px; font-size:24px; line-height:1.2; color:#111827;">
            ${title}
          </h1>

          <p style="margin:0 0 10px; font-size:15px; line-height:1.7; color:#374151;">
            ${intro}
          </p>
          <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#374151;">
            ${detail}
          </p>

          <div style="border:1px solid #e5e7eb; border-radius:18px; padding:18px 18px; background:#fafafa; margin-bottom:24px;">
            <div style="display:grid; grid-template-columns:160px 1fr; row-gap:12px; column-gap:16px; font-size:14px; color:#374151;">
              <div style="color:#6b7280;">Solicitud</div>
              <div><strong>${requestId}</strong></div>

              <div style="color:#6b7280;">Suministro</div>
              <div><strong>${suministroNombre}</strong></div>

              <div style="color:#6b7280;">Cantidad</div>
              <div><strong>${qty}</strong></div>

              <div style="color:#6b7280;">Estatus</div>
              <div><strong>${prettyStatus}</strong></div>
            </div>
          </div>

          <a
            href="${requestsUrl}"
            style="display:inline-block; background:#31572c; color:#ffffff; text-decoration:none; padding:14px 22px; border-radius:999px; font-weight:700; font-size:14px;"
          >
            Ver solicitudes
          </a>

          <p style="margin:26px 0 0; font-size:13px; line-height:1.7; color:#6b7280;">
            Saludos,<br />
            <strong style="color:#111827;">Equipo Xhunco Café</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
${subject}

${intro}
${detail}

Solicitud: ${requestId}
Suministro: ${suministroNombre}
Cantidad: ${qty}
Estatus: ${prettyStatus}

Ver solicitudes:
${requestsUrl}
  `.trim();

  return { subject, html, text };
}

export async function GET(req) {
  const guard = await requireAdminUser();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);

  const status = normalizeStatus(searchParams.get("status") || "pendiente");
  const clientUserId = String(searchParams.get("client_user_id") || "").trim();
  const limitRaw = Number(searchParams.get("limit") || 50);
  const offsetRaw = Number(searchParams.get("offset") || 0);

  const limit = Math.max(1, Math.min(100, Number.isFinite(limitRaw) ? limitRaw : 50));
  const offset = Math.max(0, Number.isFinite(offsetRaw) ? offsetRaw : 0);

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  let baseQuery = supabaseAdmin
    .from("suministros_solicitudes")
    .select("id, client_id, suministro_id, qty, status, created_at", { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (clientUserId) {
    baseQuery = baseQuery.eq("client_id", clientUserId);
  }

  const { data: rows, error, count } = await baseQuery.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const clientIds = Array.from(new Set((rows || []).map((r) => r.client_id).filter(Boolean)));
  const suministroIds = Array.from(
    new Set((rows || []).map((r) => r.suministro_id).filter(Boolean))
  );

  let profiles = [];
  let clients = [];
  let suministros = [];

  if (clientIds.length > 0) {
    const [{ data: pData }, { data: cData }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, first_name, middle_name, last_name_paterno, last_name_materno")
        .in("id", clientIds),
      supabaseAdmin
        .from("clients")
        .select("user_id, business_name")
        .in("user_id", clientIds),
    ]);

    profiles = pData || [];
    clients = cData || [];
  }

  if (suministroIds.length > 0) {
    const { data: sData } = await supabaseAdmin
      .from("suministros_xhunco")
      .select("id, nombre, marca, categoria, sku")
      .in("id", suministroIds);

    suministros = sData || [];
  }

  const profilesMap = new Map(profiles.map((p) => [p.id, p]));
  const clientsMap = new Map(clients.map((c) => [c.user_id, c]));
  const suministrosMap = new Map(suministros.map((s) => [s.id, s]));

  const items = (rows || []).map((row) => {
    const profile = profilesMap.get(row.client_id) || null;
    const client = clientsMap.get(row.client_id) || null;
    const suministro = suministrosMap.get(row.suministro_id) || null;

    return {
      id: row.id,
      client_id: row.client_id,
      suministro_id: row.suministro_id,
      qty: row.qty,
      status: row.status,
      created_at: row.created_at,
      client_name: safeName(profile),
      client_email: profile?.email || "",
      business_name: (client?.business_name || "").trim() || "—",
      suministro_nombre: suministro?.nombre || "—",
      suministro_marca: suministro?.marca || "",
      suministro_categoria: suministro?.categoria || "",
      suministro_sku: suministro?.sku || "",
    };
  });

  return NextResponse.json({
    items,
    count: typeof count === "number" ? count : null,
    limit,
    offset,
  });
}

export async function PATCH(req) {
  const guard = await requireAdminUser();
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "").trim();
  const nextStatus = normalizeStatus(body?.status);

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  if (!["confirmada", "rechazada", "cancelada"].includes(nextStatus)) {
    return NextResponse.json({ error: "status inválido para actualización" }, { status: 400 });
  }

  const { data: existing, error: existingErr } = await supabaseAdmin
    .from("suministros_solicitudes")
    .select("id, client_id, suministro_id, qty, status, created_at")
    .eq("id", id)
    .single();

  if (existingErr || !existing) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  if (normalizeStatus(existing.status) === nextStatus) {
    return NextResponse.json({ item: existing, updated: false });
  }

  const { data: updated, error: updErr } = await supabaseAdmin
    .from("suministros_solicitudes")
    .update({
      status: nextStatus,
      handled_by: guard.user.id,
      handled_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, client_id, suministro_id, qty, status, created_at, handled_by, handled_at")
    .single();

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 400 });
  }

  try {
    const [{ data: profile }, { data: client }, { data: suministro }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, first_name, middle_name, last_name_paterno, last_name_materno")
        .eq("id", updated.client_id)
        .single(),
      supabaseAdmin
        .from("clients")
        .select("user_id, business_name")
        .eq("user_id", updated.client_id)
        .single(),
      supabaseAdmin
        .from("suministros_xhunco")
        .select("id, nombre")
        .eq("id", updated.suministro_id)
        .single(),
    ]);

    const clienteNombre = safeName(profile);
    const clienteEmail = profile?.email || "";
    const origin = buildOrigin(req);

    const prettyStatus =
      nextStatus === "confirmada"
        ? "confirmada"
        : nextStatus === "rechazada"
        ? "rechazada"
        : "cancelada";

    const clientRequestsUrl = "/portal/cliente/suministros/solicitudes";

    const notifPayload = {
      recipient_user_id: updated.client_id,
      recipient_role: "cliente",
      type: "supply_request_status_changed",
      title: "Actualización de solicitud de suministro",
      body: `Tu solicitud de ${suministro?.nombre || "suministro"} fue ${prettyStatus}.`,
      url: clientRequestsUrl,
      is_read: false,
    };

    const { error: notifErr } = await supabaseAdmin
      .from("notifications")
      .insert(notifPayload);

    if (notifErr) {
      console.error("Error insertando notificación para cliente:", {
        clientId: updated.client_id,
        payload: notifPayload,
        error: notifErr,
      });
    }

    if (clienteEmail) {
      const requestsUrl = `${origin}/portal/cliente/suministros/solicitudes`;

      const email = buildClientStatusEmail({
        clienteNombre,
        suministroNombre: suministro?.nombre || "Suministro",
        qty: updated.qty,
        requestId: updated.id,
        requestsUrl,
        nextStatus,
      });

      await sendEmail({
        to: [clienteEmail],
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    }
  } catch (e) {
    console.error("Error notificando al cliente por cambio de status:", e);
  }

  return NextResponse.json({ item: updated, updated: true });
}