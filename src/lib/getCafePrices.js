import { supabaseServer } from "./supabaseServer";

export async function getCafePrices() {

  // Crear cliente correctamente
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("suministros_xhunco")
    .select(`
      sku,
      precio_web,
      imagen,
      stock,
      activo
    `)
    .eq("categoria", "Cafe")
    .eq("activo", true);

  if (error) {

    console.error(
      "Error obteniendo cafés:",
      error
    );

    return [];
  }

  return data;
}