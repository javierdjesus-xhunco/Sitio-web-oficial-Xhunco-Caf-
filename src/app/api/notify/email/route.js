import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const to = asArray(body?.to).filter(Boolean);
    const subject = String(body?.subject || "").trim();
    const html = String(body?.html || "").trim();
    const text = String(body?.text || "").trim();

    if (!to.length) return NextResponse.json({ error: "to requerido" }, { status: 400 });
    if (!subject) return NextResponse.json({ error: "subject requerido" }, { status: 400 });
    if (!html && !text) return NextResponse.json({ error: "html o text requerido" }, { status: 400 });

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM;

    if (!host || !user || !pass || !from) {
      return NextResponse.json(
        { error: "Faltan variables SMTP_* o EMAIL_FROM" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 true, 587 false
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to: to.join(","),
      subject,
      html: html || undefined,
      text: text || undefined,
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo enviar email", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
