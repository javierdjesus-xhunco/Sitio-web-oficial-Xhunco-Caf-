import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("[env-check] NEXT_PUBLIC_SUPABASE_URL is missing in build/runtime");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("[env-check] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in build/runtime");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("[env-check] SUPABASE_SERVICE_ROLE_KEY is missing in build/runtime");
}

export async function POST(req) {
  try {
    // ✅ crea el cliente admin aquí (ya NO se crea al importar el archivo)
    const admin = supabaseAdmin();

    // Identificar al usuario que hace la petición (sesión por cookies)
    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Validar que sea super_admin
    const { data: me, error: meErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (meErr || me?.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Payload del formulario
    const body = await req.json();
    const {
      role, email, password,
      first_name, middle_name, last_name_paterno, last_name_materno, phone,
      business_name, street, ext_number, int_number, neighborhood, municipality, state,
      postal_code, price_tier
    } = body;

    if (!role || !email || !password) {
      return NextResponse.json({ error: "Faltan role/email/password" }, { status: 400 });
    }
    if (!["super_admin", "admin", "cliente"].includes(role)) {
      return NextResponse.json({ error: "Role inválido" }, { status: 400 });
    }
    if (!first_name || !last_name_paterno || !last_name_materno) {
      return NextResponse.json({ error: "Faltan nombres/apellidos" }, { status: 400 });
    }
    if (role === "cliente" && !business_name) {
      return NextResponse.json({ error: "Para cliente es obligatorio negocio" }, { status: 400 });
    }

    const allowedTiers = ["precio_web", "precio_publico", "precio_medio", "precio_mayoreo"];
    if (role === "cliente") {
      const tier = (price_tier || "").trim();
      if (!allowedTiers.includes(tier)) {
        return NextResponse.json({ error: "Tipo de precio inválido" }, { status: 400 });
      }
    }

    // ✅ aquí cambia: ya NO es supabaseAdmin.auth..., ahora es admin.auth...
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createErr) {
      console.error("createUser error:", createErr);
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    const newUserId = created.user.id;

    // ✅ aquí cambia: supabaseAdmin.from -> admin.from
    const { error: profileErr } = await admin.from("profiles").insert({
      id: newUserId,
      email,
      role,
      first_name,
      middle_name: middle_name ?? null,
      last_name_paterno,
      last_name_materno,
      phone: phone ?? null,
      active: true,
    });

    if (profileErr) {
      console.error("profiles insert error:", profileErr);
      return NextResponse.json({ error: profileErr.message }, { status: 400 });
    }

    // Si es cliente, crear clients
    if (role === "cliente") {
      const { error: clientErr } = await admin.from("clients").insert({
        user_id: newUserId,
        business_name,
        owner_first_name: first_name,
        owner_middle_name: middle_name ?? null,
        owner_last_name_paterno: last_name_paterno,
        owner_last_name_materno: last_name_materno,
        street: street ?? null,
        ext_number: ext_number ?? null,
        int_number: int_number ?? null,
        neighborhood: neighborhood ?? null,
        municipality: municipality ?? null,
        state: state ?? null,
        postal_code: postal_code ?? null,
        price_tier: price_tier,
        phone: phone ?? null,
        email,
      });

      if (clientErr) {
        console.error("clients insert error:", clientErr);
        return NextResponse.json({ error: clientErr.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true, user_id: newUserId });
  } catch (e) {
    console.error("API /superadmin/users error:", e);
    return NextResponse.json(
      { error: e?.message || String(e) || "Error inesperado" },
      { status: 500 }
    );
  }
}
