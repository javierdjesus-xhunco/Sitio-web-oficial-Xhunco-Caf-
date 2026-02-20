import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function escCSV(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req) {
  const supabase = await supabaseServer();

  // Auth
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Role check
  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  const prof = profRows?.[0];
  if (!prof?.active) return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
  if (!["admin", "superadmin"].includes(prof.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  let query = supabase
    .from("suministros_xhunco")
    .select("sku, nombre, categoria, presentacion, stock")
    .eq("activo", true)
    .order("categoria", { ascending: true })
    .order("nombre", { ascending: true });

  if (q) query = query.or(`sku.ilike.%${q}%,nombre.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data || [];

  const header = ["SKU", "Nombre", "Categoría", "Presentación", "Stock"];
  const lines = [header.map(escCSV).join(",")];

  for (const r of rows) {
    lines.push(
      [r.sku, r.nombre, r.categoria, r.presentacion, Number(r.stock ?? 0)]
        .map(escCSV)
        .join(",")
    );
  }

  const csv = lines.join("\n");

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const filename = `inventario_${yyyy}-${mm}-${dd}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}