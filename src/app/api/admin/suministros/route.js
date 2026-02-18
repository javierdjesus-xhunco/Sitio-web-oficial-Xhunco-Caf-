import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

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

  const { data, error } = await supabase
    .from("suministros_xhunco")
    .select(
      "id, sku, nombre, marca, presentacion, unidad, categoria, stock, precio_original, precio_web, precio_publico, precio_medio, precio_mayoreo"
    )
    .eq("activo", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data: data || [] });
}
