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

export async function GET() {
  try {
    const supabase = await supabaseServer();
    const auth = await requireAdmin(supabase);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Error al obtener promociones" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = await supabaseServer();
    const auth = await requireAdmin(supabase);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    const payload = {
      title: String(body.title || "").trim(),
      description: body.description ? String(body.description).trim() : null,
      image_url: body.image_url ? String(body.image_url).trim() : null,
      redirect_url: String(body.redirect_url || "").trim(),
      badge: body.badge ? String(body.badge).trim() : null,
      active: !!body.active,
      sort_order: Number.isFinite(Number(body.sort_order))
        ? Number(body.sort_order)
        : 0,
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      created_by: auth.user.id,
      updated_by: auth.user.id,
    };

    if (!payload.title) {
      return NextResponse.json(
        { error: "El título es obligatorio" },
        { status: 400 }
      );
    }

    if (!payload.image_url) {
      return NextResponse.json(
        { error: "La imagen es obligatoria" },
        { status: 400 }
      );
    }

    if (!payload.redirect_url) {
      return NextResponse.json(
        { error: "La URL de redirección es obligatoria" },
        { status: 400 }
      );
    }

    if (payload.active) {
      const { error: deactivateError } = await supabase
        .from("promotions")
        .update({ active: false, updated_by: auth.user.id })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deactivateError) {
        return NextResponse.json(
          { error: deactivateError.message },
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabase
      .from("promotions")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Error al crear promoción" },
      { status: 500 }
    );
  }
}