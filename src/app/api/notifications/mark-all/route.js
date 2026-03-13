import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PATCH() {
  try {
    const supabase = await supabaseServer();

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 401 });
    }
    if (!auth?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { error: updErr } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_user_id", auth.user.id)
      .eq("is_read", false);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Unhandled server error", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}