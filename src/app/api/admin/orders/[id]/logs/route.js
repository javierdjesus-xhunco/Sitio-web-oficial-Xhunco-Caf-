import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function safeStr(x) {
  return String(x ?? "").trim();
}

function getIdFromUrl(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 2] || null; // .../orders/{id}/logs
  } catch {
    return null;
  }
}

function fullName(p) {
  const n = [p?.first_name, p?.middle_name, p?.last_name_paternal, p?.last_name_maternal]
    .map((x) => safeStr(x))
    .filter(Boolean)
    .join(" ")
    .trim();
  return n || safeStr(p?.email) || safeStr(p?.id) || "—";
}

export async function GET(req, ctx) {
  const supabase = await supabaseServer();

  // Auth
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 401 });
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Role check
  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 403 });
  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });

  const role = safeStr(prof.role).toLowerCase();
  if (!["admin", "superadmin", "super_admin"].includes(role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // id
  const id = ctx?.params?.id || getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  // Logs
  const { data: logs, error: lErr } = await supabaseAdmin
    .from("order_status_logs")
    .select("id, order_id, changed_by, from_status, to_status, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 400 });

  const userIds = Array.from(new Set((logs || []).map((x) => x.changed_by).filter(Boolean)));

  // Profiles (batch)
  let profMap = new Map();
  if (userIds.length) {
    const { data: profs, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, middle_name, last_name_paternal, last_name_maternal")
      .in("id", userIds);

    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 400 });

    for (const p of profs || []) {
      profMap.set(p.id, { ...p, display_name: fullName(p) });
    }
  }

  const shaped = (logs || []).map((x) => ({
    ...x,
    actor: profMap.get(x.changed_by) || { id: x.changed_by, display_name: x.changed_by, email: "" },
  }));

  return NextResponse.json({ data: shaped });
}