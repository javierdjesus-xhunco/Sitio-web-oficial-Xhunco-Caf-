import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const DELIVERY = new Set(["pickup", "delivery"]);
const PAYMENT = new Set(["cash", "tpv", "online"]);

function normalizeTier(tier) {
  const t = String(tier || "").toLowerCase().trim();
  if (t === "precio_web" || t === "web") return "precio_web";
  if (
    t === "precio_publico" ||
    t === "publico" ||
    t === "lista" ||
    t === "precio_lista"
  )
    return "precio_publico";
  if (t === "precio_mayoreo" || t === "mayoreo") return "precio_mayoreo";
  if (t === "precio_medio" || t === "medio") return "precio_medio";
  return "precio_publico";
}

function priceFromTierRow(row, tier) {
  const t = normalizeTier(tier);

  if (t === "precio_web") return Number(row?.precio_web ?? 0);
  if (t === "precio_publico") return Number(row?.precio_publico ?? 0);
  if (t === "precio_mayoreo") return Number(row?.precio_mayoreo ?? 0);
  if (t === "precio_medio") return Number(row?.precio_medio ?? 0);

  return Number(row?.precio_publico ?? 0);
}

export async function POST(req) {
  const supabase = await supabaseServer();

  try {
    // 1) Auth
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 2) Role check
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

    // 3) Parse body
    const body = await req.json().catch(() => ({}));
    const client_user_id = body?.client_user_id;
    const delivery_method = String(body?.delivery_method || "pickup");
    const payment_method = String(body?.payment_method || "cash");
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!client_user_id) return NextResponse.json({ error: "Falta client_user_id" }, { status: 400 });
    if (!DELIVERY.has(delivery_method)) return NextResponse.json({ error: "delivery_method inválido" }, { status: 400 });
    if (!PAYMENT.has(payment_method)) return NextResponse.json({ error: "payment_method inválido" }, { status: 400 });
    if (items.length === 0) return NextResponse.json({ error: "Agrega al menos 1 producto" }, { status: 400 });

    // Normaliza items (🔒 IGNORAMOS unit_price del request)
    const cleanItems = [];
    for (const it of items) {
      const suministro_id = it?.suministro_id;
      const qty = Number(it?.qty);

      if (!suministro_id) return NextResponse.json({ error: "Item sin suministro_id" }, { status: 400 });
      if (!Number.isFinite(qty) || qty <= 0) return NextResponse.json({ error: "qty inválido" }, { status: 400 });

      cleanItems.push({ suministro_id, qty: Math.floor(qty) });
    }

    // 4) Leer cliente (tier + dirección snapshot)
    const { data: clientRows, error: clientErr } = await supabase
      .from("clients")
      .select("price_tier, address, street, ext_number, int_number, neighborhood, municipality, state, postal_code")
      .eq("user_id", client_user_id)
      .limit(1);

    if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 400 });

    const client = clientRows?.[0];
    if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

    const price_tier_snapshot = normalizeTier(client.price_tier);

    let delivery_address_snapshot = null;
    if (delivery_method === "delivery") {
      delivery_address_snapshot = {
        address: client.address || null,
        street: client.street || null,
        ext_number: client.ext_number || null,
        int_number: client.int_number || null,
        neighborhood: client.neighborhood || null,
        municipality: client.municipality || null,
        state: client.state || null,
        postal_code: client.postal_code || null,
      };
    }

    // 5) Leer productos para validar stock + calcular precio por tier
    const ids = Array.from(new Set(cleanItems.map((x) => x.suministro_id)));

    const { data: prodRows, error: prodErr } = await supabase
      .from("suministros_xhunco")
      .select("id, stock, nombre, sku, precio_web, precio_publico, precio_medio, precio_mayoreo")
      .in("id", ids)
      .eq("activo", true);

    if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 400 });

    const prodMap = new Map();
    (prodRows || []).forEach((r) => {
      prodMap.set(r.id, {
        id: r.id,
        stock: Math.max(0, Number(r.stock || 0)),
        nombre: r.nombre || "Producto",
        sku: r.sku || "",
        precio_web: r.precio_web,
        precio_publico: r.precio_publico,
        precio_medio: r.precio_medio,
        precio_mayoreo: r.precio_mayoreo,
      });
    });

    // 6) Validación stock + construir items con unit_price calculado
    const pricedItems = [];
    for (const it of cleanItems) {
      const p = prodMap.get(it.suministro_id);
      if (!p) {
        return NextResponse.json({ error: `Producto no encontrado: ${it.suministro_id}` }, { status: 400 });
      }

      if (p.stock <= 0) {
        return NextResponse.json(
          { error: `Sin stock: ${p.nombre}${p.sku ? ` (${p.sku})` : ""}` },
          { status: 400 }
        );
      }

      if (it.qty > p.stock) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${p.nombre}${p.sku ? ` (${p.sku})` : ""}. Máx: ${p.stock}` },
          { status: 400 }
        );
      }

      const unit_price = priceFromTierRow(p, price_tier_snapshot);

      if (!Number.isFinite(unit_price) || unit_price < 0) {
        return NextResponse.json(
          { error: `Precio inválido para ${p.nombre}${p.sku ? ` (${p.sku})` : ""} en tier ${price_tier_snapshot}` },
          { status: 400 }
        );
      }

      pricedItems.push({
        suministro_id: it.suministro_id,
        qty: it.qty,
        unit_price,
      });
    }

    // 7) Totales
    const subtotal = pricedItems.reduce((acc, it) => acc + it.qty * it.unit_price, 0);
    const total = subtotal;

    // 8) Crear order (con snapshot NOT NULL)
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        client_user_id,
        status: "pendiente",
        price_tier_snapshot,
        delivery_method,
        payment_method,
        delivery_address_snapshot,
        subtotal,
        total,
      })
      .select("id")
      .single();

    if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 400 });

    // 9) Crear order_items (con snapshot)
    const rows = pricedItems.map((it) => ({
      order_id: order.id,
      suministro_id: it.suministro_id,
      qty: it.qty,
      unit_price: it.unit_price,
      line_total: it.qty * it.unit_price,
      price_tier_snapshot,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 400 });

    // 10) Descontar stock (versión directa)
    // Nota: para atomicidad/concurrencia real, lo ideal es una función SQL (RPC) con transacción.
    for (const it of pricedItems) {
      const current = prodMap.get(it.suministro_id)?.stock ?? 0;
      const nextStock = Math.max(0, current - it.qty);

      const { error: updErr } = await supabase
        .from("suministros_xhunco")
        .update({ stock: nextStock })
        .eq("id", it.suministro_id);

      if (updErr) {
        return NextResponse.json(
          { error: `Pedido creado pero no se pudo actualizar stock de ${it.suministro_id}: ${updErr.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ ok: true, order_id: order.id });
  } catch (e) {
    return NextResponse.json(
      { error: "Unhandled server error", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
