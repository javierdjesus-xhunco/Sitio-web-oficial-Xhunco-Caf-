import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("suministros_xhunco")
    .select(`
      id,
      sku,
      nombre,
      categoria,
      precio_web,
      imagen,
      stock,
      activo
    `)
    .eq("activo", true);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const cafes = (data || []).filter((item) => {
    const nombre =
      item.nombre?.toLowerCase().trim() || "";

    return (
      nombre.includes("xhunco chiapas") ||
      nombre.includes("xhunco veracruz") ||
      nombre.includes("xhunco oaxaca")
    );
  });

  return NextResponse.json(cafes);
}