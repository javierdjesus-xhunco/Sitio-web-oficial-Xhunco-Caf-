import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function toInt(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function okStatus(s) {
  return ["pendiente", "confirmada", "rechazada", "cancelada"].includes(s);
}

function buildProfileName(p) {
  if (!p) return "";
  const parts = [p.first_name, p.middle_name, p.last_name_paterno, p.last_name_materno]
    .map((x) => String(x || "").trim())
    .filter(Boolean);
  return parts.join(" ");
}

function buildClientOwnerName(c) {
  if (!c) return "";
  const direct = String(c.owner_name || "").trim();
  if (direct) return direct;

  const parts = [
    c.owner_first_name,
    c.owner_middle_name,
    c.owner_last_name_paterno,
    c.owner_last_name_materno,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  return parts.join(" ");
}

export async function GET(req) {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // ✅ Role check
  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
  if (!["admin", "superadmin", "super_admin"].includes(prof?.role)) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pendiente";
  const limit = Math.min(200, Math.max(1, toInt(searchParams.get("limit"), 50)));
  const offset = Math.max(0, toInt(searchParams.get("offset"), 0));
  const client_user_id = searchParams.get("client_user_id") || "";

  const safeStatus = okStatus(status) ? status : "pendiente";

  // ✅ 1) Solicitudes
  let q = supabase
    .from("suministros_solicitudes")
    .select("id, created_at, suministro_id, client_id, qty, status, handled_by, handled_at", {
      count: "exact",
    })
    .eq("status", safeStatus)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (client_user_id) q = q.eq("client_id", client_user_id);

  const { data: rows, error: rowsErr, count } = await q;
  if (rowsErr) return NextResponse.json({ error: rowsErr.message }, { status: 400 });

  const clientIds = Array.from(new Set((rows || []).map((r) => r.client_id).filter(Boolean)));
  const suministroIds = Array.from(new Set((rows || []).map((r) => r.suministro_id).filter(Boolean)));

  // ✅ 2) Batch fetch profiles + clients + suministros
  const [
    { data: profs, error: profsErr },
    { data: clients, error: clientsErr },
    { data: sups, error: supsErr },
  ] = await Promise.all([
    clientIds.length
      ? supabase
          .from("profiles")
          .select("id, email, first_name, middle_name, last_name_paterno, last_name_materno")
          .in("id", clientIds)
      : Promise.resolve({ data: [], error: null }),

    clientIds.length
      ? supabase
          .from("clients")
          .select(
            "user_id, business_name, owner_name, owner_first_name, owner_middle_name, owner_last_name_paterno, owner_last_name_materno, email"
          )
          .in("user_id", clientIds)
      : Promise.resolve({ data: [], error: null }),

    suministroIds.length
      ? supabase.from("suministros_xhunco").select("id, nombre, sku, marca, categoria").in("id", suministroIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profsErr) return NextResponse.json({ error: profsErr.message }, { status: 400 });
  if (clientsErr) return NextResponse.json({ error: clientsErr.message }, { status: 400 });
  if (supsErr) return NextResponse.json({ error: supsErr.message }, { status: 400 });

  const profById = new Map((profs || []).map((p) => [p.id, p]));
  const clientByUserId = new Map((clients || []).map((c) => [c.user_id, c]));
  const supById = new Map((sups || []).map((s) => [s.id, s]));

  const out = (rows || []).map((r) => {
    const p = profById.get(r.client_id) || null;
    const c = clientByUserId.get(r.client_id) || null;
    const s = supById.get(r.suministro_id) || null;

    // ✅ Cliente: profile name > client owner name > profile email > client email > —
    const profileName = buildProfileName(p);
    const ownerName = buildClientOwnerName(c);
    const bestEmail = (p?.email || c?.email || "").trim();

    const client_name = profileName || ownerName || bestEmail || "—";

    return {
      id: r.id,
      created_at: r.created_at,
      handled_at: r.handled_at,
      handled_by: r.handled_by,

      client_id: r.client_id,
      client_name,
      client_email: bestEmail || null,

      business_name: (c?.business_name || "").trim() || "—",

      suministro_id: r.suministro_id,
      qty: r.qty,
      status: r.status,

      suministro_nombre: s?.nombre || "—",
      suministro_sku: s?.sku || null,
      suministro_marca: s?.marca || null,
      suministro_categoria: s?.categoria || null,
    };
  });

  return NextResponse.json({
    items: out,
    status: safeStatus,
    limit,
    offset,
    count: typeof count === "number" ? count : null,
  });
}

export async function PATCH(req) {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
  if (!["admin", "superadmin", "super_admin"].includes(prof?.role)) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = body?.id;
  const status = body?.status;

  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  if (!["confirmada", "rechazada", "cancelada"].includes(status)) {
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("suministros_solicitudes")
    .update({
      status,
      handled_by: auth.user.id,
      handled_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, status, handled_by, handled_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ item: data });
}