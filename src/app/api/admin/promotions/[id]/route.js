import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

async function requireAdmin(supabase) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "No autenticado", status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    !["admin", "super_admin"].includes(profile.role) ||
    profile.active === false
  ) {
    return { error: "Sin permisos", status: 403 };
  }

  return { user, profile };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function getRouteId(request, context) {
  const byParams = context?.params?.id;
  if (byParams) return byParams;

  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}

export async function PATCH(request, context) {
  try {
    const supabase = await supabaseServer();
    const auth = await requireAdmin(supabase);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const id = getRouteId(request, context);

    if (!id || !isUuid(id)) {
      return NextResponse.json(
        { error: "ID de promoción inválido o ausente" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (body.active === true) {
      const { error: deactivateError } = await supabase
        .from("promotions")
        .update({ active: false, updated_by: auth.user.id })
        .neq("id", id);

      if (deactivateError) {
        return NextResponse.json(
          { error: deactivateError.message },
          { status: 500 }
        );
      }
    }

    const payload = {
      ...(body.title !== undefined
        ? { title: String(body.title || "").trim() }
        : {}),
      ...(body.description !== undefined
        ? {
            description: body.description
              ? String(body.description).trim()
              : null,
          }
        : {}),
      ...(body.image_url !== undefined
        ? { image_url: body.image_url ? String(body.image_url).trim() : null }
        : {}),
      ...(body.redirect_url !== undefined
        ? { redirect_url: String(body.redirect_url || "").trim() }
        : {}),
      ...(body.badge !== undefined
        ? { badge: body.badge ? String(body.badge).trim() : null }
        : {}),
      ...(body.active !== undefined ? { active: !!body.active } : {}),
      ...(body.sort_order !== undefined
        ? {
            sort_order: Number.isFinite(Number(body.sort_order))
              ? Number(body.sort_order)
              : 0,
          }
        : {}),
      ...(body.starts_at !== undefined
        ? { starts_at: body.starts_at || null }
        : {}),
      ...(body.ends_at !== undefined
        ? { ends_at: body.ends_at || null }
        : {}),
      updated_by: auth.user.id,
    };

    const { data, error } = await supabase
      .from("promotions")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Error al actualizar promoción" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const supabase = await supabaseServer();
    const auth = await requireAdmin(supabase);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const id = getRouteId(request, context);

    if (!id || !isUuid(id)) {
      return NextResponse.json(
        { error: "ID de promoción inválido o ausente" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("promotions").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Error al eliminar promoción" },
      { status: 500 }
    );
  }
}