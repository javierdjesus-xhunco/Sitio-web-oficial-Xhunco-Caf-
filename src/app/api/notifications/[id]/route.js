import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function getIdFromUrl(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export async function PATCH(req, ctx) {
  try {
    const supabase = await supabaseServer();
    const id = ctx?.params?.id || getIdFromUrl(req);

    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 401 });
    }
    if (!auth?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const is_read = body?.is_read === false ? false : true;

    const { data, error: updErr } = await supabase
      .from("notifications")
      .update({ is_read })
      .eq("id", id)
      .eq("recipient_user_id", auth.user.id)
      .select("id, is_read")
      .maybeSingle();

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Notificación no encontrada o sin permisos" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      is_read: data.is_read,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Unhandled server error", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}