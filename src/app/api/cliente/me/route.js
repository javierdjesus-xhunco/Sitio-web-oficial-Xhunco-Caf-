import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: client, error: cErr } = await supabase
      .from("clients")
      .select("business_name, logo_url")
      .eq("user_id", userId)
      .single();

    if (cErr) {
      return NextResponse.json({ error: cErr.message }, { status: 400 });
    }

    return NextResponse.json({ client });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || String(e) || "Error inesperado" },
      { status: 500 }
    );
  }
}
