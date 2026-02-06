import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: authData, error: authErr } = await supabase.auth.getUser();

  if (authErr || !authData?.user) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id, email, role, user_no")
    .eq("id", authData.user.id)
    .single();

  return NextResponse.json({
    ok: true,
    auth: { id: authData.user.id, email: authData.user.email },
    profile: profErr ? null : profile,
    profile_error: profErr?.message || null,
  });
}
