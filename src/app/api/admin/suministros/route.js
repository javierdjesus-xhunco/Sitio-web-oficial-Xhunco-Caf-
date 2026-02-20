import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/** =========================
 * Auth / Gate
 * ========================= */
async function assertAdmin(supabase) {
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

  if (!["admin", "superadmin"].includes(prof.role)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
    };
  }

  return { ok: true };
}

/** =========================
 * Utils
 * ========================= */
function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function safeTrim(v) {
  return String(v ?? "").trim();
}

/**
 * Nota: en PostgREST (Supabase) el "escape" no siempre se respeta como en SQL puro,
 * pero esto evita caracteres raros y reduce sorpresas.
 */
function escapeForILike(input) {
  return input.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

/** =========================
 * GET (listado paginado)
 * ========================= */
export async function GET(req) {
  const supabase = await supabaseServer();
  const gate = await assertAdmin(supabase);
  if (!gate.ok) return gate.res;

  const { searchParams } = new URL(req.url);

  const qRaw = safeTrim(searchParams.get("q"));
  const q = qRaw ? escapeForILike(qRaw) : "";

  const categoria = safeTrim(searchParams.get("categoria"));
  const lowStock = searchParams.get("lowStock") === "1";
  const lowStockThreshold = Math.max(
    0,
    Number(searchParams.get("lowStockThreshold") || 5)
  );

  const page = clampInt(searchParams.get("page"), 1, 1_000_000, 1);
  const pageSize = clampInt(searchParams.get("pageSize"), 10, 50, 25);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from("suministros_xhunco")
      .select(
        "id, sku, nombre, categoria, marca, presentacion, unidad, stock, precio_original, precio_web, precio_publico, precio_medio, precio_mayoreo, activo",
        { count: "exact" }
      )
      .eq("activo", true)
      .order("categoria", { ascending: true })
      .order("nombre", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);

    // 🔎 Buscador global: SKU / nombre / marca / categoría
    if (q) {
      const like = `%${q}%`;
      query = query.or(
        `sku.ilike.${like},nombre.ilike.${like},marca.ilike.${like},categoria.ilike.${like}`
      );
    }

    // filtro dedicado por categoría
    if (categoria) query = query.eq("categoria", categoria);

    // bajo stock
    if (lowStock) query = query.lte("stock", lowStockThreshold);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data: data || [],
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error al cargar suministros" },
      { status: 500 }
    );
  }
}

/** =========================
 * POST (crear producto)
 * ========================= */
export async function POST(req) {
  const supabase = await supabaseServer();
  const gate = await assertAdmin(supabase);
  if (!gate.ok) return gate.res;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body inválido (JSON requerido)" },
      { status: 400 }
    );
  }

  const sku = safeTrim(body?.sku);
  const nombre = safeTrim(body?.nombre);
  const categoria = safeTrim(body?.categoria);
  const unidad = safeTrim(body?.unidad);

  if (!sku) return NextResponse.json({ error: "sku es requerido" }, { status: 400 });
  if (!nombre) return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
  if (!categoria) return NextResponse.json({ error: "categoria es requerida" }, { status: 400 });
  if (!unidad) return NextResponse.json({ error: "unidad es requerida" }, { status: 400 });

  const stock = toIntOrNull(body?.stock);
  if (stock === null || stock < 0) {
    return NextResponse.json({ error: "stock debe ser un entero >= 0" }, { status: 400 });
  }

  const payload = {
    sku,
    nombre,
    categoria,
    unidad,
    marca: body?.marca ? safeTrim(body.marca) : null,
    presentacion: body?.presentacion ? safeTrim(body.presentacion) : null,
    stock,
    activo: body?.activo === false ? false : true,
    precio_original: toIntOrNull(body?.precio_original),
    precio_web: toNumberOrNull(body?.precio_web),
    precio_publico: toNumberOrNull(body?.precio_publico),
    precio_medio: toNumberOrNull(body?.precio_medio),
    precio_mayoreo: toNumberOrNull(body?.precio_mayoreo),
    imagen: body?.imagen ? safeTrim(body.imagen) : null,
  };

  try {
    // defensa contra SKU duplicado
    const { data: exists, error: exErr } = await supabase
      .from("suministros_xhunco")
      .select("id")
      .eq("sku", sku)
      .limit(1);

    if (exErr) return NextResponse.json({ error: exErr.message }, { status: 400 });
    if (exists?.length) {
      return NextResponse.json({ error: "Ya existe un producto con ese SKU" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("suministros_xhunco")
      .insert(payload)
      .select(
        "id, sku, nombre, categoria, marca, presentacion, unidad, stock, precio_original, precio_web, precio_publico, precio_medio, precio_mayoreo, activo"
      )
      .limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data: data?.[0] || null }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "No se pudo crear el producto" },
      { status: 500 }
    );
  }
}