import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function clampDays(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 30;
  return Math.max(1, Math.min(365, n));
}

function startDateFromDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d.toISOString();
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function requireAdmin() {
  const supabase = await supabaseServer();

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return { error: "No autenticado", status: 401 };
  }

  const { data: me, error: meErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (meErr) {
    return { error: meErr.message || "No se pudo validar el rol", status: 500 };
  }

  const role = String(me?.role || "")
    .toLowerCase()
    .trim();

  if (role !== "super_admin" && role !== "admin") {
    return { error: "No autorizado", status: 403 };
  }

  return { supabase };
}

export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (auth?.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabase } = auth;
    const { searchParams } = new URL(req.url);

    const days = clampDays(searchParams.get("days"));
    const fromIso = startDateFromDays(days);

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select(`
        id,
        client_user_id,
        status,
        subtotal,
        total,
        created_at,
        payment_status,
        paid_at,
        paid_by
      `)
      .gte("created_at", fromIso)
      .eq("payment_status", "pagado")
      .order("created_at", { ascending: false });

    if (ordersErr) {
      return NextResponse.json(
        { error: ordersErr.message || "Error al cargar pedidos" },
        { status: 500 }
      );
    }

    const orderIds = (orders || []).map((o) => o.id);
    const clientUserIds = [
      ...new Set((orders || []).map((o) => o.client_user_id).filter(Boolean)),
    ];

    let clients = [];
    if (clientUserIds.length) {
      const { data, error } = await supabase
        .from("clients")
        .select("user_id, business_name")
        .in("user_id", clientUserIds);

      if (error) {
        return NextResponse.json(
          { error: error.message || "Error al cargar clientes" },
          { status: 500 }
        );
      }

      clients = data || [];
    }

    if (!orderIds.length) {
      const emptyCsv =
        "\uFEFFfecha,pedido_id,cliente,producto,categoria,marca,presentacion,cantidad,precio_unitario,subtotal_linea,status_pedido,status_pago,total_pedido\n";

      return new Response(emptyCsv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="reportes_bruto_${days}dias.csv"`,
        },
      });
    }

    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        suministro_id,
        qty,
        unit_price,
        line_total
      `)
      .in("order_id", orderIds);

    if (itemsErr) {
      return NextResponse.json(
        { error: itemsErr.message || "Error al cargar partidas" },
        { status: 500 }
      );
    }

    const suministroIds = [
      ...new Set((items || []).map((it) => it.suministro_id).filter(Boolean)),
    ];

    let suministros = [];
    if (suministroIds.length) {
      const { data, error } = await supabase
        .from("suministros_xhunco")
        .select("id, nombre, categoria, marca, presentacion")
        .in("id", suministroIds);

      if (error) {
        return NextResponse.json(
          { error: error.message || "Error al cargar productos" },
          { status: 500 }
        );
      }

      suministros = data || [];
    }

    const ordersMap = new Map((orders || []).map((o) => [o.id, o]));
    const clientsMap = new Map((clients || []).map((c) => [c.user_id, c]));
    const suppliesMap = new Map((suministros || []).map((s) => [s.id, s]));

    const header = [
      "fecha",
      "pedido_id",
      "cliente",
      "producto",
      "categoria",
      "marca",
      "presentacion",
      "cantidad",
      "precio_unitario",
      "subtotal_linea",
      "status_pedido",
      "status_pago",
      "total_pedido",
    ];

    const rows = [header.join(",")];

    for (const it of items || []) {
      const order = ordersMap.get(it.order_id);
      if (!order) continue;

      const client = clientsMap.get(order.client_user_id);
      const supply = suppliesMap.get(it.suministro_id);

      rows.push(
        [
          escapeCsv(order.created_at || ""),
          escapeCsv(order.id || ""),
          escapeCsv(client?.business_name || "Cliente"),
          escapeCsv(supply?.nombre || "Producto"),
          escapeCsv(supply?.categoria || ""),
          escapeCsv(supply?.marca || ""),
          escapeCsv(supply?.presentacion || ""),
          escapeCsv(Number(it.qty || 0)),
          escapeCsv(Number(it.unit_price || 0)),
          escapeCsv(Number(it.line_total || 0)),
          escapeCsv(order.status || ""),
          escapeCsv(order.payment_status || ""),
          escapeCsv(Number(order.total || 0)),
        ].join(",")
      );
    }

    const csv = "\uFEFF" + rows.join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reportes_bruto_${days}dias.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}