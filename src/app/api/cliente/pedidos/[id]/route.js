import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizePaymentMethod(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (!v) return null;
  if (v === "transferencia") return "transfer";
  if (v === "transfer") return "transfer";
  if (v === "cash") return "cash";
  if (v === "tpv") return "tpv";
  if (v === "online") return "online";
  return v;
}

function sanitizePaymentSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return null;

  // Solo limpiamos lo que te importa, sin romper estructura si ya existe más info
  const out = { ...snapshot };

  if (typeof out.clabe === "string") {
    out.clabe = out.clabe.replace(/\s+/g, "");
  }

  return out;
}

export async function GET(request, { params }) {
  try {
    // ✅ id por params (fallback por URL si hiciera falta)
    const url = new URL(request.url);
    const fallbackId = url.pathname.split("/").filter(Boolean).pop();
    const id = params?.id || fallbackId;

    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "supabaseAdmin no está inicializado (revisa SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // ✅ Traer SOLO lo que usas (más óptimo que select('*'))
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        [
          "id",
          "status",
          "total",
          "created_at",
          "client_user_id",
          "delivery_method",
          "delivery_address_snapshot",
          "payment_method",
          "payment_snapshot",
        ].join(",")
      )
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

    // ✅ Normalizar pago para que tu UI muestre “Transferencia” siempre
    const normalizedOrder = {
      ...order,
      payment_method: normalizePaymentMethod(order.payment_method),
      payment_snapshot: sanitizePaymentSnapshot(order.payment_snapshot),
    };

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .select(
        `
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
      `
      )
      .eq("order_id", order.id);

    if (itemsErr) {
      console.error("itemsErr:", itemsErr);
      return NextResponse.json({ error: itemsErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, order: normalizedOrder, items: items || [] });
  } catch (err) {
    console.error("GET /api/cliente/pedidos/[id] fatal:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}