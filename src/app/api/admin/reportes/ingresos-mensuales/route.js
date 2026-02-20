import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

function toCSV(rows, headers) {
  const esc = (v) => {
    const s = String(v ?? "");
    const needs = /[",\n]/.test(s);
    const out = s.replace(/"/g, '""');
    return needs ? `"${out}"` : out;
  };

  const head = headers.map((h) => esc(h.label)).join(",");
  const lines = rows.map((r) => headers.map((h) => esc(r[h.key])).join(","));
  return [head, ...lines].join("\n");
}

function parseRange(sp) {
  const now = new Date();
  const end = sp.get("end") ? new Date(sp.get("end")) : now;
  const start = sp.get("start")
    ? new Date(sp.get("start"))
    : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Rango de fechas inválido (start/end)." };
  }
  if (start >= end) return { error: "start debe ser menor que end." };

  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

async function assertAdmin(supabase) {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return { error: "No autenticado", status: 401 };
  }

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profErr) return { error: "Error leyendo perfil", status: 500 };
  if (!ADMIN_ROLES.has(String(prof?.role || "").toLowerCase())) {
    return { error: "No autorizado", status: 403 };
  }

  return { ok: true };
}

export async function GET(req) {
  const supabase = await supabaseServer();

  const guard = await assertAdmin(supabase);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const url = new URL(req.url);
  const sp = url.searchParams;

  const report = sp.get("report") || "month";
  const format = (sp.get("format") || "json").toLowerCase();
  const { startISO, endISO, error: rangeErr } = parseRange(sp);
  if (rangeErr) return NextResponse.json({ error: rangeErr }, { status: 400 });

  const limit = Math.min(Math.max(parseInt(sp.get("limit") || "50", 10), 1), 200);
  const offset = Math.max(parseInt(sp.get("offset") || "0", 10), 0);
  const business = sp.get("business") || null; // uuid o null

  let rpcName = null;
  let rpcArgs = null;

  if (report === "day") {
    rpcName = "admin_report_by_day";
    rpcArgs = { p_start: startISO, p_end: endISO };
  } else if (report === "month") {
    rpcName = "admin_report_by_month";
    rpcArgs = { p_start: startISO, p_end: endISO };
  } else if (report === "business") {
    rpcName = "admin_report_by_business";
    rpcArgs = { p_start: startISO, p_end: endISO };
  } else if (report === "orders_detail") {
    rpcName = "admin_report_orders_detail";
    rpcArgs = {
      p_start: startISO,
      p_end: endISO,
      p_business: business,
      p_limit: limit,
      p_offset: offset,
    };
  } else if (report === "kpis") {
    rpcName = "admin_report_kpis";
    rpcArgs = { p_start: startISO, p_end: endISO, p_business: business };
  } else {
    return NextResponse.json(
      { error: "report inválido. Usa: day | month | business | orders_detail | kpis" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc(rpcName, rpcArgs);

  if (error) {
    return NextResponse.json(
      {
        error: "RPC error",
        details: error.message,
        hint:
          "Verifica que creaste las funciones SQL (RPC) en Supabase y que el nombre de tablas coincide.",
      },
      { status: 500 }
    );
  }

  // CSV
  if (format === "csv") {
    let csv = "";
    let filename = `reporte-${report}-${startISO.slice(0, 10)}_a_${endISO.slice(0, 10)}.csv`;

    if (report === "day") {
      csv = toCSV(data || [], [
        { key: "day", label: "día" },
        { key: "orders_count", label: "ventas" },
        { key: "revenue", label: "ingresos_entregados" },
      ]);
    } else if (report === "month") {
      csv = toCSV(data || [], [
        { key: "month", label: "mes" },
        { key: "orders_count", label: "ventas" },
        { key: "revenue", label: "ingresos_entregados" },
      ]);
    } else if (report === "business") {
      csv = toCSV(data || [], [
        { key: "client_user_id", label: "client_user_id" },
        { key: "business_name", label: "negocio" },
        { key: "orders_count", label: "pedidos" },
        { key: "revenue", label: "ingresos_entregados" },
      ]);
    } else if (report === "kpis") {
      // 1 fila
      const row = (data && data[0]) ? data[0] : {};
      csv = toCSV([row], [
        { key: "orders_total", label: "pedidos_totales" },
        { key: "orders_delivered", label: "pedidos_entregados" },
        { key: "orders_cancelled", label: "pedidos_cancelados" },
        { key: "revenue_delivered", label: "ingresos_entregados" },
        { key: "avg_ticket_delivered", label: "ticket_promedio_entregado" },
        { key: "fulfillment_pct", label: "cumplimiento_pct" },
      ]);
      filename = `reporte-kpis-${startISO.slice(0, 10)}_a_${endISO.slice(0, 10)}.csv`;
    } else {
      // orders_detail: aplanamos items para CSV (1 fila por item)
      const flat = [];
      for (const row of data || []) {
        const items = Array.isArray(row.items) ? row.items : [];
        if (items.length === 0) {
          flat.push({
            order_id: row.order_id,
            created_at: row.created_at,
            business_name: row.business_name,
            status: row.status,
            total: row.total,
            sku: "",
            nombre: "",
            qty: "",
            unit_price: "",
            line_total: "",
          });
        } else {
          for (const it of items) {
            flat.push({
              order_id: row.order_id,
              created_at: row.created_at,
              business_name: row.business_name,
              status: row.status,
              total: row.total,
              sku: it?.sku ?? "",
              nombre: it?.nombre ?? "",
              qty: it?.qty ?? "",
              unit_price: it?.unit_price ?? "",
              line_total: it?.line_total ?? "",
            });
          }
        }
      }

      csv = toCSV(flat, [
        { key: "order_id", label: "pedido_id" },
        { key: "created_at", label: "fecha" },
        { key: "business_name", label: "negocio" },
        { key: "status", label: "estatus" },
        { key: "total", label: "total_pedido" },
        { key: "sku", label: "sku" },
        { key: "nombre", label: "articulo" },
        { key: "qty", label: "cantidad" },
        { key: "unit_price", label: "precio_unitario" },
        { key: "line_total", label: "total_linea" },
      ]);
      filename = `reporte-pedidos-detalle-${startISO.slice(0, 10)}_a_${endISO.slice(0, 10)}.csv`;
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // JSON
  return NextResponse.json(
    {
      range: { start: startISO, end: endISO },
      report,
      limit: report === "orders_detail" ? limit : undefined,
      offset: report === "orders_detail" ? offset : undefined,
      business: report === "orders_detail" || report === "kpis" ? business : undefined,
      data: data || [],
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}