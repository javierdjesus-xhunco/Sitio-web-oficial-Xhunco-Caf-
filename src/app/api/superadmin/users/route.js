import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    // sesión del que llama (cookies)
    const supabase = await supabaseServer();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // validar super_admin
    const { data: me, error: meErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (meErr || me?.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // payload
    const body = await req.json().catch(() => ({}));
    const {
      role,
      email,
      password,

      first_name,
      middle_name,
      last_name_paterno,
      last_name_materno,
      phone,

      business_name,
      street,
      ext_number,
      int_number,
      neighborhood,
      municipality,
      state,
      postal_code,
      price_tier,
    } = body;

    // validaciones base
    if (!role || !email) {
      return NextResponse.json({ error: "Faltan role/email" }, { status: 400 });
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
      const tier = String(price_tier || "").trim();
      if (!allowedTiers.includes(tier)) {
        return NextResponse.json({ error: "Tipo de precio inválido" }, { status: 400 });
      }
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1) Buscar si el usuario ya existe en Auth
    const { data: existingList, error: listErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (listErr) {
      console.error("listUsers error:", listErr);
      return NextResponse.json({ error: listErr.message }, { status: 400 });
    }

    const existingUser = (existingList?.users || []).find(
      (u) => String(u.email || "").toLowerCase() === cleanEmail
    );

    let userId = existingUser?.id;

    // 2) Si NO existe, crear Auth user (requiere password)
    if (!userId) {
      if (!password) {
        return NextResponse.json({ error: "Falta password para usuario nuevo" }, { status: 400 });
      }

      const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: String(password),
          email_confirm: true,
        });

      if (createErr) {
        console.error("createUser error:", createErr);
        return NextResponse.json({ error: createErr.message }, { status: 400 });
      }

      userId = created?.user?.id;
    } else {
      // Si YA existe, opcionalmente permitir setear password
      // (si mandas password, lo actualizamos)
      if (password) {
        const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: String(password),
        });
        if (updErr) {
          console.error("updateUserById password error:", updErr);
          return NextResponse.json({ error: updErr.message }, { status: 400 });
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "No se pudo resolver user_id" }, { status: 500 });
    }

    // 3) Upsert profile (si existe, actualiza)
    const { error: profileErr } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: cleanEmail,
        role,
        first_name: String(first_name).trim(),
        middle_name: middle_name ? String(middle_name).trim() : null,
        last_name_paterno: String(last_name_paterno).trim(),
        last_name_materno: String(last_name_materno).trim(),
        phone: phone ? String(phone).trim() : null,
        active: true,
      },
      { onConflict: "id" }
    );

    if (profileErr) {
      console.error("profiles upsert error:", profileErr);
      return NextResponse.json({ error: profileErr.message }, { status: 400 });
    }

    // 4) Si es cliente: upsert clients (si existe, actualiza tier/dirección)
   // 4) Si es cliente: crear/actualizar clients sin depender de onConflict
if (role === "cliente") {
  const owner_name = [
    first_name,
    middle_name,
    last_name_paterno,
    last_name_materno,
  ]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter((s) => s.length > 0)
    .join(" ");

  const address = [
    street ? `Calle ${String(street).trim()}` : null,
    ext_number ? `No. ${String(ext_number).trim()}` : null,
    int_number ? `Int. ${String(int_number).trim()}` : null,
    neighborhood ? `Col. ${String(neighborhood).trim()}` : null,
    municipality ? `Mun. ${String(municipality).trim()}` : null,
    state ? `Estado ${String(state).trim()}` : null,
    postal_code ? `CP ${String(postal_code).trim()}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const clientPayload = {
    // IMPORTANTE: si tu columna id NO tiene default, esto evita que falle
    id: crypto.randomUUID(),

    user_id: userId,
    email: cleanEmail,

    business_name: String(business_name).trim(),
    owner_name,          // ✅ campo legacy requerido
    address,             // ✅ campo legacy requerido

    phone: phone ? String(phone).trim() : null,

    owner_first_name: String(first_name).trim(),
    owner_middle_name: middle_name ? String(middle_name).trim() : null,
    owner_last_name_paterno: String(last_name_paterno).trim(),
    owner_last_name_materno: String(last_name_materno).trim(),

    street: street ? String(street).trim() : null,
    ext_number: ext_number ? String(ext_number).trim() : null,
    int_number: int_number ? String(int_number).trim() : null,
    neighborhood: neighborhood ? String(neighborhood).trim() : null,
    municipality: municipality ? String(municipality).trim() : null,
    state: state ? String(state).trim() : null,
    postal_code: postal_code ? String(postal_code).trim() : null,

    price_tier: String(price_tier).trim(),
  };

  // 1) update por user_id (sin tocar id)
  const { data: updatedRows, error: updErr } = await supabaseAdmin
    .from("clients")
    .update({ ...clientPayload, id: undefined }) // no intentes cambiar id en update
    .eq("user_id", userId)
    .select("user_id");

  if (updErr) {
    console.error("clients update error:", updErr);
    return NextResponse.json({ error: updErr.message }, { status: 400 });
  }

  // 2) si no existía, insert
  if (!updatedRows || updatedRows.length === 0) {
    const { error: insErr } = await supabaseAdmin.from("clients").insert(clientPayload);
    if (insErr) {
      console.error("clients insert error:", insErr);
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }
  }
}

    return NextResponse.json({ ok: true, user_id: userId, existed: Boolean(existingUser) });
  } catch (e) {
    console.error("API /superadmin/users error:", e);
    return NextResponse.json(
      { error: e?.message || String(e) || "Error inesperado" },
      { status: 500 }
    );
  }
}
