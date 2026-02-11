import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: authData, error: authErr } = await supabase.auth.getUser();

  if (authErr || !authData?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("orders")
    .select("id, status, price_tier_snapshot, subtotal, total, created_at")
    .eq("client_user_id", authData.user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(
    { ok: true, items: rows || [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
