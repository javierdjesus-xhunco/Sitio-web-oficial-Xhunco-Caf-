import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function toQty(v) {
  // qty entero >= 1
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? n : NaN;
}

export async function GET() {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Solo pendientes (rápido)
  const { data, error } = await supabase
    .from("suministros_solicitudes")
    .select("id, suministro_id, qty, status, created_at")
    .eq("client_id", auth.user.id)
    .eq("status", "pendiente")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data || [] });
}

export async function POST(req) {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const suministro_id = body?.suministro_id;
  const qty = toQty(body?.qty);

  if (!suministro_id) {
    return NextResponse.json({ error: "suministro_id requerido" }, { status: 400 });
  }

  // ✅ ahora qty libre (1..999)
  if (!Number.isFinite(qty) || qty < 1 || qty > 999) {
    return NextResponse.json({ error: "qty inválido (1 a 999)" }, { status: 400 });
  }

  // Recomendado: solo permitir si stock == 0 al momento de solicitar
  const { data: sRow, error: sErr } = await supabase
    .from("suministros_xhunco")
    .select("stock")
    .eq("id", suministro_id)
    .limit(1);

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 400 });

  const stock = Number(sRow?.[0]?.stock ?? 0);
  if (Number.isFinite(stock) && stock > 0) {
    return NextResponse.json(
      { error: "Este suministro ya tiene stock. Agrega al carrito." },
      { status: 409 },
    );
  }

  // Evitar spam: si ya hay una pendiente de ese suministro, no crear otra (actualiza qty)
  const { data: existing, error: exErr } = await supabase
    .from("suministros_solicitudes")
    .select("id, qty")
    .eq("client_id", auth.user.id)
    .eq("suministro_id", suministro_id)
    .eq("status", "pendiente")
    .limit(1);

  if (exErr) return NextResponse.json({ error: exErr.message }, { status: 400 });

  if (existing?.[0]) {
    const { data: upd, error: updErr } = await supabase
      .from("suministros_solicitudes")
      .update({ qty })
      .eq("id", existing[0].id)
      .select("id, suministro_id, qty, status, created_at")
      .single();

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });
    return NextResponse.json({ item: upd, updated: true });
  }

  const { data, error } = await supabase
    .from("suministros_solicitudes")
    .insert({
      client_id: auth.user.id,
      suministro_id,
      qty,
      status: "pendiente",
    })
    .select("id, suministro_id, qty, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data, created: true });
}