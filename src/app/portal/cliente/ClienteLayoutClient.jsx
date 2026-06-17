"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  PlusCircle,
  Package,
  LogOut,
  ClipboardList,
  User,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_DARK = "#25441f";

const SIDEBAR_W = 280;
const SIDEBAR_COLLAPSED_W = 80;
const DRAWER_W = 360;
const SYSTEM_VERSION = "1.0.0";
const SYSTEM_ENV = "Portal Cliente";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ClienteLayoutClient({ children, initialClient }) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [client] = useState(initialClient || null);

  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const expanded = !collapsed || hovering;

  const openBtnRef = useRef(null);

  const links = useMemo(
    () => [
      { href: "/portal/cliente/dashboard", label: "Inicio", icon: Home },
      { href: "/portal/cliente/perfil", label: "Mi Perfil", icon: User },
      { href: "/portal/cliente/pedidos/nuevo", label: "Crear Pedido", icon: PlusCircle },
      { href: "/portal/cliente/pedidos", label: "Mis Pedidos", icon: Package },
      { href: "/portal/cliente/suministros/solicitudes", label: "Mis Solicitudes", icon: ClipboardList },
    ],
    []
  );

  const closeMenu = useCallback(() => {
    setOpen(false);
    setTimeout(() => openBtnRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/portal");
      router.refresh();
    }
  }, [router]);

  const logoSrc = useMemo(() => {
    return client?.logo_url || null;
  }, [client?.logo_url]);

  const businessName = useMemo(() => {
    return client?.business_name || "Cliente";
  }, [client?.business_name]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Topbar móvil */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-black/10">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            ref={openBtnRef}
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-black/[0.05] active:scale-[0.97] transition"
            aria-label="Abrir menú"
          >
            <Menu size={20} strokeWidth={2.2} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-[12px] font-semibold tracking-[0.18em]"
                style={{ color: BRAND_GREEN }}
              >
                XHUNCO
              </span>
              <span className="text-[11px] tracking-[0.35em] text-black/40">
                PORTAL
              </span>
            </div>

            <div className="text-sm font-semibold text-black truncate">
              {businessName}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen items-start">
        {/* Sidebar desktop colapsable */}
        <aside
          className={[
            "hidden lg:flex sticky top-0 self-start h-screen overflow-y-auto border-r border-black/10 bg-white flex-col",
            "transition-all duration-300 ease-out",
            expanded ? "px-5 py-6" : "px-3 py-6",
          ].join(" ")}
          style={{ width: expanded ? SIDEBAR_W : SIDEBAR_COLLAPSED_W }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <ClienteBrandHeader
            expanded={expanded}
            logoSrc={logoSrc}
            businessName={businessName}
          />

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={[
              "mt-4 h-10 rounded-xl border border-black/10 bg-white",
              "hover:bg-black/[0.02] active:scale-[0.99] transition",
              "flex items-center justify-center",
            ].join(" ")}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <div className="mt-6">
            <nav className="space-y-2">
              {links.map((l) => (
                <ClienteSideItem
                  key={l.href}
                  href={l.href}
                  label={l.label}
                  icon={l.icon}
                  active={pathname === l.href}
                  collapsed={!expanded}
                />
              ))}

              <div className="pt-2">
                <LogoutButton collapsed={!expanded} onLogout={logout} />
              </div>
            </nav>
          </div>

          {expanded && (
            <div className="mt-auto pt-6 flex flex-col items-center gap-2 text-center">
              <img
                src="/logo-xhunco.png"
                alt="Xhunco"
                className="h-10 w-auto object-contain opacity-80"
                loading="lazy"
              />

              <div className="text-[11px] leading-tight text-black/60">
                © 2026 Xhunco Café
              </div>

              <div className="text-[10px] text-black/50">
                {SYSTEM_ENV} · v{SYSTEM_VERSION}
              </div>
            </div>
          )}
        </aside>

        {/* Área principal */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 w-full min-w-0 px-4 pt-4 pb-8 md:px-8 md:pt-6 md:pb-10 lg:pt-6">
            <div className="w-full max-w-none">{children}</div>
          </main>
        </div>

        {/* Drawer móvil */}
        <div
          className={[
            "lg:hidden fixed inset-0 z-40",
            open ? "pointer-events-auto" : "pointer-events-none",
          ].join(" ")}
        >
          <button
            type="button"
            className={[
              "absolute inset-0 transition-opacity duration-300",
              "bg-black/40 backdrop-blur-[2px]",
              open ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-label="Cerrar menú"
            onClick={closeMenu}
          />

          <aside
            className={[
              "absolute left-0 top-0 h-full w-[90%] border-r border-black/10 bg-white overflow-y-auto",
              "transform transition-transform duration-300 ease-out",
              open ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
            style={{ maxWidth: DRAWER_W }}
          >
            <div className="p-5 min-h-[100dvh] flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <ClienteBrandHeader
                  expanded={true}
                  logoSrc={logoSrc}
                  businessName={businessName}
                  mobile
                />

                <button
                  type="button"
                  onClick={closeMenu}
                  className={[
                    "inline-flex items-center justify-center h-11 w-11 rounded-2xl",
                    "border border-black/10 bg-white",
                    "hover:bg-black/[0.02] active:scale-[0.98] transition",
                  ].join(" ")}
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-8">
                <nav className="space-y-2 flex-1">
                  {links.map((l) => (
                    <ClienteSideItem
                      key={l.href}
                      href={l.href}
                      label={l.label}
                      icon={l.icon}
                      active={pathname === l.href}
                      collapsed={false}
                    />
                  ))}

                  <div className="pt-2">
                    <LogoutButton collapsed={false} onLogout={logout} />
                  </div>
                </nav>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2 text-center">
                <img
                  src="/logo-xhunco.png"
                  alt="Xhunco"
                  className="h-10 w-auto object-contain opacity-80"
                  loading="lazy"
                />

                <div className="text-[11px] leading-tight text-black/60">
                  © 2026 Xhunco Café
                </div>

                <div className="text-[10px] text-black/50">
                  {SYSTEM_ENV} · v{SYSTEM_VERSION}
                </div>
              </div>

              <div className="h-6" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ClienteBrandHeader({ expanded, logoSrc, businessName, mobile = false }) {
  if (!expanded && !mobile) {
    return (
      <div className="flex items-center justify-center w-full">
        <div
          className="h-10 w-10 rounded-2xl border border-black/10 bg-black/[0.02] flex items-center justify-center"
          title={businessName}
        >
          <span className="text-xs font-semibold" style={{ color: BRAND_GREEN }}>
            {String(businessName || "C").charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mt-6 flex flex-col items-center gap-4">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="Logo del negocio"
            className={mobile ? "h-28 w-28 object-contain" : "h-32 w-32 object-contain"}
            loading="eager"
          />
        ) : (
          <div
            className={cx(
              "flex items-center justify-center font-semibold rounded-2xl border border-black/10 bg-black/[0.02]",
              mobile ? "h-20 w-20 text-xl" : "h-32 w-32 text-2xl"
            )}
            style={{ color: BRAND_GREEN }}
          >
            {String(businessName || "C").charAt(0).toUpperCase()}
          </div>
        )}

        <div className="text-center">
          <div className="text-sm font-semibold text-black">
            {businessName || "Cliente"}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClienteSideItem({ href, label, icon: Icon, active, collapsed }) {
  return (
    <a
      href={href}
      title={collapsed ? label : undefined}
      className={cx(
        "group rounded-2xl border transition-all duration-200 ease-out",
        collapsed
          ? "w-full flex items-center justify-center p-2"
          : "w-full flex items-center gap-3 px-4 py-3",
        active
          ? "text-white shadow-[0_4px_14px_rgba(49,87,44,0.25)]"
          : "text-black hover:bg-[rgba(49,87,44,0.10)]"
      )}
      style={{
        borderColor: BRAND_GREEN,
        backgroundColor: active ? BRAND_GREEN : "transparent",
      }}
    >
      <span
        className={cx(
          "flex h-10 w-10 items-center justify-center rounded-xl border transition",
          active
            ? "border-white/20 bg-white/10"
            : "border-black/10 bg-black/[0.02] group-hover:bg-black/[0.03]"
        )}
        aria-hidden="true"
      >
        <Icon size={18} color={active ? "#ffffff" : BRAND_GREEN_DARK} />
      </span>

      {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
    </a>
  );
}

function LogoutButton({ collapsed = false, onLogout }) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onLogout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className={[
          "w-full flex items-center justify-center",
          "rounded-2xl border border-black/10 bg-white",
          "p-2 hover:bg-black/[0.02] hover:shadow-sm transition",
          "active:scale-[0.99]",
        ].join(" ")}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-black/[0.02]">
          <LogOut className="h-5 w-5 text-[#31572c]" />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onLogout}
      className="w-full flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition hover:bg-[rgba(49,87,44,0.10)]"
      style={{ borderColor: BRAND_GREEN }}
      type="button"
    >
      <LogOut size={18} />
      Cerrar sesión
    </button>
  );
}