import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

async function assertAdminOrSuper(supabase) {
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

  return { ok: true, role: prof.role };
}

function toInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

// ✅ Extrae el id de forma robusta (params o pathname)
function extractId(req, params) {
  const byParams = params?.id;
  if (byParams) return byParams;

  const pathname = new URL(req.url).pathname; // /api/admin/suministros/<id>
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];

  if (!last || last === "suministros") return null;
  return last;
}

/** GET: detalle (útil para debug) */
export async function GET(req, ctx) {
  const supabase = await supabaseServer();
  const gate = await assertAdminOrSuper(supabase);
  if (!gate.ok) return gate.res;

  const id = extractId(req, ctx?.params);
  if (!id) {
    return NextResponse.json(
      { error: "Falta id", debug: { url: req.url, params: ctx?.params ?? null } },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("suministros_xhunco")
    .select("id, sku, nombre, categoria, marca, stock, activo")
    .eq("id", id)
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data: data?.[0] || null });
}

/** PATCH: entrada (delta > 0) que suma al stock (ATÓMICO) */
export async function PATCH(req, ctx) {
  const supabase = await supabaseServer();
  const gate = await assertAdminOrSuper(supabase);
  if (!gate.ok) return gate.res;

  const id = extractId(req, ctx?.params);
  if (!id) {
    return NextResponse.json(
      { error: "Falta id", debug: { url: req.url, params: ctx?.params ?? null } },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido (JSON requerido)" }, { status: 400 });
  }

  const delta = toInt(body?.delta);
  if (delta === null) return NextResponse.json({ error: "delta inválido" }, { status: 400 });
  if (delta <= 0)
    return NextResponse.json({ error: "La entrada debe ser un entero > 0" }, { status: 400 });

  // ✅ Update atómico por RPC (evita race conditions)
  const { data, error } = await supabase.rpc("suministros_add_stock", {
    p_id: id,
    p_delta: delta,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Si no devolvió filas, es que no existe ese ID (o no matcheó where)
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    return NextResponse.json({ error: "No se encontró el suministro" }, { status: 404 });
  }

  return NextResponse.json({ data: row });
}