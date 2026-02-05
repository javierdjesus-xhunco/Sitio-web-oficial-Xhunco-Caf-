import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const cookieStore = await cookies(); // 👈 IMPORTANTE: await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          // cookieStore.get existe en Next (pero ahora sí ya no será Promise)
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          // en algunos contextos puede ser read-only; protegemos
          try {
            cookieStore.set({ name, value, ...options });
          } catch {}
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {}
        },
      },
    }
  );
}
