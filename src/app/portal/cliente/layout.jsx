import { cookies, headers } from "next/headers";
import ClienteLayoutClient from "./ClienteLayoutClient";

export const dynamic = "force-dynamic";

async function getBaseUrl() {
  const h = await headers();

  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ||
    "localhost:3000";

  const proto =
    h.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}

export default async function ClienteLayout({ children }) {
  const baseUrl = await getBaseUrl();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let initialClient = null;

  try {
    const res = await fetch(`${baseUrl}/api/cliente/me`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      initialClient = data?.client || null;
    }
  } catch {
    initialClient = null;
  }

  return (
    <ClienteLayoutClient initialClient={initialClient}>
      {children}
    </ClienteLayoutClient>
  );
}