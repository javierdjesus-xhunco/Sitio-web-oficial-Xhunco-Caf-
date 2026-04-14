import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function clean(v) {
  return String(v ?? "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const company_name = clean(body.company_name);
    const contact_name = clean(body.contact_name);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
    const business_type = clean(body.business_type);
    const city = clean(body.city);
    const monthly_volume = clean(body.monthly_volume);
    const message = clean(body.message);

    if (!company_name || !contact_name || !email || !business_type) {
      return NextResponse.json(
        { error: "Completa los campos obligatorios." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("b2b_leads").insert({
      company_name,
      contact_name,
      email,
      phone: phone || null,
      business_type,
      city: city || null,
      monthly_volume: monthly_volume || null,
      message: message || null,
      source: "web_b2b",
      status: "nuevo",
    });

    if (error) {
      console.error("Error guardando lead B2B:", error);
      return NextResponse.json(
        { error: "No se pudo enviar tu solicitud. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Solicitud enviada correctamente.",
    });
  } catch (err) {
    console.error("Error API B2B contact:", err);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 }
    );
  }
}