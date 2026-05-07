import { getSupabaseBrowser } from "./supabaseBrowser";

export async function getCafePricesClient() {

  const supabase = getSupabaseBrowser();

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