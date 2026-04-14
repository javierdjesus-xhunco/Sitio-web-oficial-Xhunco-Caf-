import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_STATUS = [
  "nuevo",
  "contactado",
  "seguimiento",
  "cerrado",
  "descartado",
];

async function requirePortalRole(allowedRoles = []) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "No autorizado", status: 401 };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "Perfil no encontrado", status: 403 };
  }

  if (profile.active === false) {
    return { error: "Usuario inactivo", status: 403 };
  }

  if (!allowedRoles.includes(profile.role)) {
    return { error: "Sin permisos", status: 403 };
  }

  return { user, profile };
}

function clean(v) {
  return String(v ?? "").trim();
}

export async function PATCH(req, { params }) {
  const auth = await requirePortalRole(["super_admin"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();
  const status = clean(body?.status);
  const notes = clean(body?.notes);

  if (!ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: "Estatus inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("b2b_leads")
    .update({
      status,
      notes: notes || null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("PATCH super-admin b2b lead error:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el lead." },
      { status: 500 }
    );
  }

  return NextResponse.json({ item: data });
}