import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guest_id, items } = body;

    if (!guest_id) {
      return NextResponse.json(
        { error: "guest_id es requerido" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items inválidos" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("guest_carts")
      .upsert({
        guest_id,
        items,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Error guardando carrito" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const guest_id = searchParams.get("guest_id");

  if (!guest_id) {
    return NextResponse.json(
      { error: "guest_id requerido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("guest_carts")
    .select("items")
    .eq("guest_id", guest_id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json(
      { error: "Error obteniendo carrito" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    items: data?.items || [],
  });
}
