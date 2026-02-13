"use client";

export const dynamic = "force-dynamic";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ClienteLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = useMemo(
    () => [
      { href: "/portal/cliente/dashboard", label: "Inicio" },
      { href: "/portal/cliente/pedidos/nuevo", label: "Crear pedido" },
      { href: "/portal/cliente/pedidos", label: "Mis pedidos" },
    ],
    []
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/portal");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Topbar móvil */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border px-3 py-2 text-sm transition"
            style={{ borderColor: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            ☰
          </button>

          <div className="text-sm font-medium">Portal · Cliente</div>

          <button
            onClick={logout}
            className="rounded-xl border px-3 py-2 text-sm transition"
            style={{ borderColor: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            type="button"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-[150px] border-r border-black/10 bg-white">
          <div className="p-6">
            <div className="text-xs text-black/60">Portal</div>
            <div className="mt-1 text-lg font-semibold text-black">Cliente</div>

            <nav className="mt-6 grid gap-2">
              {links.map((l) => {
                const active = pathname === l.href;

                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className={cx(
                      "rounded-2xl border px-4 py-3 text-sm transition",
                      active
                        ? "text-white"
                        : "text-black"
                    )}
                    style={{
                      borderColor: BRAND_GREEN,
                      backgroundColor: active ? BRAND_GREEN : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = BRAND_GREEN;
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#000";
                      }
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                    }}
                  >
                    {l.label}
                  </a>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="mt-6 w-full rounded-2xl border px-4 py-3 text-sm transition"
              style={{ borderColor: BRAND_GREEN }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BRAND_GREEN;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#000";
              }}
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Drawer móvil */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] border-r border-black/10 bg-white">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-black/60">Portal</div>
                    <div className="mt-1 text-lg font-semibold text-black">
                      Cliente
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-xl border px-3 py-2 text-sm transition"
                    style={{ borderColor: BRAND_GREEN }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <nav className="mt-6 grid gap-2">
                  {links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      className="rounded-2xl border px-4 py-3 text-sm transition"
                      style={{ borderColor: BRAND_GREEN }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = BRAND_GREEN;
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#000";
                      }}
                    >
                      {l.label}
                    </a>
                  ))}
                </nav>

                <button
                  onClick={logout}
                  className="mt-6 w-full rounded-2xl border px-4 py-3 text-sm transition"
                  style={{ borderColor: BRAND_GREEN }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_GREEN;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#000";
                  }}
                  type="button"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
