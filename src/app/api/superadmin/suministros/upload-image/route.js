import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const ADMIN_ROLES = new Set(["admin", "superadmin", "super_admin", "super-admin"]);
const BUCKET = "suministros";

async function assertAdmin(supabase) {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return { ok: false, res: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }

  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return { ok: false, res: NextResponse.json({ error: profErr.message }, { status: 400 }) };

  const prof = profRows?.[0];
  if (!prof?.active) return { ok: false, res: NextResponse.json({ error: "Usuario inactivo" }, { status: 403 }) };
  if (!ADMIN_ROLES.has(String(prof.role || "").toLowerCase())) {
    return { ok: false, res: NextResponse.json({ error: "Sin permisos" }, { status: 403 }) };
  }

  return { ok: true, user: auth.user };
}

function safeExt(mime) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] || null;
}

export async function POST(req) {
  const supabase = await supabaseServer();
  const gate = await assertAdmin(supabase);
  if (!gate.ok) return gate.res;

  const form = await req.formData();
  const file = form.get("file");

  if (!file) return NextResponse.json({ error: "Falta archivo (file)" }, { status: 400 });

  // En Next, file es tipo File
  const mime = file.type || "";
  const ext = safeExt(mime);
  if (!ext) {
    return NextResponse.json({ error: "Formato no permitido. Usa jpg/png/webp/gif." }, { status: 400 });
  }

  // Límite (ej: 3MB)
  const MAX = 3 * 1024 * 1024;
  if (file.size > MAX) {
    return NextResponse.json({ error: "Archivo muy grande (máx 3MB)." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const path = `suministros/${filename}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: mime,
    upsert: false,
  });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  // Bucket público: URL pública
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub?.publicUrl;

  if (!publicUrl) {
    return NextResponse.json({ error: "No se pudo obtener publicUrl" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, url: publicUrl, path });
}