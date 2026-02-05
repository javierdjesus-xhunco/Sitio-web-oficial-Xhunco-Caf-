import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServer();

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profErr || !profile?.role) {
    return NextResponse.json({ error: "No se pudo obtener rol" }, { status: 400 });
  }

  return NextResponse.json({ role: profile.role });
}
