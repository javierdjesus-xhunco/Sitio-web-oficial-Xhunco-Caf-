import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function safeQ(raw) {
  return String(raw || "")
    .slice(0, 80)
    .replaceAll("\\", " ")
    .replaceAll("%", " ")
    .replaceAll("_", " ")
    .replaceAll(",", " ")
    .replaceAll('"', " ")
    .replace(/[^\p{L}\p{N}\s@.\-+]/gu, " ")
    .trim();
}

function normRole(v) {
  return String(v || "").toLowerCase().trim();
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

  return { ok: true, user: auth.user };
}

function cleanClientPayload(body) {
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
    "user_id", // permitido si quieres setearlo manualmente
  ];

  const out = {};
  for (const k of allowed) {
    if (k in body) out[k] = body[k];
  }

  // Normalizaciones simples
  if (typeof out.email === "string") out.email = out.email.trim().toLowerCase();
  if (typeof out.phone === "string") out.phone = out.phone.trim();

  return out;
}

export async function GET(req) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.res;

  const { searchParams } = new URL(req.url);
  const q = safeQ(searchParams.get("q") || "");
  const page = clampInt(searchParams.get("page"), 1, 100000, 1);
  const pageSize = clampInt(searchParams.get("pageSize"), 10, 500, 50);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
  .from("clients")
  .select(
    `
    id,
    user_id,
    business_name,
    price_tier,
    owner_name,
    owner_first_name,
    owner_middle_name,
    owner_last_name_paterno,
    owner_last_name_materno,
    phone,
    email,
    street,
    ext_number,
    int_number,
    neighborhood,
    municipality,
    state,
    postal_code,
    address,
    logo_url,
    created_at,

    distributor_clients (
      distributor_id,
      profiles (
        first_name,
        last_name_paterno
      )
    )
    `,
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
        `municipality.ilike.${like}`,
        `state.ilike.${like}`,
      ].join(",")
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Normaliza owner_name fallback + label (sin pisar user_id)
  const rows = (data || []).map((c) => {
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
      label,
      client_id: c.id,
      effective_user_id: c.user_id || null,
    };
  });

  const total = count || 0;

  return NextResponse.json({
    rows,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  });
}

export async function POST(req) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.res;

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const create_auth_user = !!body.create_auth_user;
  const password = String(body.password || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  const payload = cleanClientPayload(body);

  // (Opcional) crear/invitar usuario y setear payload.user_id
  if (create_auth_user) {
    if (!email) {
      return NextResponse.json(
        { error: "Email requerido para crear/invitar usuario" },
        { status: 400 }
      );
    }

    // si no viene user_id, lo generamos desde Auth
    if (!payload.user_id) {
      if (password) {
        const { data: created, error: cErr } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

        if (cErr) return NextResponse.json({ error: cErr.message }, { status: 400 });
        payload.user_id = created?.user?.id || null;
      } else {
        const { data: invited, error: iErr } =
          await supabaseAdmin.auth.admin.inviteUserByEmail(email);

        if (iErr) return NextResponse.json({ error: iErr.message }, { status: 400 });
        payload.user_id = invited?.user?.id || null;
      }
    }
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert(payload)
    .select("*")
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ row: data?.[0] || null });
}