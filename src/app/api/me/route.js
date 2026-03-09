import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function firstNameFrom(profile, email) {
  const first = String(profile?.first_name || "").trim();
  if (first) return first;

  // fallback: usa el correo antes del @ (capitalizado)
  const base = String(email || "").split("@")[0] || "Usuario";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export async function GET() {
  try {
    const supabase = await supabaseServer();

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return NextResponse.json({ first_name: "Usuario" }, { status: 200 });
    }

    const user = authData.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name,email")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json(
      { first_name: firstNameFrom(profile, user.email) },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ first_name: "Usuario" }, { status: 200 });
  }
}