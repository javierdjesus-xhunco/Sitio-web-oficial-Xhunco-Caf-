import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const tierToColumn = {
  precio_web: "precio_web",
  precio_publico: "precio_publico",
  precio_medio: "precio_medio",
  precio_mayoreo: "precio_mayoreo",
};

export async function GET() {
  const supabase = await supabaseServer();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // leer tier del cliente
    const { data: client, error: clientErr } = await supabase
    .from("clients")
    .select("user_id, email, price_tier")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (clientErr) {
    return NextResponse.json(
      { error: `clients query error: ${clientErr.message}` },
      { status: 400 }
    );
  }

  if (!client) {
    return NextResponse.json(
      { error: "No existe registro en clients para este usuario (falta alta de cliente)" },
      { status: 400 }
    );
  }

  if (!client.price_tier) {
    return NextResponse.json(
      { error: "El registro en clients existe pero price_tier está vacío" },
      { status: 400 }
    );
  }

  const col = tierToColumn[client.price_tier] || "precio_publico";

  // traer suministros
  const { data: rows, error: sErr } = await supabase
    .from("suministros_xhunco")
    .select("id, sku, nombre, categoria, marca, presentacion, unidad, stock, activo, precio_web, precio_publico, precio_medio, precio_mayoreo, imagen")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 400 });

  // mapear a price “final” según tier
  const items = (rows || []).map((r) => ({
    id: r.id,
    sku: r.sku,
    nombre: r.nombre,
    categoria: r.categoria,
    marca: r.marca,
    presentacion: r.presentacion,
    unidad: r.unidad,
    stock: r.stock,
    imagen: r.imagen,
    price: r[col],
    price_tier: client.price_tier,
  }));

  return NextResponse.json({ ok: true, price_tier: client.price_tier, items });
}
