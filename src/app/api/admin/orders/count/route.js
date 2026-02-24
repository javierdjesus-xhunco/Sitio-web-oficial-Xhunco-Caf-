import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function safeStr(x) {
  return String(x ?? "").trim();
}

export async function GET(req) {
  try {
    const supabase = await supabaseServer();

    // 🔐 1) Autenticación
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 401 });
    }
    if (!auth?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 🔐 2) Verificar rol
    const { data: profRows, error: profErr } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", auth.user.id)
      .limit(1);

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 403 });
    }

    const prof = profRows?.[0];
    if (!prof?.active) {
      return NextResponse.json({ error: "Usuario inactivo o sin perfil" }, { status: 403 });
    }

    const role = safeStr(prof.role);
    if (!["admin", "superadmin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // 📌 3) Leer filtros
    const { searchParams } = new URL(req.url);
    const status = safeStr(searchParams.get("status") || "all");
    const client_user_id = safeStr(searchParams.get("client_user_id") || "");

    // 🧠 4) Construir query de conteo (solo COUNT, sin data)
    let query = supabase
      .from("orders")
      .select("id", { count: "exact", head: true });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (client_user_id) {
      query = query.eq("client_user_id", client_user_id);
    }

    const { count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      total: Number(count || 0),
    });

  } catch (e) {
    return NextResponse.json(
      {
        error: "Unhandled server error",
        message: String(e?.message || e),
      },
      { status: 500 }
    );
  }
}