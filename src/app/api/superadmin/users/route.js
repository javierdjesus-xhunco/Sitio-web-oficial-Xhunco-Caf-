import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

const BUCKET = "client-logos";

function safeTrim(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export async function POST(req) {
  try {
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

    // Payload del formulario (FormData)
    const form = await req.formData();

    const role = String(form.get("role") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const first_name = String(form.get("first_name") || "");
    const middle_name = safeTrim(form.get("middle_name"));
    const last_name_paterno = String(form.get("last_name_paterno") || "");
    const last_name_materno = String(form.get("last_name_materno") || "");
    const phone = safeTrim(form.get("phone"));

    const business_name = String(form.get("business_name") || "");
    const street = safeTrim(form.get("street"));
    const ext_number = safeTrim(form.get("ext_number"));
    const int_number = safeTrim(form.get("int_number"));
    const neighborhood = safeTrim(form.get("neighborhood"));
    const municipality = safeTrim(form.get("municipality"));
    const state = safeTrim(form.get("state"));
    const postal_code = safeTrim(form.get("postal_code"));
    const price_tier = String(form.get("price_tier") || "");

    const logo = form.get("logo"); // File | null

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

    // Crear usuario Auth con contraseña (service role)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createErr) {
      console.error("createUser error:", createErr);
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    const newUserId = created.user.id;

    // Crear profile
    const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
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

    // Si es cliente, crear clients (negocio + dirección)
    if (role === "cliente") {
      const { data: clientRow, error: clientErr } = await supabaseAdmin
        .from("clients")
        .insert({
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
          price_tier: price_tier, // <- obligatorio para cliente
          phone: phone ?? null,
          email,
        })
        .select("id")
        .single();

      if (clientErr) {
        console.error("clients insert error:", clientErr);
        return NextResponse.json({ error: clientErr.message }, { status: 400 });
      }

      const clientId = clientRow.id;

      // ✅ Subir logo si viene
      if (logo && typeof logo === "object" && "arrayBuffer" in logo) {
        const mime = logo.type || "image/png";
        const allowedMime = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedMime.includes(mime)) {
          return NextResponse.json(
            { error: "Logo inválido: solo PNG/JPG/WebP" },
            { status: 400 }
          );
        }

        const bytes = new Uint8Array(await logo.arrayBuffer());

        const ext =
          mime === "image/png" ? "png" :
          mime === "image/jpeg" ? "jpg" :
          mime === "image/webp" ? "webp" : "png";

        const path = `${clientId}/logo.${ext}`;

        const { error: uploadErr } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(path, bytes, {
            upsert: true,
            contentType: mime,
            cacheControl: "3600",
          });

        if (uploadErr) {
          console.error("logo upload error:", uploadErr);
          return NextResponse.json({ error: uploadErr.message }, { status: 400 });
        }

        const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
        const logo_url = pub?.publicUrl || null;

        if (logo_url) {
          const { error: updErr } = await supabaseAdmin
            .from("clients")
            .update({ logo_url })
            .eq("id", clientId);

          if (updErr) {
            console.error("clients logo_url update error:", updErr);
            return NextResponse.json({ error: updErr.message }, { status: 400 });
          }
        }
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
