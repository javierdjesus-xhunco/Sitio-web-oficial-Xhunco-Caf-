import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(req) {
  try {
    const body = await req.json();

    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Ingresa tu contraseña actual." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña debe ser diferente a la actual." },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión nuevamente." },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "No se encontró el correo del usuario." },
        { status: 400 }
      );
    }

    const verifier = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { error: verifyError } = await verifier.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "No se pudo actualizar la contraseña." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Error interno al cambiar la contraseña." },
      { status: 500 }
    );
  }
}