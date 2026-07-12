import { NextResponse } from "next/server";
import { sendWhatsAppText } from "@/lib/whatsapp";

export async function GET() {
  const result = await sendWhatsAppText({
    to: process.env.XHUNCO_WHATSAPP_ADMIN_PHONE,
    message: "Prueba de WhatsApp desde Xhunco Portal ✅",
  });

  return NextResponse.json(result);
}