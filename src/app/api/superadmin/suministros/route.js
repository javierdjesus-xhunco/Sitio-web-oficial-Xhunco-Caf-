import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const ADMIN_ROLES = new Set(["admin", "superadmin", "super_admin", "super-admin"]);

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

  if (profErr) {
    return { ok: false, res: NextResponse.json({ error: profErr.message }, { status: 400 }) };
  }

  const prof = profRows?.[0];
  if (!prof?.active) {
    return { ok: false, res: NextResponse.json({ error: "Usuario inactivo" }, { status: 403 }) };
  }
  if (!ADMIN_ROLES.has(String(prof.role || "").toLowerCase())) {
    return { ok: false, res: NextResponse.json({ error: "Sin permisos" }, { status: 403 }) };
  }

  return { ok: true, user: auth.user, prof };
}

function toInt(v, d) {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : d;
}

export async function GET(req) {
  const supabase = await supabaseServer();
  const gate = await assertAdmin(supabase);
  if (!gate.ok) return gate.res;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(Math.max(toInt(searchParams.get("limit"), 50), 1), 200);
  const offset = Math.max(toInt(searchParams.get("offset"), 0), 0);

  let query = supabase
    .from("suministros_xhunco")
    .select(
      "id, imagen, sku, nombre, categoria, marca, presentacion, precio_original, precio_web, precio_publico, precio_medio, precio_mayoreo, unidad, stock, activo",
      { count: "exact" }
    )
    .order("nombre", { ascending: true })
    .range(offset, offset + limit - 1);

  if (q) {
    // Busca por nombre o sku
    query = query.or(`nombre.ilike.%${q}%,sku.ilike.%${q}%`);
  }

  const { data: rows, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ rows: rows || [], total: count ?? 0, limit, offset });
}

export async function POST(req) {
  const supabase = await supabaseServer();
  const gate = await assertAdmin(supabase);
  if (!gate.ok) return gate.res;

  const body = await req.json().catch(() => ({}));

  // Campos permitidos según tu tabla
  const payload = {
    imagen: body.imagen ?? null,
    sku: body.sku ?? null,
    nombre: body.nombre ?? null,
    categoria: body.categoria ?? null,
    marca: body.marca ?? null,
    presentacion: body.presentacion ?? null,
    precio_original: body.precio_original ?? null,
    precio_web: body.precio_web ?? null,
    precio_publico: body.precio_publico ?? null,
    precio_medio: body.precio_medio ?? null,
    precio_mayoreo: body.precio_mayoreo ?? null,
    unidad: body.unidad ?? null,
    stock: body.stock ?? null,
    activo: typeof body.activo === "boolean" ? body.activo : true,
  };

  // Validación mínima (para evitar filas “vacías”)
  if (!payload.nombre) {
    return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("suministros_xhunco")
    .insert(payload)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id });
}