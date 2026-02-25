"use client";

export const dynamic = "force-dynamic";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import NotificationsBell from "@/components/NotificationsBell";
import { Home, PlusCircle, Package, LogOut } from "lucide-react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ClienteLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState(null);
  const [cacheKey] = useState(() => String(Date.now()));

  const links = useMemo(
    () => [
      {
        href: "/portal/cliente/dashboard",
        label: "Inicio",
        icon: Home,
      },
      {
        href: "/portal/cliente/pedidos/nuevo",
        label: "Crear pedido",
        icon: PlusCircle,
      },
      {
        href: "/portal/cliente/pedidos",
        label: "Mis pedidos",
        icon: Package,
      },
    ],
    []
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch("/api/cliente/me", { method: "GET" });
        const data = await res.json().catch(() => ({}));
        if (!alive) return;

        if (!res.ok) {
          setClient(null);
          return;
        }

        setClient(data?.client || null);
      } catch {
        if (alive) setClient(null);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/portal");
      router.refresh();
    }
  };

  const logoSrc = client?.logo_url ? `${client.logo_url}?v=${cacheKey}` : null;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ✅ Topbar móvil: SOLO botón ☰ + título */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border px-3 py-2 text-sm transition"
            style={{ borderColor: BRAND_GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            type="button"
          >
            ☰
          </button>

          <div className="text-sm font-medium">Portal · Cliente</div>

          {/* ✅ Spacer para centrar el título sin agregar botones */}
          <div className="w-[44px]" />
        </div>
      </header>

      {/* ✅ Wrapper responsivo: permite que el contenido “respire” en pantallas chicas,
          y mantiene max-width en pantallas grandes */}
      <div className="mx-auto flex w-full max-w-[1400px] px-0 lg:px-4">
        {/* Sidebar desktop */}
        {/* ✅ Sticky: el menú acompaña al hacer scroll
            ✅ h-[100dvh] para móviles modernos / barra dinámica
            ✅ overflow para que si crece, el menú scrollee dentro sin romper */}
        <aside className="hidden lg:block w-[220px] border-r border-black/10 bg-white">
          <div className="sticky top-0 h-[100dvh] overflow-y-auto">
            <div className="p-6">
              <div className="text-xs text-black/60">Portal</div>

              {/* LOGO MÁS GRANDE SIN BORDE */}
              <div className="mt-8 flex flex-col items-center gap-4">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Logo del negocio"
                    className="h-32 w-32 object-contain"
                  />
                ) : (
                  <div
                    className="h-32 w-32 flex items-center justify-center text-2xl font-semibold"
                    style={{ color: BRAND_GREEN }}
                  >
                    C
                  </div>
                )}

                <NotificationsBell />
              </div>

              <nav className="mt-10 grid gap-3">
                {links.map((l) => {
                  const active = pathname === l.href;
                  const Icon = l.icon;

                  return (
                    <a
                      key={l.href}
                      href={l.href}
                      className={cx(
                        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                        active ? "text-white" : "text-black"
                      )}
                      style={{
                        borderColor: BRAND_GREEN,
                        backgroundColor: active ? BRAND_GREEN : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!active)
                          e.currentTarget.style.backgroundColor =
                            "rgba(49,87,44,0.10)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                        e.currentTarget.style.color = "#fff";
                      }}
                    >
                      <Icon size={18} />
                      {l.label}
                    </a>
                  );
                })}
              </nav>

              <button
                onClick={logout}
                className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition"
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
                <LogOut size={18} />
                Cerrar sesión
              </button>

              {/* ✅ Extra padding inferior para que el último botón no quede “pegado” */}
              <div className="h-6" />
            </div>
          </div>
        </aside>

        {/* Drawer móvil (menú lateral) */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

            {/* ✅ Drawer con scroll interno */}
            <div className="absolute left-0 top-0 h-[100dvh] w-[86%] max-w-[320px] border-r border-black/10 bg-white overflow-y-auto">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-black/60">Portal</div>

                    <div className="mt-4 flex items-center gap-3">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt="Logo del negocio"
                          className="h-20 w-20 object-contain"
                        />
                      ) : (
                        <div
                          className="h-20 w-20 flex items-center justify-center text-xl font-semibold"
                          style={{ color: BRAND_GREEN }}
                        >
                          C
                        </div>
                      )}

                      <NotificationsBell />
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

                <nav className="mt-6 grid gap-3">
                  {links.map((l) => {
                    const Icon = l.icon;
                    return (
                      <a
                        key={l.href}
                        href={l.href}
                        className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition"
                        style={{ borderColor: BRAND_GREEN }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(49,87,44,0.10)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.backgroundColor = BRAND_GREEN_DARK;
                          e.currentTarget.style.color = "#fff";
                        }}
                      >
                        <Icon size={18} />
                        {l.label}
                      </a>
                    );
                  })}
                </nav>

                <button
                  onClick={logout}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition"
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
                  <LogOut size={18} />
                  Cerrar sesión
                </button>

                <div className="h-8" />
              </div>
            </div>
          </div>
        )}

        {/* Contenido */}
        {/* ✅ min-w-0 evita desbordes horizontales en grids/tablas */}
        {/* ✅ padding responsivo: compacto en móvil, amplio en desktop */}
        <main className="flex-1 min-w-0 px-4 py-6 md:px-6 md:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}