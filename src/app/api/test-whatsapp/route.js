import { NextResponse } from "next/server";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        error: "Esta ruta solo está habilitada en desarrollo.",
      },
      { status: 403 }
    );
  }

  const phone = process.env.XHUNCO_WHATSAPP_ADMIN_PHONE;

  if (!phone) {
    return NextResponse.json(
      {
        ok: false,
        error: "Falta XHUNCO_WHATSAPP_ADMIN_PHONE en .env.local",
      },
      { status: 500 }
    );
  }

  const result = await sendWhatsAppText({
    to: phone,
    message: "Prueba de WhatsApp desde Xhunco Portal ✅",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
  });
}