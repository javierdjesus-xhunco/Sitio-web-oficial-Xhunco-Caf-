import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  const supabase = await supabaseServer();

  // Auth
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Role check
  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
  if (!["admin", "superadmin"].includes(prof.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Params
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(10, Number(searchParams.get("pageSize") || 25)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Query (presentacion en vez de unidad)
  let query = supabase
    .from("suministros_xhunco")
    .select("id, sku, nombre, categoria, presentacion, stock", { count: "exact" })
    .eq("activo", true)
    .order("categoria", { ascending: true })
    .order("nombre", { ascending: true })
    .range(from, to);

  if (q) query = query.or(`sku.ilike.%${q}%,nombre.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    data: data || [],
    page,
    pageSize,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  });
}