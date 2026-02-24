import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function safeStr(x) {
  return String(x ?? "").trim();
}

// cursor = encodeURIComponent(`${created_at}::${id}`)
function parseCursor(raw) {
  const s = safeStr(raw);
  if (!s) return null;
  try {
    const decoded = decodeURIComponent(s);
    const [created_at, id] = decoded.split("::");
    if (!created_at || !id) return null;
    return { created_at, id };
  } catch {
    return null;
  }
}

function makeCursor(row) {
  if (!row?.created_at || !row?.id) return null;
  return encodeURIComponent(`${row.created_at}::${row.id}`);
}

export async function GET(req) {
  try {
    const supabase = await supabaseServer();

    // ✅ Auth
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 401 });
    if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    // ✅ Role check
    const { data: profRows, error: profErr } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", auth.user.id)
      .limit(1);

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 403 });

    const prof = profRows?.[0];
    if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo o sin perfil" }, { status: 403 });

    const role = safeStr(prof.role);
    if (!["admin", "superadmin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "No autorizado", role }, { status: 403 });
    }

    // ✅ Params
    const { searchParams } = new URL(req.url);
    const status = safeStr(searchParams.get("status") || "all");
    const client_user_id = safeStr(searchParams.get("client_user_id") || "");
    const cursorRaw = searchParams.get("cursor") || "";
    const cursor = parseCursor(cursorRaw);

    // pageSize: 10 recomendado para UI; max 50
    const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") || 10)));

    // ✅ Query base: ORDER BY created_at DESC, id DESC (estable)
    let ordersQuery = supabase
      .from("orders")
      .select("id, client_user_id, status, subtotal, total, created_at, delivery_method, payment_method")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (status && status !== "all") ordersQuery = ordersQuery.eq("status", status);
    if (client_user_id) ordersQuery = ordersQuery.eq("client_user_id", client_user_id);

    // ✅ Keyset: traer registros "después" del cursor (siguiente página)
    // Regla: (created_at < ts) OR (created_at = ts AND id < id)
   if (cursor) {
  const ts = cursor.created_at;
  const id = cursor.id;

  // ✅ IMPORTANTE: timestamp con comillas para que PostgREST lo parse bien
  ordersQuery = ordersQuery.or(
    `created_at.lt."${ts}",and(created_at.eq."${ts}",id.lt.${id})`
  );
}
    // ✅ Trae 1 extra para saber si hay siguiente
    const { data: ordersRaw, error: ordersErr } = await ordersQuery.limit(pageSize + 1);
    if (ordersErr) return NextResponse.json({ error: ordersErr.message }, { status: 400 });

    const hasNext = (ordersRaw || []).length > pageSize;
    const orders = hasNext ? (ordersRaw || []).slice(0, pageSize) : (ordersRaw || []);

    // ✅ cursors
    const nextCursor = hasNext ? makeCursor(orders[orders.length - 1]) : null;

    // ======================
    // Enriquecimiento (solo sobre esta página) => rápido
    // ======================

    const userIds = Array.from(new Set((orders || []).map((o) => o.client_user_id).filter(Boolean)));

    const { data: clients, error: clientsErr } = userIds.length
      ? await supabase
          .from("clients")
          .select(
            [
              "user_id",
              "business_name",
              "owner_name",
              "owner_first_name",
              "owner_middle_name",
              "owner_last_name_paterno",
              "owner_last_name_materno",
              "phone",
            ].join(",")
          )
          .in("user_id", userIds)
      : { data: [], error: null };

    if (clientsErr) return NextResponse.json({ error: clientsErr.message }, { status: 400 });

    const clientsMap = new Map((clients || []).map((c) => [c.user_id, c]));

    const orderIds = (orders || []).map((o) => o.id);
    const { data: items, error: itemsErr } = orderIds.length
      ? await supabase
          .from("order_items")
          .select("id, order_id, suministro_id, qty, unit_price, line_total")
          .in("order_id", orderIds)
      : { data: [], error: null };

    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 400 });

    const supplyIds = Array.from(new Set((items || []).map((i) => i.suministro_id).filter(Boolean)));
    const { data: supplies, error: suppliesErr } = supplyIds.length
      ? await supabase
          .from("suministros_xhunco")
          .select("id, sku, nombre, marca, presentacion, unidad")
          .in("id", supplyIds)
      : { data: [], error: null };

    if (suppliesErr) return NextResponse.json({ error: suppliesErr.message }, { status: 400 });

    const suppliesMap = new Map((supplies || []).map((s) => [s.id, s]));

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

    function buildOwnerName(c) {
      const built = [
        c?.owner_first_name,
        c?.owner_middle_name,
        c?.owner_last_name_paterno,
        c?.owner_last_name_materno,
      ]
        .map((x) => (x || "").trim())
        .filter(Boolean)
        .join(" ");
      return built || null;
    }

    const shaped = (orders || []).map((o) => {
      const c = clientsMap.get(o.client_user_id);
      const builtOwner = buildOwnerName(c);
      const owner = (c?.owner_name || "").trim() || builtOwner || null;

      return {
        id: o.id,
        status: o.status,
        subtotal: o.subtotal,
        total: o.total,
        created_at: o.created_at,
        delivery_method: o.delivery_method,
        payment_method: o.payment_method,

        cliente_nombre: owner || "—",
        negocio_nombre: (c?.business_name || "").trim() || "—",

        items: itemsByOrder.get(o.id) || [],
      };
    });

    return NextResponse.json({
      data: shaped,
      pageSize,
      hasNext,
      nextCursor,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Unhandled server error", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}