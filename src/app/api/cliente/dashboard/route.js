import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function ymKeyFromIso(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function norm(value) {
  return String(value || "").toLowerCase().trim();
}

function safeNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function parseSnapshot(snapshot) {
  if (!snapshot) return {};

  if (typeof snapshot === "object") {
    return snapshot;
  }

  try {
    return JSON.parse(snapshot);
  } catch {
    return {};
  }
}

const PAYMENT_PENDING_VALUES = new Set([
  "",
  "pending",
  "pendiente",
  "pendiente_pago",
  "pendiente de pago",
  "unpaid",
  "no_pagado",
  "no pagado",
]);

const ORDER_PENDING_VALUES = new Set([
  "pendiente",
  "confirmado",
  "confirmada",
  "en_preparacion",
  "en preparación",
  "en proceso",
  "en_ruta",
  "en ruta",
]);

export async function GET() {
  try {
    const supabase = await supabaseServer();

    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    const [
      { data: profileRow, error: profileErr },
      { data: clientRow, error: clientErr },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("clients")
        .select("id, user_id, business_name")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (profileErr) {
      return NextResponse.json(
        { error: profileErr.message },
        { status: 400 }
      );
    }

    if (clientErr) {
      return NextResponse.json(
        { error: clientErr.message },
        { status: 400 }
      );
    }

    const first_name =
      String(profileRow?.first_name || "Usuario").trim() || "Usuario";

    const business_name = clientRow?.business_name || "";

    const possibleClientIds = Array.from(
      new Set(
        [
          userId,
          clientRow?.user_id,
          clientRow?.id,
        ].filter(Boolean)
      )
    );

    const { data: orders, error: ordErr } = await supabase
      .from("orders")
      .select(`
        id,
        client_user_id,
        status,
        subtotal,
        total,
        created_at,
        payment_status
      `)
      .in("client_user_id", possibleClientIds)
      .order("created_at", { ascending: false })
      .limit(200);

    if (ordErr) {
      return NextResponse.json(
        { error: ordErr.message },
        { status: 400 }
      );
    }

    const rows = Array.isArray(orders) ? orders : [];

    if (!rows.length) {
      return NextResponse.json(
        {
          ok: true,
          first_name,
          business_name,
          months: [],
          last_order: null,
          pendientes_pedido: { count: 0, total: 0 },
          pendientes_pago: { count: 0, total: 0 },
          pendientes: { count: 0, total: 0 },
          products: { top: [], bottom: [] },
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const monthsCount = new Map();

    let pendPedidoCount = 0;
    let pendPedidoTotal = 0;

    let pendPagoCount = 0;
    let pendPagoTotal = 0;

    for (const order of rows) {
      const ym = ymKeyFromIso(order.created_at);

      if (ym) {
        monthsCount.set(ym, (monthsCount.get(ym) || 0) + 1);
      }

      const status = norm(order.status);
      const paymentStatus = norm(order.payment_status);
      const total = safeNumber(order.total);

      if (ORDER_PENDING_VALUES.has(status)) {
        pendPedidoCount += 1;
        pendPedidoTotal += total;
      }

      if (PAYMENT_PENDING_VALUES.has(paymentStatus)) {
        pendPagoCount += 1;
        pendPagoTotal += total;
      }
    }

    const months = Array.from(monthsCount.entries())
      .map(([ym, count]) => ({
        ym,
        count,
      }))
      .sort((a, b) => (a.ym > b.ym ? -1 : 1));

    const last_order = rows[0]
      ? {
          id: rows[0].id,
          created_at: rows[0].created_at,
          status: rows[0].status,
          total: safeNumber(rows[0].total),
        }
      : null;

    const orderIds = rows.map((order) => order.id).filter(Boolean);

    let productItems = [];

    if (orderIds.length > 0) {
      const { data: items, error: itemsErr } = await supabase
        .from("order_items")
        .select(`
          id,
          order_id,
          suministro_id,
          qty,
          unit_price,
          line_total,
          snapshot
        `)
        .in("order_id", orderIds);

      if (itemsErr) {
        console.error("Error cargando productos del dashboard:", itemsErr);
      } else {
        productItems = Array.isArray(items) ? items : [];
      }
    }

    const productMap = new Map();

    for (const item of productItems) {
      const snapshot = parseSnapshot(item.snapshot);

      const name =
        String(
          snapshot?.nombre ||
            snapshot?.name ||
            snapshot?.product_name ||
            snapshot?.producto ||
            ""
        ).trim() || `Producto ${item.suministro_id || item.id}`;

      const qty = safeNumber(item.qty);

      if (!name || qty <= 0) continue;

      const prev = productMap.get(name) || {
        name,
        qty: 0,
      };

      prev.qty += qty;

      productMap.set(name, prev);
    }

    const productsSorted = Array.from(productMap.values()).sort(
      (a, b) => b.qty - a.qty
    );

    const top = productsSorted.slice(0, 5);

    const bottom = [...productsSorted]
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);

    const pendientes_pedido = {
      count: pendPedidoCount,
      total: pendPedidoTotal,
    };

    const pendientes_pago = {
      count: pendPagoCount,
      total: pendPagoTotal,
    };

    return NextResponse.json(
      {
        ok: true,
        first_name,
        business_name,
        months,
        last_order,
        pendientes_pedido,
        pendientes_pago,
        pendientes: pendientes_pedido,
        products: {
          top,
          bottom,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error en /api/cliente/dashboard:", error);

    return NextResponse.json(
      { error: "Error interno al cargar el dashboard." },
      { status: 500 }
    );
  }
}