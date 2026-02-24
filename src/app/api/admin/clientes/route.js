import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  const supabase = await supabaseServer();

  // ✅ Auth
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // ✅ Role check (admin/superadmin + active)
  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 400 });
  }

  const prof = profRows?.[0];
  if (!prof?.active) {
    return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
  }

  // ✅ SOLO AGREGADO: soportar super_admin también
  if (!["admin", "superadmin", "super_admin"].includes(prof.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // ✅ Params
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(10, Number(searchParams.get("pageSize") || 25)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // ✅ Query (alineado a tu DB real)
  // ✅ SOLO AGREGADO: "price_tier" en el select (para precios)
  let query = supabase
    .from("clients")
    .select(
      [
        "id",
        "user_id", // ✅ ya lo tenías
        "business_name",
        "price_tier", // ✅ AGREGADO
        "owner_name",
        "owner_first_name",
        "owner_middle_name",
        "owner_last_name_paterno",
        "owner_last_name_materno",
        "phone",
        "email",
        "created_at",
      ].join(","),
      { count: "exact" }
    )
    .order("business_name", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(
      [
        `business_name.ilike.%${q}%`,
        `owner_name.ilike.%${q}%`,
        `owner_first_name.ilike.%${q}%`,
        `owner_middle_name.ilike.%${q}%`,
        `owner_last_name_paterno.ilike.%${q}%`,
        `owner_last_name_materno.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `email.ilike.%${q}%`,
      ].join(",")
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // ✅ Normalización: si owner_name viene vacío, lo armamos con los campos por partes
  // ✅ Agregamos un "user_id" de salida consistente (fallback: id)
  // ✅ Agregamos label para UI
  const normalized = (data || []).map((c) => {
    const builtOwner = [
      c.owner_first_name,
      c.owner_middle_name,
      c.owner_last_name_paterno,
      c.owner_last_name_materno,
    ]
      .map((x) => (x || "").trim())
      .filter(Boolean)
      .join(" ");

    const owner = (c.owner_name || "").trim() || builtOwner || null;
    const label = (c.business_name || "").trim() || owner || "—";

    return {
      ...c,
      owner_name: owner,
      user_id: c.user_id || c.id, // ✅ ya lo tenías
      label, // ✅ ya lo tenías
    };
  });

  return NextResponse.json({
    data: normalized,
    page,
    pageSize,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  });
}