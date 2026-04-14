import "server-only";
import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const from = process.env.EMAIL_FROM;

if (!apiKey) {
  console.warn("SENDGRID_API_KEY no está definida");
} else {
  sgMail.setApiKey(apiKey);
}

export async function sendEmail({ to, subject, html, text }) {
  if (!apiKey) throw new Error("Falta SENDGRID_API_KEY");
  if (!from) throw new Error("Falta EMAIL_FROM");

  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!recipients.length) throw new Error("Falta destinatario");
  if (!subject) throw new Error("Falta subject");
  if (!html && !text) throw new Error("Falta html o text");

  const msg = {
    to: recipients,
    from,
    subject,
    html: html || undefined,
    text: text || undefined,
  };

  return await sgMail.send(msg);
}