import { cookies, headers } from "next/headers";
import ClienteDashboardClient from "./ClienteDashboardClient";

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

export default async function ClienteDashboardPage() {
  const baseUrl = await getBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let initialData = {
    first_name: "Usuario",
    business_name: "",
    months: [],
    last_order: null,
    pendientes_pedido: { count: 0, total: 0 },
    pendientes_pago: { count: 0, total: 0 },
    pendientes: { count: 0, total: 0 },
    products: { top: [], bottom: [] },
  };

  try {
    const res = await fetch(`${baseUrl}/api/cliente/dashboard`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      initialData = {
        first_name: String(data?.first_name || "Usuario"),
        business_name: data?.business_name || "",
        months: Array.isArray(data?.months) ? data.months : [],
        last_order: data?.last_order || null,
        pendientes_pedido: data?.pendientes_pedido || { count: 0, total: 0 },
        pendientes_pago: data?.pendientes_pago || { count: 0, total: 0 },
        pendientes: data?.pendientes || { count: 0, total: 0 },
        products: {
          top: Array.isArray(data?.products?.top) ? data.products.top : [],
          bottom: Array.isArray(data?.products?.bottom) ? data.products.bottom : [],
        },
      };
    }
  } catch {}

  return <ClienteDashboardClient initialData={initialData} />;
}