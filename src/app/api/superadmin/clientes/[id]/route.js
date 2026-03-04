import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normRole(v) {
  return String(v || "").toLowerCase().trim();
}

function getId(req, params) {
  const p = params?.id;
  if (p) return p;

  // Fallback ultra robusto
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

async function requireSuperAdmin() {
  const supabase = await supabaseServer();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) {
    return {
      ok: false,
      res: NextResponse.json({ error: profErr.message }, { status: 400 }),
    };
  }

  const prof = profRows?.[0];
  if (!prof?.active) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Usuario inactivo" }, { status: 403 }),
    };
  }

  const role = normRole(prof.role);
  if (!["superadmin", "super_admin"].includes(role)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
    };
  }

  return { ok: true };
}

function cleanClientPatch(body) {
  const allowed = [
    "business_name",
    "price_tier",
    "owner_name",
    "owner_first_name",
    "owner_middle_name",
    "owner_last_name_paterno",
    "owner_last_name_materno",
    "phone",
    "email",
    "street",
    "ext_number",
    "int_number",
    "neighborhood",
    "municipality",
    "state",
    "postal_code",
    "address",
    "logo_url",
    "user_id",
  ];

  const out = {};
  for (const k of allowed) {
    if (k in (body || {})) out[k] = body[k];
  }

  // normalizaciones
  if (typeof out.email === "string") out.email = out.email.trim().toLowerCase();
  if (typeof out.phone === "string") out.phone = out.phone.trim();

  // convierte strings vacíos en null (evita basura)
  for (const k of Object.keys(out)) {
    if (out[k] === "") out[k] = null;
  }

  return out;
}

export async function PATCH(req, { params }) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.res;

  const id = getId(req, params);
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const patch = cleanClientPatch(body);

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .update(patch)
    .eq("id", id)
    .select("*")
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ row: data?.[0] || null });
}

export async function DELETE(req, { params }) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.res;

  const id = getId(req, params);
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}