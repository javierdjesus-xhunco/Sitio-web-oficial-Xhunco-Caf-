import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "Solo disponible en desarrollo." },
      { status: 403 }
    );
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion =
    process.env.WHATSAPP_GRAPH_VERSION || "v25.0";

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID.",
      },
      { status: 500 }
    );
  }

  const fields = [
    "id",
    "display_phone_number",
    "verified_name",
    "code_verification_status",
    "platform_type",
    "quality_rating",
  ].join(",");

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}?fields=${encodeURIComponent(
        fields
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(
      {
        ok: response.ok,
        status: response.status,
        data,
      },
      {
        status: response.ok ? 200 : response.status,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "phone_status_network_error",
        message:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}