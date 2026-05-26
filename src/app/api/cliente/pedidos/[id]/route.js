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

  const out = { ...snapshot };

  if (typeof out.clabe === "string") {
    out.clabe = out.clabe.replace(/\s+/g, "");
  }

  return out;
}

function joinName(parts = []) {
  return parts
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .join(" ");
}

export async function GET(request, { params }) {
  try {
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

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        [
          "id",
          "status",
          "payment_status",
          "paid_at",
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

    const { data: client } = await supabaseAdmin
      .from("clients")
      .select(
        `
        business_name,
        owner_first_name,
        owner_middle_name,
        owner_last_name_paterno,
        owner_last_name_materno,
        phone,
        email,
        street,
        ext_number,
        int_number,
        neighborhood,
        municipality,
        state,
        postal_code
      `
      )
      .eq("user_id", userId)
      .maybeSingle();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select(
        `
        email,
        phone,
        first_name,
        middle_name,
        last_name_paterno,
        last_name_materno
      `
      )
      .eq("id", userId)
      .maybeSingle();

    const clientFullName = joinName([
      client?.owner_first_name,
      client?.owner_middle_name,
      client?.owner_last_name_paterno,
      client?.owner_last_name_materno,
    ]);

    const profileFullName = joinName([
      profile?.first_name,
      profile?.middle_name,
      profile?.last_name_paterno,
      profile?.last_name_materno,
    ]);

    const clientSnapshot = {
      business_name: client?.business_name || null,
      client_name: clientFullName || profileFullName || null,
      phone: client?.phone || profile?.phone || null,
      email: client?.email || profile?.email || authData.user.email || null,
      address: {
        street: client?.street || null,
        ext_number: client?.ext_number || null,
        int_number: client?.int_number || null,
        neighborhood: client?.neighborhood || null,
        municipality: client?.municipality || null,
        state: client?.state || null,
        postal_code: client?.postal_code || null,
      },
    };

    const normalizedOrder = {
      ...order,
      payment_method: normalizePaymentMethod(order.payment_method),
      payment_snapshot: sanitizePaymentSnapshot(order.payment_snapshot),
      client_snapshot: clientSnapshot,
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