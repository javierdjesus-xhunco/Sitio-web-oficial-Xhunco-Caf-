import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const supabase = await supabaseServer();

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 401 });
    if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const url = new URL(req.url);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 20)));

    // lista
    const { data: rows, error: listErr } = await supabase
      .from("notifications")
      .select("id, type, title, body, url, is_read, created_at")
      .eq("recipient_user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 400 });

    // count no leídas
    const { count, error: countErr } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_user_id", auth.user.id)
      .eq("is_read", false);

    if (countErr) return NextResponse.json({ error: countErr.message }, { status: 400 });

    // ✅ DEBUG aquí, al final (ya existen rows/count)
    return NextResponse.json({
      ok: true,
      data: rows || [],
      unread: count || 0,
      debug_uid: auth.user.id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Unhandled server error", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
