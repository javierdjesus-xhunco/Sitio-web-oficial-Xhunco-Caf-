import { supabaseServer } from "./supabaseServer";

export async function getCafePrices() {
  const supabase =
    await supabaseServer();

  const { data, error } =
    await supabase
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
    console.error(
      "Error obteniendo cafés:",
      error
    );

    return [];
  }

  // SOLO CAFÉS XHUNCO
  const cafes =
    (data || []).filter((item) => {

      const nombre =
        item.nombre
          ?.toLowerCase()
          .trim() || "";

      return (
        nombre.includes("xhunco chiapas") ||
        nombre.includes("xhunco veracruz") ||
        nombre.includes("xhunco oaxaca")
      );
    });

  return cafes;
}