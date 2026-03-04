import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Sanitiza la búsqueda para PostgREST OR/ILIKE (sin prometer ESCAPE real)
function safeQ(raw) {
  return String(raw || "")
    .slice(0, 80) // ✅ evita queries enormes
    .replaceAll("\\", " ")
    .replaceAll("%", " ")
    .replaceAll("_", " ")
    .replaceAll(",", " ")
    .replaceAll('"', " ")
    .replace(/[^\p{L}\p{N}\s@.\-+]/gu, " ") // ✅ deja letras/números y algunos símbolos útiles
    .trim();
}

function normRole(v) {
  return String(v || "").toLowerCase().trim();
}

export async function GET(req) {
  const supabase = await supabaseServer();

  // ✅ Auth
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
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

  const role = normRole(prof.role);
  if (!["admin", "superadmin", "super_admin"].includes(role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // ✅ Params
  const { searchParams } = new URL(req.url);
  const q = safeQ(searchParams.get("q") || "");

  const page = clampInt(searchParams.get("page"), 1, 100000, 1);

  // ✅ Mantengo tu límite alto por si tu UI lo usa
  const pageSize = clampInt(searchParams.get("pageSize"), 10, 500, 25);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // ✅ Query (alineado a tu DB real)
  let query = supabase
    .from("clients")
    .select(
      [
        "id",
        "user_id",
        "business_name",
        "price_tier",
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
    const like = `%${q}%`;

    query = query.or(
      [
        `business_name.ilike.${like}`,
        `owner_name.ilike.${like}`,
        `owner_first_name.ilike.${like}`,
        `owner_middle_name.ilike.${like}`,
        `owner_last_name_paterno.ilike.${like}`,
        `owner_last_name_materno.ilike.${like}`,
        `phone.ilike.${like}`,
        `email.ilike.${like}`,
      ].join(",")
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // ✅ Normalización: owner_name fallback + label
  // ❗IMPORTANTE: NO sobreescribimos user_id con c.id (era un bug/riesgo a futuro)
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
      client_id: c.id, // ✅ explícito (útil para UI/joins)
      owner_name: owner,
      label,
      effective_user_id: c.user_id || null, // ✅ si existe relación con auth.users
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