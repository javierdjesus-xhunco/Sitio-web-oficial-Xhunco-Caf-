import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const ADMIN_ROLES = new Set([
  "admin",
  "superadmin",
  "super_admin",
  "super-admin",
]);

async function assertAdmin(supabase) {
  const { data: auth, error: authErr } = await supabase.auth.getUser();

  if (authErr || !auth?.user) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      ),
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
      res: NextResponse.json(
        { error: profErr.message },
        { status: 400 }
      ),
    };
  }

  const prof = profRows?.[0];

  if (!prof?.active) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "Usuario inactivo" },
        { status: 403 }
      ),
    };
  }

  if (!ADMIN_ROLES.has(String(prof.role || "").toLowerCase())) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "Sin permisos" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    user: auth.user,
    prof,
  };
}

function cleanText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseIdealPara(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function pickAllowed(body) {
  const allowed = [
    "imagen",
    "sku",
    "nombre",
    "categoria",
    "marca",
    "presentacion",
    "precio_original",
    "precio_web",
    "precio_publico",
    "precio_medio",
    "precio_mayoreo",
    "unidad",
    "stock",
    "activo",

    // Campos personalizados para la sección de suministros
    "descripcion_web",
    "uso_sugerido",
    "tip_preparacion",
    "ideal_para",
  ];

  const out = {};

  for (const k of allowed) {
    if (!(k in body)) continue;

    if (
      k === "imagen" ||
      k === "sku" ||
      k === "nombre" ||
      k === "categoria" ||
      k === "marca" ||
      k === "presentacion" ||
      k === "unidad" ||
      k === "descripcion_web" ||
      k === "uso_sugerido" ||
      k === "tip_preparacion"
    ) {
      out[k] = cleanText(body[k]);
      continue;
    }

    if (k === "ideal_para") {
      out[k] = parseIdealPara(body[k]);
      continue;
    }

    out[k] = body[k];
  }

  return out;
}

function getIdFromReq(req, params) {
  const byParams = params?.id;

  if (
    byParams &&
    byParams !== "undefined" &&
    byParams !== "null"
  ) {
    return byParams;
  }

  const pathname = new URL(req.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];

  if (
    !last ||
    last === "suministros" ||
    last === "undefined" ||
    last === "null"
  ) {
    return null;
  }

  return last;
}

export async function PATCH(req, { params }) {
  const supabase = await supabaseServer();
  const gate = await assertAdmin(supabase);

  if (!gate.ok) return gate.res;

  const id = getIdFromReq(req, params);

  if (!id) {
    return NextResponse.json(
      { error: "Falta id" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const patch = pickAllowed(body);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No hay campos para actualizar" },
      { status: 400 }
    );
  }

  const { data: updated, error: updErr } = await supabase
    .from("suministros_xhunco")
    .update(patch)
    .eq("id", id)
    .select("id");

  if (updErr) {
    return NextResponse.json(
      { error: updErr.message },
      { status: 400 }
    );
  }

  if (!Array.isArray(updated) || updated.length === 0) {
    return NextResponse.json(
      {
        error:
          "No se pudo actualizar (sin permisos o registro no encontrado). Revisa RLS/policies.",
      },
      { status: 403 }
    );
  }

  const { data: row, error: selErr } = await supabase
    .from("suministros_xhunco")
    .select(
      `
        id,
        imagen,
        sku,
        nombre,
        categoria,
        marca,
        presentacion,
        precio_original,
        precio_web,
        precio_publico,
        precio_medio,
        precio_mayoreo,
        unidad,
        stock,
        activo,
        descripcion_web,
        uso_sugerido,
        tip_preparacion,
        ideal_para
      `
    )
    .eq("id", id)
    .limit(1);

  if (selErr) {
    return NextResponse.json({
      ok: true,
      updated: true,
    });
  }

  return NextResponse.json({
    ok: true,
    updated: true,
    row: row?.[0] ?? null,
  });
}

export async function DELETE(req, { params }) {
  const supabase = await supabaseServer();
  const gate = await assertAdmin(supabase);

  if (!gate.ok) return gate.res;

  const id = getIdFromReq(req, params);

  if (!id) {
    return NextResponse.json(
      { error: "Falta id" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("suministros_xhunco")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json(
      {
        error:
          "No se pudo eliminar (sin permisos o registro no encontrado). Revisa RLS/policies.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}