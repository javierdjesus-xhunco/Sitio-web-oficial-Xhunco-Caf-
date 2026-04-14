import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function GET(req) {
  const auth = await requirePortalRole(["admin", "super_admin"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const q = String(searchParams.get("q") || "").trim();
  const status = String(searchParams.get("status") || "").trim();

  let query = supabaseAdmin
    .from("b2b_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (q) {
    query = query.or(
      [
        `company_name.ilike.%${q}%`,
        `contact_name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `city.ilike.%${q}%`,
        `business_type.ilike.%${q}%`,
      ].join(",")
    );
  }

  const { data, error } = await query.limit(200);

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar los leads." },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data || [] });
}