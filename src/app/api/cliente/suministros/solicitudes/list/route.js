import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function toInt(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function okStatus(s) {
  return ["pendiente", "confirmada", "rechazada", "cancelada"].includes(s);
}

export async function GET(req) {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "ALL").toLowerCase();
  const limit = Math.min(100, Math.max(1, toInt(searchParams.get("limit"), 20)));
  const offset = Math.max(0, toInt(searchParams.get("offset"), 0));

  let q = supabase
    .from("suministros_solicitudes")
    .select(
      `
      id, created_at, suministro_id, qty, status, handled_at,
      suministros_xhunco:suministro_id ( id, nombre, sku, marca, categoria )
      `,
      { count: "exact" },
    )
    .eq("client_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    const safeStatus = okStatus(status) ? status : "pendiente";
    q = q.eq("status", safeStatus);
  }

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Respuesta normalizada para UI
  const items = (data || []).map((r) => {
    const s = r?.suministros_xhunco;
    return {
      id: r.id,
      created_at: r.created_at,
      qty: r.qty,
      status: r.status,
      handled_at: r.handled_at,

      suministro_id: r.suministro_id,
      suministro_nombre: s?.nombre || "—",
      suministro_sku: s?.sku || null,
      suministro_marca: s?.marca || null,
      suministro_categoria: s?.categoria || null,
    };
  });

  return NextResponse.json({
    items,
    status: status === "all" ? "ALL" : status,
    limit,
    offset,
    count: Number(count ?? items.length),
  });
}