import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  try {
    const pathname = new URL(request.url).pathname;
    const idFromPath = pathname.split("/").pop();
    const id = params?.id || idFromPath;

    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "supabaseAdmin no está inicializado (revisa SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 500 },
      );
    }

    const userId = authData.user.id;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("client_user_id", userId)
      .single();

    if (orderError) {
      console.error("orderError:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .select(`
        id,
        order_id,
        suministro_id,
        qty,
        unit_price,
        line_total,
        suministros_xhunco: suministro_id (
          nombre,
          sku,
          presentacion,
          unidad,
          imagen
        )
      `)
      .eq("order_id", order.id);

    if (itemsErr) {
      console.error("itemsErr:", itemsErr);
      return NextResponse.json({ error: itemsErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, order, items: items || [] });
  } catch (err) {
    console.error("GET /api/cliente/pedidos/[id] fatal:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno del servidor" },
      { status: 500 },
    );
  }
}
