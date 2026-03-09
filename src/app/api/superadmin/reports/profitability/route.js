import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

function isPaidStatus(value) {
  const s = String(value || "").toLowerCase().trim();
  return s === "pagado";
}

function classifyMargin(margin) {
  const m = Number(margin || 0);

  if (m < 0) return "perdida";
  if (m < 10) return "riesgo";
  if (m < 20) return "margen_bajo";
  return "rentable";
}

async function requireAdmin() {
  const supabase = await supabaseServer();

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return { error: "No autenticado", status: 401 };
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileErr) {
    return {
      error: profileErr.message || "No se pudo validar el rol",
      status: 500,
    };
  }

  const role = String(profile?.role || "").toLowerCase().trim();

  if (role !== "admin" && role !== "super_admin") {
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

    const { searchParams } = new URL(req.url);
    const days = clampDays(searchParams.get("days"));
    const fromIso = startDateFromDays(days);

    const { data: rows, error } = await supabaseAdmin
      .from("order_items")
      .select(`
        id,
        order_id,
        suministro_id,
        qty,
        unit_price,
        line_total,
        original_cost_snapshot,
        orders!inner(
          id,
          created_at,
          payment_status,
          client_user_id
        ),
        suministros_xhunco(
          id,
          nombre,
          precio_original
        )
      `)
      .gte("orders.created_at", fromIso);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Error al cargar rentabilidad" },
        { status: 500 }
      );
    }

    const paidRows = (rows || []).filter((row) =>
      isPaidStatus(row?.orders?.payment_status)
    );

    let ventas = 0;
    let costo = 0;

    const productsMap = new Map();
    const clientsMap = new Map();

    for (const row of paidRows) {
      const qty = Number(row?.qty || 0);
      const unitPrice = Number(row?.unit_price || 0);

      const saleAmount =
        row?.line_total !== null && row?.line_total !== undefined
          ? Number(row.line_total || 0)
          : unitPrice * qty;

      const snapshotCost =
        row?.original_cost_snapshot !== null &&
        row?.original_cost_snapshot !== undefined
          ? Number(row.original_cost_snapshot || 0)
          : Number(row?.suministros_xhunco?.precio_original || 0);

      const costAmount = snapshotCost * qty;
      const profitAmount = saleAmount - costAmount;
      const productName = row?.suministros_xhunco?.nombre || "Producto";
      const productKey = String(row?.suministro_id || row?.id || productName);
      const clientKey = String(row?.orders?.client_user_id || "sin_cliente");

      ventas += saleAmount;
      costo += costAmount;

      if (!productsMap.has(productKey)) {
        productsMap.set(productKey, {
          suministro_id: row?.suministro_id || null,
          producto: productName,
          ventas: 0,
          costo: 0,
          utilidad: 0,
          qty: 0,
          lines: 0,
        });
      }

      const product = productsMap.get(productKey);
      product.ventas += saleAmount;
      product.costo += costAmount;
      product.utilidad += profitAmount;
      product.qty += qty;
      product.lines += 1;

      if (!clientsMap.has(clientKey)) {
        clientsMap.set(clientKey, {
          client_user_id: row?.orders?.client_user_id || null,
          ventas: 0,
          costo: 0,
          utilidad: 0,
          qty: 0,
          lines: 0,
        });
      }

      const client = clientsMap.get(clientKey);
      client.ventas += saleAmount;
      client.costo += costAmount;
      client.utilidad += profitAmount;
      client.qty += qty;
      client.lines += 1;
    }

    const utilidad = ventas - costo;
    const margen = ventas > 0 ? (utilidad / ventas) * 100 : 0;

    const top_productos = Array.from(productsMap.values())
      .map((p) => {
        const productMargin = p.ventas > 0 ? (p.utilidad / p.ventas) * 100 : 0;

        return {
          ...p,
          margen: productMargin,
          estado: classifyMargin(productMargin),
        };
      })
      .sort((a, b) => b.utilidad - a.utilidad);

    const productos_no_rentables = top_productos
      .filter((p) => Number(p.utilidad || 0) <= 0 || Number(p.margen || 0) < 10)
      .sort((a, b) => a.utilidad - b.utilidad);

    const rentabilidad_por_cliente = Array.from(clientsMap.values())
      .map((c) => ({
        ...c,
        margen: c.ventas > 0 ? (c.utilidad / c.ventas) * 100 : 0,
      }))
      .sort((a, b) => b.utilidad - a.utilidad);

    return NextResponse.json({
      ok: true,
      days,
      from: fromIso,
      kpis: {
        ventas,
        costo,
        utilidad,
        margen,
        paid_lines: paidRows.length,
        profitable_products: top_productos.filter((p) => Number(p.utilidad || 0) > 0).length,
        unprofitable_products: productos_no_rentables.length,
      },
      top_productos: top_productos.slice(0, 20),
      productos_no_rentables: productos_no_rentables.slice(0, 20),
      rentabilidad_por_cliente: rentabilidad_por_cliente.slice(0, 20),
      debug: {
        rows_count: rows?.length || 0,
        paid_rows_count: paidRows.length,
      },
    });
  } catch (e) {
    console.error("PROFITABILITY REPORT ERROR:", e);

    return NextResponse.json(
      { error: e?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}