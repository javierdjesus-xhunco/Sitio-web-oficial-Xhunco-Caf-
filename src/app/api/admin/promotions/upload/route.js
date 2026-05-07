import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function POST(request) {
  try {
    const supabase = await supabaseServer();
    const auth = await requireAdmin(supabase);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
    }

    const allowed = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
      { error: "Solo se permiten imágenes JPG, PNG, WEBP o AVIF" },
        { status: 400 }
      );
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "La imagen no debe superar 5 MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
   const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext)
  ? ext
  : "jpg";

    const fileName = `promo-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${safeExt}`;

    const path = `banners/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("promotions")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("promotions")
      .getPublicUrl(path);

    return NextResponse.json({
      ok: true,
      path,
      image_url: publicUrlData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Error al subir imagen" },
      { status: 500 }
    );
  }
}