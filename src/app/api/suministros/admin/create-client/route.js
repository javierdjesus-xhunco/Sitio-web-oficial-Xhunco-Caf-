import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const payload = await request.json();
    const {
      businessName,
      ownerName,
      address,
      phone,
      email,
      password,
      role,
    } = payload;

    if (!businessName || !email || !password) {
      return Response.json(
        { error: "Faltan datos obligatorios." },
        { status: 400 },
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return Response.json(
        { error: "No se pudo crear el usuario en Auth." },
        { status: 500 },
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email,
        role: role || "cliente",
      });

    if (profileError) {
      return Response.json({ error: profileError.message }, { status: 400 });
    }

    const { error: clientError } = await supabaseAdmin.from("clients").insert({
      business_name: businessName,
      owner_name: ownerName || null,
      address: address || null,
      phone: phone || null,
      user_id: userId,
    });

    if (clientError) {
      return Response.json({ error: clientError.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Error desconocido." },
      { status: 500 },
    );
  }
}