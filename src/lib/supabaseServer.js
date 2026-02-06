import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!anon) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(url, anon, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try { cookieStore.set({ name, value, ...options }); } catch {}
      },
      remove(name, options) {
        try { cookieStore.set({ name, value: "", ...options, maxAge: 0 }); } catch {}
      },
    },
  });
}
