import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normRole(v) {
  return String(v || "").toLowerCase().trim();
}

function safeStr(v) {
  return v == null ? "" : String(v).trim();
}

function normalizeNullable(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function getId(req, params) {
  const p = params?.id;
  if (p) return p;

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

async function requireSuperAdmin() {
  const supabase = await supabaseServer();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const { data: profRows, error: profErr } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", auth.user.id)
    .limit(1);

  if (profErr) {
    return {
      ok: false,
      res: NextResponse.json({ error: profErr.message }, { status: 400 }),
    };
  }

  const prof = profRows?.[0];
  if (!prof?.active) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Usuario inactivo" }, { status: 403 }),
    };
  }

  const role = normRole(prof.role);
  if (!["superadmin", "super_admin"].includes(role)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
    };
  }

  return { ok: true };
}

function cleanClientPatch(body) {
  const allowed = [
    "business_name",
    "price_tier",
    "owner_name",
    "owner_first_name",
    "owner_middle_name",
    "owner_last_name_paterno",
    "owner_last_name_materno",
    "phone",
    "email",
    "street",
    "ext_number",
    "int_number",
    "neighborhood",
    "municipality",
    "state",
    "postal_code",
    "address",
    "logo_url",
    "user_id",
  ];

  const out = {};
  for (const k of allowed) {
    if (k in (body || {})) out[k] = body[k];
  }

  if (typeof out.email === "string") out.email = out.email.trim().toLowerCase();
  if (typeof out.phone === "string") out.phone = out.phone.trim();

  for (const k of Object.keys(out)) {
    if (out[k] === "") out[k] = null;
  }

  return out;
}

function buildProfilePatchFromClientPatch(patch) {
  const out = {};

  if ("email" in patch) out.email = normalizeNullable(patch.email);
  if ("phone" in patch) out.phone = normalizeNullable(patch.phone);

  if ("owner_first_name" in patch) out.first_name = normalizeNullable(patch.owner_first_name);
  if ("owner_middle_name" in patch) out.middle_name = normalizeNullable(patch.owner_middle_name);
  if ("owner_last_name_paterno" in patch)
    out.last_name_paterno = normalizeNullable(patch.owner_last_name_paterno);
  if ("owner_last_name_materno" in patch)
    out.last_name_materno = normalizeNullable(patch.owner_last_name_materno);

  return out;
}

async function emailExistsInAuth(email, ignoreUserId = null) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    const users = data?.users || [];
    const found = users.find((u) => {
      const sameEmail = safeStr(u.email).toLowerCase() === safeStr(email).toLowerCase();
      const sameUser = ignoreUserId && u.id === ignoreUserId;
      return sameEmail && !sameUser;
    });

    if (found) return true;
    if (users.length < perPage) return false;

    page += 1;
  }
}

export async function PATCH(req, { params }) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.res;

  const id = getId(req, params);
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const patch = cleanClientPatch(body);

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
  }

  // 1) Leer cliente actual
  const { data: currentRows, error: currentErr } = await supabaseAdmin
    .from("clients")
    .select("id, user_id, email")
    .eq("id", id)
    .limit(1);

  if (currentErr) {
    return NextResponse.json({ error: currentErr.message }, { status: 400 });
  }

  const current = currentRows?.[0];
  if (!current) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const authUserId = safeStr(current.user_id) || safeStr(patch.user_id);

  if (!authUserId) {
    return NextResponse.json(
      { error: "Cliente sin user_id ligado a auth.users" },
      { status: 400 }
    );
  }

  // 2) Leer usuario real de Auth
  const { data: authUser, error: authUserErr } =
    await supabaseAdmin.auth.admin.getUserById(authUserId);

  if (authUserErr || !authUser?.user) {
    return NextResponse.json(
      {
        error:
          "No se encontró el usuario de autenticación ligado a este cliente. Revisa que clients.user_id apunte a auth.users.id.",
      },
      { status: 400 }
    );
  }

  const clientEmail = safeStr(current.email).toLowerCase();
  const authEmail = safeStr(authUser.user.email).toLowerCase();
  const nextEmail = safeStr(patch.email).toLowerCase();

  // 3) Si el email nuevo es distinto al de Auth, sincronizar Auth
  if (nextEmail && nextEmail !== authEmail) {
    try {
      const duplicated = await emailExistsInAuth(nextEmail, authUserId);
      if (duplicated) {
        return NextResponse.json(
          { error: "Ese correo ya está en uso por otro usuario" },
          { status: 409 }
        );
      }

      console.log("PATCH client id:", id);
      console.log("Resolved authUserId:", authUserId);
      console.log("Client email:", clientEmail);
      console.log("Auth email before update:", authEmail);
      console.log("Next email:", nextEmail);

      const { data: authUpdated, error: authUpdateErr } =
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          email: nextEmail,
          email_confirm: true,
        });

      console.log("Auth update result:", authUpdated, authUpdateErr);

      if (authUpdateErr) {
        return NextResponse.json(
          { error: authUpdateErr.message || "No se pudo actualizar Auth" },
          { status: 400 }
        );
      }

      const { data: authUserAfter, error: authUserAfterErr } =
        await supabaseAdmin.auth.admin.getUserById(authUserId);

      console.log(
        "Auth user after update:",
        authUserAfter?.user?.email,
        authUserAfterErr
      );

      patch.email = nextEmail;
    } catch (e) {
      return NextResponse.json(
        { error: e?.message || "No se pudo actualizar el email en Auth" },
        { status: 400 }
      );
    }
  }

  // 4) Actualizar tabla clients
  const { data: clientRows, error: clientUpdateErr } = await supabaseAdmin
    .from("clients")
    .update(patch)
    .eq("id", id)
    .select("*")
    .limit(1);

  if (clientUpdateErr) {
    return NextResponse.json({ error: clientUpdateErr.message }, { status: 400 });
  }

  const updatedClient = clientRows?.[0] || null;

  // 5) Sincronizar tabla profiles
  const profilePatch = buildProfilePatchFromClientPatch(patch);

  if (Object.keys(profilePatch).length > 0) {
    const { error: profileUpdateErr } = await supabaseAdmin
      .from("profiles")
      .update(profilePatch)
      .eq("id", authUserId);

    if (profileUpdateErr) {
      return NextResponse.json(
        {
          error:
            "Se actualizó el cliente, pero falló la sincronización de profiles: " +
            profileUpdateErr.message,
          row: updatedClient,
        },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({
    row: updatedClient,
    synced_auth_user_id: authUserId,
  });
}

export async function DELETE(req, { params }) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.res;

  const id = getId(req, params);
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const { data: currentRows, error: currentErr } = await supabaseAdmin
    .from("clients")
    .select("id, user_id")
    .eq("id", id)
    .limit(1);

  if (currentErr) {
    return NextResponse.json({ error: currentErr.message }, { status: 400 });
  }

  const current = currentRows?.[0] || null;

  const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    ok: true,
    deleted_client_id: id,
    linked_user_id: current?.user_id || null,
  });
}