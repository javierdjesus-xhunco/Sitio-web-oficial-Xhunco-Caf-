import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(req) {
  try {
    const supabase = await supabaseServer();

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 401 });
    }
    if (!auth?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = auth.user.id;
    const url = new URL(req.url);
    const mode = String(url.searchParams.get("mode") || "").trim().toLowerCase();
    const limit = clampInt(url.searchParams.get("limit"), 1, 50, 20);

    if (mode === "badge") {
      const { count, error: countErr } = await supabaseAdmin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_user_id", userId)
        .eq("is_read", false);

      if (countErr) {
        return NextResponse.json({ error: countErr.message }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        unread: count || 0,
      });
    }

    const [{ data: rows, error: listErr }, { count, error: countErr }] = await Promise.all([
      supabaseAdmin
        .from("notifications")
        .select("id, type, title, body, url, is_read, created_at")
        .eq("recipient_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit),

      supabaseAdmin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_user_id", userId)
        .eq("is_read", false),
    ]);

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 400 });
    }

    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      data: rows || [],
      unread: count || 0,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Unhandled server error", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}