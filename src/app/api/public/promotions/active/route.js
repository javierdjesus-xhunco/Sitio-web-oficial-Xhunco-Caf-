import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("promotions")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const item =
      (data ?? []).find((promo) => {
        const startsOk = !promo.starts_at || promo.starts_at <= now;
        const endsOk = !promo.ends_at || promo.ends_at >= now;
        return startsOk && endsOk;
      }) ?? null;

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Error al obtener promoción activa" },
      { status: 500 }
    );
  }
}