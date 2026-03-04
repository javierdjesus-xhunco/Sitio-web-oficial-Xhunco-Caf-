import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "client-logos";

export async function POST(req) {
  // ✅ auth normal para validar rol
  const supabase = await supabaseServer();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // ✅ verificar role en profiles
  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });

  if (!["superadmin", "super_admin"].includes(String(prof.role || "").toLowerCase())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // ✅ leer FormData
  const form = await req.formData();
  const clientId = String(form.get("clientId") || "").trim();
  const file = form.get("file");

  if (!clientId) return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  if (!file || typeof file === "string") return NextResponse.json({ error: "file requerido" }, { status: 400 });

  const mime = String(file.type || "").toLowerCase();
  const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (!allowed.has(mime)) {
    return NextResponse.json({ error: "Formato inválido. Usa PNG/JPG/WebP." }, { status: 400 });
  }

  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `clients/${clientId}/logo.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // ✅ upload con service_role
  const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
    upsert: true,
    contentType: mime,
    cacheControl: "3600",
  });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : null;

  return NextResponse.json({ path, publicUrl });
}