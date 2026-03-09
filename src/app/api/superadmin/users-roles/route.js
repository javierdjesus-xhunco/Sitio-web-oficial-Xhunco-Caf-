import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_ROLES = new Set(["super_admin", "admin", "cliente"]);

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function safeQ(raw) {
  return String(raw || "").trim().toLowerCase().slice(0, 100);
}

function safeRole(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value || value === "all") return "all";
  return ALLOWED_ROLES.has(value) ? value : "all";
}

function safeStatus(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value || value === "all") return "all";
  if (value === "active" || value === "inactive") return value;
  return "all";
}

function buildFullName(profile) {
  return [
    profile?.first_name,
    profile?.middle_name,
    profile?.last_name_paterno,
    profile?.last_name_materno,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function requireSuperAdmin() {
  const supabase = await supabaseServer();

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return { error: "No autenticado", status: 401 };
  }

  const { data: me, error: meErr } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (meErr) {
    return { error: "No se pudo validar el usuario actual.", status: 500 };
  }

  if (!me || me.role !== "super_admin") {
    return { error: "No autorizado.", status: 403 };
  }

  return { user: authData.user };
}

function normalizeProfile(profile) {
  return {
    id: profile.id,
    email: profile.email || "",
    full_name: buildFullName(profile) || "Sin nombre",
    role: profile.role || "cliente",
    created_at: profile.created_at || null,
    phone: profile.phone || "",
    active: typeof profile.active === "boolean" ? profile.active : true,
    first_name: profile.first_name || "",
    middle_name: profile.middle_name || "",
    last_name_paterno: profile.last_name_paterno || "",
    last_name_materno: profile.last_name_materno || "",
  };
}

async function getStats() {
  const [
    totalRes,
    superAdminsRes,
    adminsRes,
    clientesRes,
    activeRes,
    inactiveRes,
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin"),
    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin"),
    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "cliente"),
    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("active", false),
  ]);

  const possibleError =
    totalRes.error ||
    superAdminsRes.error ||
    adminsRes.error ||
    clientesRes.error ||
    activeRes.error ||
    inactiveRes.error;

  if (possibleError) {
    throw new Error(possibleError.message || "No se pudieron obtener las estadísticas.");
  }

  return {
    total: totalRes.count || 0,
    superAdmins: superAdminsRes.count || 0,
    admins: adminsRes.count || 0,
    clientes: clientesRes.count || 0,
    active: activeRes.count || 0,
    inactive: inactiveRes.count || 0,
  };
}

export async function GET(req) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const page = clampInt(searchParams.get("page"), 1, 999999, 1);
    const pageSize = clampInt(searchParams.get("pageSize"), 5, 50, 12);
    const q = safeQ(searchParams.get("q"));
    const role = safeRole(searchParams.get("role"));
    const status = safeStatus(searchParams.get("status"));

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("profiles")
      .select(
        `
          id,
          email,
          role,
          created_at,
          first_name,
          middle_name,
          last_name_paterno,
          last_name_materno,
          phone,
          active
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (role !== "all") {
      query = query.eq("role", role);
    }

    if (status === "active") {
      query = query.eq("active", true);
    } else if (status === "inactive") {
      query = query.eq("active", false);
    }

    if (q) {
      query = query.or(
        [
          `email.ilike.%${q}%`,
          `phone.ilike.%${q}%`,
          `first_name.ilike.%${q}%`,
          `middle_name.ilike.%${q}%`,
          `last_name_paterno.ilike.%${q}%`,
          `last_name_materno.ilike.%${q}%`,
          `role.ilike.%${q}%`,
        ].join(",")
      );
    }

    const [{ data, error, count }, stats] = await Promise.all([query, getStats()]);

    if (error) {
      return NextResponse.json(
        { error: error.message || "No se pudieron obtener los usuarios." },
        { status: 500 }
      );
    }

    const total = Number(count || 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const users = (data || []).map(normalizeProfile);

    return NextResponse.json({
      users,
      stats,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        filters: {
          q,
          role,
          status,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const userId = String(body?.userId || "").trim();
    const role = String(body?.role || "").trim();

    if (!userId) {
      return NextResponse.json(
        { error: "Falta el ID del usuario." },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        { error: "Rol no permitido." },
        { status: 400 }
      );
    }

    if (auth.user.id === userId && role !== "super_admin") {
      return NextResponse.json(
        { error: "No puedes bajarte tu propio rol." },
        { status: 400 }
      );
    }

    const { data: target, error: targetErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (targetErr) {
      return NextResponse.json(
        { error: targetErr.message || "No se pudo validar el usuario objetivo." },
        { status: 500 }
      );
    }

    if (!target) {
      return NextResponse.json(
        { error: "El usuario no existe en profiles." },
        { status: 404 }
      );
    }

    if (target.role === "super_admin" && role !== "super_admin") {
      const { count, error: countErr } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin");

      if (countErr) {
        return NextResponse.json(
          { error: countErr.message || "No se pudo validar el número de super admins." },
          { status: 500 }
        );
      }

      if ((count || 0) <= 1) {
        return NextResponse.json(
          { error: "No puedes quitar el rol al último super admin del sistema." },
          { status: 400 }
        );
      }
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      return NextResponse.json(
        { error: error.message || "No se pudo actualizar el rol." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Rol actualizado correctamente.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}