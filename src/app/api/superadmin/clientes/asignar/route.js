// app/api/superadmin/clientes/asignar/route.js

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    const supabase = await supabaseServer();

    // validar sesión
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // validar super admin
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!me || me.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();

    const client_id = body.client_id;
    const distributor_id = body.distributor_id;
    const force_replace = body.force_replace === true;

    if (!client_id || !distributor_id) {
      return NextResponse.json(
        { error: "client_id y distributor_id requeridos" },
        { status: 400 }
      );
    }

    // revisar si ya existe asignación
    const { data: existing } = await supabaseAdmin
      .from("distributor_clients")
      .select("id, distributor_id")
      .eq("client_id", client_id)
      .maybeSingle();

    // si existe y NO autorizó reemplazo
    if (existing && !force_replace) {
      const { data: dist } = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name_paterno")
        .eq("id", existing.distributor_id)
        .maybeSingle();

      const name = dist
        ? `${dist.first_name || ""} ${dist.last_name_paterno || ""}`.trim()
        : "otro distribuidor";

      return NextResponse.json({
        already_assigned: true,
        current_distributor_name: name,
      });
    }

    // si existe y sí autorizó reemplazo
    if (existing) {
      await supabaseAdmin
        .from("distributor_clients")
        .delete()
        .eq("client_id", client_id);
    }

    // insertar nueva asignación
    const { error } = await supabaseAdmin
      .from("distributor_clients")
      .insert({
        client_id,
        distributor_id,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      replaced: !!existing,
    });

  } catch (e) {
    return NextResponse.json(
      { error: e.message || "Error inesperado" },
      { status: 500 }
    );
  }
}