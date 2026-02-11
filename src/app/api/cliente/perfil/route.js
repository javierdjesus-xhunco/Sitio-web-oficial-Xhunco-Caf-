import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServer();

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = auth.user.id;

    const { data: client, error } = await supabase
      .from("clients")
      .select(
        `
        id,
        business_name,
        owner_name,
        phone,
        email,
        street,
        ext_number,
        int_number,
        neighborhood,
        municipality,
        state,
        postal_code
      `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Error consultando cliente" },
        { status: 500 },
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado para este usuario" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      client: {
        id: client.id,
        business_name: client.business_name,
        owner_name: client.owner_name,
        phone: client.phone,
        email: client.email,
      },
      address: {
        street: client.street || "",
        ext_number: client.ext_number || "",
        int_number: client.int_number || "",
        neighborhood: client.neighborhood || "",
        municipality: client.municipality || "",
        state: client.state || "",
        postal_code: client.postal_code || "",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Error inesperado" },
      { status: 500 },
    );
  }
}
