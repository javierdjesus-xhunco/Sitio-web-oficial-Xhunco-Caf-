import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function clean(value) {
  return String(value ?? "").trim();
}

function buildFullName(parts = []) {
  return parts.map(clean).filter(Boolean).join(" ");
}

function buildFullAddress(client) {
  const detailedAddress = [
    client?.street,
    client?.ext_number ? `No. ${client.ext_number}` : null,
    client?.int_number ? `Int. ${client.int_number}` : null,
    client?.neighborhood,
    client?.municipality,
    client?.state,
    client?.postal_code ? `C.P. ${client.postal_code}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  // En tu caso damos prioridad a la columna general "address"
  return clean(client?.address || detailedAddress);
}

function formatPriceTier(priceTier) {
  const labels = {
    precio_publico: "Precio público",
    precio_web: "Precio web",
    precio_medio: "Precio medio",
    precio_mayoreo: "Precio mayoreo",
  };

  return labels[priceTier] || "No asignado";
}

function formatRole(role) {
  const labels = {
    cliente: "Cliente",
    admin: "Admin",
    super_admin: "Super admin",
    distribuidor: "Distribuidor",
  };

  return labels[role] || "Cliente";
}

export async function GET() {
  try {
    const supabase = await supabaseServer();

    const { data: auth, error: authErr } = await supabase.auth.getUser();

    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = auth.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        middle_name,
        last_name_paterno,
        last_name_materno,
        phone,
        email,
        role,
        active
      `
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || "Error consultando perfil" },
        { status: 500 }
      );
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select(
        `
        id,
        business_name,
        owner_first_name,
        owner_middle_name,
        owner_last_name_paterno,
        owner_last_name_materno,
        address,
        phone,
        email,
        street,
        ext_number,
        int_number,
        neighborhood,
        municipality,
        state,
        postal_code,
        price_tier,
        logo_url,
        created_at
      `
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json(
        { error: clientError.message || "Error consultando cliente" },
        { status: 500 }
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado para este usuario" },
        { status: 404 }
      );
    }

    const profileName = buildFullName([
      profile?.first_name,
      profile?.middle_name,
      profile?.last_name_paterno,
      profile?.last_name_materno,
    ]);

    const ownerName = buildFullName([
      client?.owner_first_name,
      client?.owner_middle_name,
      client?.owner_last_name_paterno,
      client?.owner_last_name_materno,
    ]);

    const finalOwnerName = ownerName || profileName;
    const fullAddress = buildFullAddress(client);

    return NextResponse.json({
      profile: {
        id: profile?.id || userId,
        full_name: profileName || finalOwnerName || "",
        first_name: profile?.first_name || "",
        middle_name: profile?.middle_name || "",
        last_name_paterno: profile?.last_name_paterno || "",
        last_name_materno: profile?.last_name_materno || "",
        phone: profile?.phone || client?.phone || "",
        email: profile?.email || client?.email || auth.user.email || "",
        role: profile?.role || "cliente",
        role_label: formatRole(profile?.role),
        active: profile?.active === true,
      },

      client: {
        id: client.id,
        business_name: client.business_name || "",
        owner_name: finalOwnerName || "",
        owner_first_name: client.owner_first_name || "",
        owner_middle_name: client.owner_middle_name || "",
        owner_last_name_paterno: client.owner_last_name_paterno || "",
        owner_last_name_materno: client.owner_last_name_materno || "",
        phone: client.phone || profile?.phone || "",
        email: client.email || profile?.email || auth.user.email || "",
        price_tier: client.price_tier || "",
        price_tier_label: formatPriceTier(client.price_tier),
        logo_url: client.logo_url || "",
        created_at: client.created_at || null,
      },

      address: {
        address: client.address || "",
        street: client.street || "",
        ext_number: client.ext_number || "",
        int_number: client.int_number || "",
        neighborhood: client.neighborhood || "",
        municipality: client.municipality || "",
        state: client.state || "",
        postal_code: client.postal_code || "",
        full_address: fullAddress || "",
      },
    });
  } catch (e) {
    console.error("GET /api/cliente/perfil error:", e);

    return NextResponse.json(
      { error: e?.message || "Error inesperado" },
      { status: 500 }
    );
  }
}