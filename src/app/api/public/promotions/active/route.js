import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("promotions")
      .select("*")
      .eq("active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("sort_order", { ascending: true })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({
      items: data || [],
    });
  } catch (error) {
    return NextResponse.json({
      items: [],
      error: error.message,
    });
  }
}