import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/mailer";
import {
  adminSupplyRequestCreatedEmail,
  clientSupplyRequestReceivedEmail,
} from "@/lib/emailTemplates";

function toQty(v) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? n : NaN;
}

function buildOrigin(req) {
  return req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function safeName(profile) {
  const firstName = String(profile?.first_name || "").trim();
  if (firstName) return firstName;
  return profile?.email || "Cliente";
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function isAdminLikeRole(role) {
  const r = normalizeRole(role);
  return r === "admin" || r === "super_admin" || r === "superadmin";
}

export async function GET() {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("suministros_solicitudes")
    .select("id, suministro_id, qty, status, created_at")
    .eq("client_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const suministroIds = Array.from(
    new Set((rows || []).map((r) => r.suministro_id).filter(Boolean))
  );

  let suministros = [];
  if (suministroIds.length > 0) {
    const { data: sData, error: sDataErr } = await supabaseAdmin
      .from("suministros_xhunco")
      .select("id, nombre, marca, categoria, sku")
      .in("id", suministroIds);

    if (sDataErr) {
      return NextResponse.json({ error: sDataErr.message }, { status: 400 });
    }

    suministros = sData || [];
  }

  const suministrosMap = new Map(suministros.map((s) => [s.id, s]));

  const items = (rows || []).map((row) => {
    const suministro = suministrosMap.get(row.suministro_id) || null;

    return {
      id: row.id,
      suministro_id: row.suministro_id,
      qty: row.qty,
      status: row.status,
      created_at: row.created_at,
      suministro_nombre: suministro?.nombre || "—",
      suministro_marca: suministro?.marca || "",
      suministro_categoria: suministro?.categoria || "",
      suministro_sku: suministro?.sku || "",
    };
  });

  return NextResponse.json({ items });
}

export async function POST(req) {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = auth.user.id;
  const origin = buildOrigin(req);

  const body = await req.json().catch(() => ({}));
  const suministro_id = body?.suministro_id;
  const qty = toQty(body?.qty);

  if (!suministro_id) {
    return NextResponse.json({ error: "suministro_id requerido" }, { status: 400 });
  }

  if (!Number.isFinite(qty) || qty < 1 || qty > 999) {
    return NextResponse.json({ error: "qty inválido (1 a 999)" }, { status: 400 });
  }

  const { data: sRow, error: sErr } = await supabase
    .from("suministros_xhunco")
    .select("id, nombre, stock")
    .eq("id", suministro_id)
    .limit(1);

  if (sErr) {
    return NextResponse.json({ error: sErr.message }, { status: 400 });
  }

  const suministro = sRow?.[0] || null;
  const stock = Number(suministro?.stock ?? 0);

  if (Number.isFinite(stock) && stock > 0) {
    return NextResponse.json(
      { error: "Este suministro ya tiene stock. Agrega al carrito." },
      { status: 409 }
    );
  }

  let clienteNombre = "Cliente";
  let clienteEmail = "";
  let businessName = "—";

  try {
    const [{ data: profile }, { data: client }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, first_name, middle_name, last_name_paterno, last_name_materno")
        .eq("id", userId)
        .single(),
      supabaseAdmin
        .from("clients")
        .select("user_id, business_name")
        .eq("user_id", userId)
        .single(),
    ]);

    clienteNombre = safeName(profile);
    clienteEmail = profile?.email || "";
    businessName = (client?.business_name || "").trim() || "—";
  } catch (e) {
    console.error("Error leyendo perfil/cliente para solicitud:", e);
  }

  const { data: existing, error: exErr } = await supabase
    .from("suministros_solicitudes")
    .select("id, qty, status")
    .eq("client_id", userId)
    .eq("suministro_id", suministro_id)
    .eq("status", "pendiente")
    .limit(1);

  if (exErr) {
    return NextResponse.json({ error: exErr.message }, { status: 400 });
  }

  if (existing?.[0]) {
    const { data: upd, error: updErr } = await supabase
      .from("suministros_solicitudes")
      .update({ qty })
      .eq("id", existing[0].id)
      .select("id, suministro_id, qty, status, created_at")
      .single();

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    return NextResponse.json({ item: upd, updated: true });
  }

  const { data, error } = await supabase
    .from("suministros_solicitudes")
    .insert({
      client_id: userId,
      suministro_id,
      qty,
      status: "pendiente",
    })
    .select("id, suministro_id, qty, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    const { data: profiles, error: adminsErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, active");

    if (adminsErr) {
      console.error("No se pudieron leer perfiles para notificar solicitud:", adminsErr);
    } else {
      const admins = (profiles || []).filter((u) => {
        if (!u?.id) return false;
        if (u?.active === false) return false;
        return isAdminLikeRole(u.role);
      });

      for (const u of admins) {
        const roleNorm = normalizeRole(u.role);
        const isSuper = roleNorm === "super_admin" || roleNorm === "superadmin";

        const notifPayload = {
          recipient_user_id: u.id,
          recipient_role: "admin",
          type: "supply_request_created",
          title: "Nueva solicitud de suministro",
          body: `${clienteNombre} solicitó ${qty} unidad(es) de ${suministro?.nombre || "un suministro"}.`,
          url: isSuper
            ? "/portal/super-admin/suministros/solicitudes"
            : "/portal/admin/suministros/solicitudes",
          is_read: false,
        };

        const { error: nErr } = await supabaseAdmin
          .from("notifications")
          .insert(notifPayload);

        if (nErr) {
          console.error("Error insertando notificación de solicitud:", {
            adminId: u.id,
            adminEmail: u.email,
            adminRole: u.role,
            payload: notifPayload,
            error: nErr,
          });
        }
      }

      const adminRecipients = admins.filter((u) => u?.email);

      for (const admin of adminRecipients) {
        const roleNorm = normalizeRole(admin.role);
        const isSuper = roleNorm === "super_admin" || roleNorm === "superadmin";

        const panelUrl = isSuper
          ? `${origin}/portal/super-admin/suministros/solicitudes`
          : `${origin}/portal/admin/suministros/solicitudes`;

        try {
          const email = adminSupplyRequestCreatedEmail({
            clienteNombre,
            businessName,
            suministroNombre: suministro?.nombre || "Suministro",
            qty,
            requestId: data.id,
            panelUrl,
            isSuperAdmin: isSuper,
          });

          await sendEmail({
            to: [admin.email],
            subject: email.subject,
            html: email.html,
            text: email.text,
          });
        } catch (mailErr) {
          console.error(`Error enviando correo de solicitud a ${admin.email}:`, mailErr);
        }
      }
    }
  } catch (e) {
    console.error("Error notificando admins por solicitud:", e);
  }

  if (clienteEmail) {
    try {
      const requestsUrl = `${origin}/portal/cliente/suministros/solicitudes`;
      const email = clientSupplyRequestReceivedEmail({
        clienteNombre,
        suministroNombre: suministro?.nombre || "Suministro",
        qty,
        requestId: data.id,
        requestsUrl,
      });

      await sendEmail({
        to: [clienteEmail],
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } catch (mailErr) {
      console.error("Error enviando correo al cliente por solicitud:", mailErr);
    }
  }

  return NextResponse.json({ item: data, created: true });
}