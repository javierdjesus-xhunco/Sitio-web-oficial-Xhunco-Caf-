import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function safeStr(x) {
  return String(x ?? "").trim();
}

function getMonthRange(month) {
  const m = safeStr(month);

  if (!/^\d{4}-\d{2}$/.test(m)) {
    return null;
  }

  const [year, monthNumber] = m.split("-").map(Number);

  const start = new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function GET(req) {
  try {
    const supabase = await supabaseServer();

    // Autenticación
    const { data: auth, error: authErr } = await supabase.auth.getUser();

    if (authErr) {
      return NextResponse.json(
        { error: authErr.message },
        { status: 401 }
      );
    }

    if (!auth?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar rol
    const { data: profRows, error: profErr } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", auth.user.id)
      .limit(1);

    if (profErr) {
      return NextResponse.json(
        { error: profErr.message },
        { status: 403 }
      );
    }

    const prof = profRows?.[0];

    if (!prof?.active) {
      return NextResponse.json(
        { error: "Usuario inactivo o sin perfil" },
        { status: 403 }
      );
    }

    const role = safeStr(prof.role);

    if (!["admin", "superadmin", "super_admin"].includes(role)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Leer filtros
    const { searchParams } = new URL(req.url);

    const status = safeStr(searchParams.get("status") || "all");
    const client_user_id = safeStr(searchParams.get("client_user_id") || "");
    const month = safeStr(searchParams.get("month") || "");

    const monthRange = getMonthRange(month);

    // Conteo
    let query = supabase
      .from("orders")
      .select("id", { count: "exact", head: true });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (client_user_id) {
      query = query.eq("client_user_id", client_user_id);
    }

    if (monthRange) {
      query = query
        .gte("created_at", monthRange.start)
        .lt("created_at", monthRange.end);
    }

    const { count, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
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