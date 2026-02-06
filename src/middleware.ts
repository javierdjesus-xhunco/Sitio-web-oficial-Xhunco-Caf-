import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getBasePathByRole(role?: string | null) {
  if (role === "super_admin") return "/portal/super-admin";
  if (role === "admin") return "/portal/admin";
  if (role === "cliente") return "/portal/cliente";
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo protegemos rutas del portal
  if (!pathname.startsWith("/portal")) {
    return NextResponse.next();
  }

  // Permite assets internos
  if (
    pathname.startsWith("/portal/_next") ||
    pathname.startsWith("/portal/favicon") ||
    pathname.startsWith("/portal/assets")
  ) {
    return NextResponse.next();
  }

  // Crear response "passthrough" para que Supabase pueda setear cookies si lo requiere
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  // 1) Validar sesión
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2) Leer rol desde profiles (RLS ya permite leer su propio perfil)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const base = getBasePathByRole(profile?.role ?? null);

  // Si por alguna razón no hay rol, mandamos a login
  if (!base) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3) Si entra a otra sección, lo regresamos a la suya
  // Ej: un "cliente" intentando /portal/super-admin/...
  if (!pathname.startsWith(base)) {
    const url = req.nextUrl.clone();
    url.pathname = `${base}/dashboard`;
    return NextResponse.redirect(url);
  }

  return res;
}

// Protege todo /portal/*
export const config = {
  matcher: ["/portal/:path*"],
};
