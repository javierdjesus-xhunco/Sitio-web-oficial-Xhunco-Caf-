import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServer(); // ✅ IMPORTANT

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 401 });
    if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { data: profRows, error: profErr } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", auth.user.id)
      .limit(1);

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 403 });

    const prof = profRows?.[0];
    if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo o sin perfil" }, { status: 403 });
    if (!["admin", "superadmin"].includes(prof.role)) {
      return NextResponse.json({ error: "No autorizado", role: prof.role }, { status: 403 });
    }

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("id, client_user_id, status, subtotal, total, created_at, delivery_method, payment_method")
      .order("created_at", { ascending: false });

    if (ordersErr) return NextResponse.json({ error: ordersErr.message }, { status: 400 });

    const userIds = Array.from(new Set((orders || []).map(o => o.client_user_id).filter(Boolean)));
    const { data: clients, error: clientsErr } = userIds.length
      ? await supabase
          .from("clients")
          .select("user_id, business_name, owner_name, phone")
          .in("user_id", userIds)
      : { data: [], error: null };

    if (clientsErr) return NextResponse.json({ error: clientsErr.message }, { status: 400 });

    const clientsMap = new Map((clients || []).map(c => [c.user_id, c]));

    const orderIds = (orders || []).map(o => o.id);
    const { data: items, error: itemsErr } = orderIds.length
      ? await supabase
          .from("order_items")
          .select("id, order_id, suministro_id, qty, unit_price, line_total")
          .in("order_id", orderIds)
      : { data: [], error: null };

    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 400 });

    const supplyIds = Array.from(new Set((items || []).map(i => i.suministro_id).filter(Boolean)));
    const { data: supplies, error: suppliesErr } = supplyIds.length
      ? await supabase
          .from("suministros_xhunco")
          .select("id, sku, nombre, marca, presentacion, unidad")
          .in("id", supplyIds)
      : { data: [], error: null };

    if (suppliesErr) return NextResponse.json({ error: suppliesErr.message }, { status: 400 });

    const suppliesMap = new Map((supplies || []).map(s => [s.id, s]));

    const itemsByOrder = new Map();
    for (const it of items || []) {
      const arr = itemsByOrder.get(it.order_id) || [];
      const sup = suppliesMap.get(it.suministro_id);
      arr.push({
        id: it.id,
        qty: it.qty,
        unit_price: it.unit_price,
        line_total: it.line_total,
        sku: sup?.sku || "—",
        nombre: sup?.nombre || "Producto",
        marca: sup?.marca || "",
        presentacion: sup?.presentacion || "",
        unidad: sup?.unidad || "",
      });
      itemsByOrder.set(it.order_id, arr);
    }

    const shaped = (orders || []).map(o => {
      const c = clientsMap.get(o.client_user_id);
      return {
        id: o.id,
        status: o.status,
        subtotal: o.subtotal,
        total: o.total,
        created_at: o.created_at,
        delivery_method: o.delivery_method,
        payment_method: o.payment_method,
        cliente_nombre: c?.business_name || c?.owner_name || "—",
        items: itemsByOrder.get(o.id) || [],
      };
    });

    return NextResponse.json({ data: shaped });
  } catch (e) {
    return NextResponse.json(
      { error: "Unhandled server error", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
