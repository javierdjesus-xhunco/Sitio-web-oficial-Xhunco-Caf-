"use client";

export const dynamic = "force-dynamic";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Home, PlusCircle, Package, LogOut, ClipboardList } from "lucide-react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

// ✅ Ajusta aquí el ancho del menú desktop
const SIDEBAR_W = 280; // antes 260
const DRAWER_W = 360; // max drawer móvil

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ClienteLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [client, setClient] = useState(null);

  // ✅ para cache-busting del logo (si cambia)
  const cacheKeyRef = useRef(String(Date.now()));
  const abortRef = useRef(null);

  const links = useMemo(
    () => [
      { href: "/portal/cliente/dashboard", label: "Inicio", icon: Home },
      { href: "/portal/cliente/pedidos/nuevo", label: "Crear Pedido", icon: PlusCircle },
      { href: "/portal/cliente/pedidos", label: "Mis Pedidos", icon: Package },
      { href: "/portal/cliente/suministros/solicitudes", label: "Mis Solicitudes", icon: ClipboardList },
    ],
    []
  );

  // ✅ Cerrar drawer al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ✅ Cargar cliente una sola vez, con abort
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/cliente/me", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));
        if (!mounted) return;

        if (!res.ok) {
          setClient(null);
          return;
        }
        setClient(data?.client || null);
      } catch (e) {
        if (!mounted) return;
        if (e?.name !== "AbortError") setClient(null);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/portal");
      router.refresh();
    }
  }, [router]);

  const logoSrc = useMemo(() => {
    return client?.logo_url ? `${client.logo_url}?v=${cacheKeyRef.current}` : null;
  }, [client?.logo_url]);

  const MenuLinks = useMemo(() => {
    return links.map((l) => {
      const active = pathname === l.href;
      const Icon = l.icon;

      return (
        <a
          key={l.href}
          href={l.href}
          className={cx(
            "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
            active ? "text-white" : "text-black",
            !active && "hover:bg-[rgba(49,87,44,0.10)]"
          )}
          style={{
            borderColor: BRAND_GREEN,
            backgroundColor: active ? BRAND_GREEN : "transparent",
          }}
          onMouseDown={(e) => {
            // ✅ solo efecto visual, no setState
            e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
            e.currentTarget.style.color = "#fff";
          }}
          onMouseUp={(e) => {
            // regresar al estado correcto
            e.currentTarget.style.backgroundColor = active ? BRAND_GREEN : "rgba(49,87,44,0.10)";
            e.currentTarget.style.color = active ? "#fff" : "#000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = active ? BRAND_GREEN : "transparent";
            e.currentTarget.style.color = active ? "#fff" : "#000";
          }}
        >
          <Icon size={18} />
          {l.label}
        </a>
      );
    });
  }, [links, pathname]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ✅ Topbar móvil */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border px-3 py-2 text-sm transition hover:bg-[rgba(49,87,44,0.10)]"
            style={{ borderColor: BRAND_GREEN }}
            type="button"
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className="text-sm font-medium">Portal · Cliente</div>

          {/* spacer */}
          <div className="w-[44px]" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-none">
        {/* ✅ Sidebar desktop */}
        <aside
          className="hidden lg:block border-r border-black/10 bg-white"
          style={{ width: SIDEBAR_W }}
        >
          <div className="sticky top-0 h-[100dvh] overflow-y-auto">
            {/* flex-col para empujar footer abajo */}
            <div className="p-6 min-h-[100dvh] flex flex-col">
              <div className="text-xs text-black/60">Portal</div>

              {/* Logo negocio */}
              <div className="mt-8 flex flex-col items-center gap-4">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Logo del negocio"
                    className="h-32 w-32 object-contain"
                    loading="eager"
                  />
                ) : (
                  <div
                    className="h-32 w-32 flex items-center justify-center text-2xl font-semibold"
                    style={{ color: BRAND_GREEN }}
                  >
                    C
                  </div>
                )}
              </div>

              <nav className="mt-10 grid gap-3">{MenuLinks}</nav>

              {/* ✅ Footer pegado abajo */}
              <div className="mt-auto pt-8">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition hover:bg-[rgba(49,87,44,0.10)]"
                  style={{ borderColor: BRAND_GREEN }}
                  type="button"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>

                <div className="mt-6 flex justify-center">
                  <img
                    src="/logo-xhunco.png"
                    alt="Xhunco"
                    className="h-10 w-auto object-contain opacity-80"
                    loading="lazy"
                  />
                </div>

                <div className="h-6" />
              </div>
            </div>
          </div>
        </aside>

        {/* ✅ Drawer móvil */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

            <div
              className="absolute left-0 top-0 h-[100dvh] w-[90%] border-r border-black/10 bg-white overflow-y-auto"
              style={{ maxWidth: DRAWER_W }}
            >
              <div className="p-5 min-h-[100dvh] flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-black/60">Portal</div>

                    <div className="mt-4 flex items-center gap-3">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt="Logo del negocio"
                          className="h-20 w-20 object-contain"
                          loading="eager"
                        />
                      ) : (
                        <div
                          className="h-20 w-20 flex items-center justify-center text-xl font-semibold"
                          style={{ color: BRAND_GREEN }}
                        >
                          C
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-xl border px-3 py-2 text-sm transition hover:bg-[rgba(49,87,44,0.10)]"
                    style={{ borderColor: BRAND_GREEN }}
                    type="button"
                    aria-label="Cerrar menú"
                  >
                    ✕
                  </button>
                </div>

                <nav className="mt-6 grid gap-3">{MenuLinks}</nav>

                {/* ✅ Footer pegado abajo */}
                <div className="mt-auto pt-6">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition hover:bg-[rgba(49,87,44,0.10)]"
                    style={{ borderColor: BRAND_GREEN }}
                    type="button"
                  >
                    <LogOut size={18} />
                    Cerrar sesión
                  </button>

                  <div className="mt-6 flex justify-center">
                    <img
                      src="/logo-xhunco.png"
                      alt="Xhunco"
                      className="h-10 w-auto object-contain opacity-80"
                      loading="lazy"
                    />
                  </div>

                  <div className="h-8" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Contenido */}
        <main className="flex-1 w-full min-w-0 px-4 pt-4 pb-8 md:px-8 md:pt-6 md:pb-10 lg:pt-6">
          <div className="w-full max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}