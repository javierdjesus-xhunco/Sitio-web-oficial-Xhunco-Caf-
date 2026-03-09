import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function startDateFromDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d.toISOString();
}

function escapeCsv(v) {
  const s = String(v ?? "");
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

  const role = String(me?.role || "").toLowerCase().trim();
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
    const days = Math.max(1, Math.min(365, Number(searchParams.get("days") || 30)));
    const fromIso = startDateFromDays(days);

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        payment_status,
        client_user_id,
        total,
        clients:clients!orders_client_user_id_fkey (
          user_id,
          business_name
        )
      `)
      .gte("created_at", fromIso)
      .eq("payment_status", "pagado")
      .order("created_at", { ascending: false });

    if (ordersErr) {
      return NextResponse.json({ error: ordersErr.message || "Error cargando pedidos" }, { status: 500 });
    }

    const orderIds = (orders || []).map((o) => o.id);

    if (!orderIds.length) {
      const csv = "fecha,pedido_id,cliente,producto,cantidad,precio_unitario,subtotal,status_pedido,status_pago,total_pedido\n";
      return new Response(csv, {
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
        product_id,
        product_name,
        quantity,
        unit_price,
        subtotal
      `)
      .in("order_id", orderIds);

    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message || "Error cargando partidas" }, { status: 500 });
    }

    const orderMap = new Map();
    for (const o of orders || []) orderMap.set(o.id, o);

    const header = [
      "fecha",
      "pedido_id",
      "cliente",
      "producto",
      "cantidad",
      "precio_unitario",
      "subtotal",
      "status_pedido",
      "status_pago",
      "total_pedido",
    ];

    const lines = [header.join(",")];

    for (const it of items || []) {
      const o = orderMap.get(it.order_id);
      const subtotal = Number(it.subtotal ?? Number(it.quantity || 0) * Number(it.unit_price || 0));

      const row = [
        escapeCsv(o?.created_at || ""),
        escapeCsv(o?.id || ""),
        escapeCsv(o?.clients?.business_name || "Cliente"),
        escapeCsv(it?.product_name || "Producto"),
        escapeCsv(Number(it?.quantity || 0)),
        escapeCsv(Number(it?.unit_price || 0)),
        escapeCsv(subtotal),
        escapeCsv(o?.status || ""),
        escapeCsv(o?.payment_status || ""),
        escapeCsv(Number(o?.total || 0)),
      ];

      lines.push(row.join(","));
    }

    const csv = "\uFEFF" + lines.join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reportes_bruto_${days}dias.csv"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}