"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import PortalSideItem from "@/components/PortalSideItem";
import LogoutButton from "@/components/LogoutButton";

import {
  Menu,
  X,
  Home,
  Users,
  Package,
  ClipboardList,
  ShieldCheck,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const BRAND_GREEN = "#31572c";

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname() || "";

  // Drawer móvil
  const [open, setOpen] = useState(false);

  // Sidebar desktop colapsable
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Cierra drawer móvil al navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Evita scroll cuando drawer móvil está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Título dinámico para header móvil (sin botón volver/SA como pediste)
  const pageTitle = useMemo(() => {
    const p = pathname;
    if (p.startsWith("/portal/super-admin/dashboard")) return "Panel de control";
    if (p.startsWith("/portal/super-admin/clientes")) return "Clientes";
    if (p.startsWith("/portal/super-admin/suministros")) return "Suministros";
    if (p.startsWith("/portal/super-admin/pedidos")) return "Pedidos";
    if (p.startsWith("/portal/super-admin/usuarios-y-roles")) return "Usuarios y roles";
    if (p.startsWith("/portal/super-admin/configuracion")) return "Configuración";
    if (p.startsWith("/portal/super-admin/reportes")) return "Reportes";
    return "Super administrador";
  }, [pathname]);

  // Expandido real = o no colapsado, o colapsado pero con hover encima
  const expanded = !collapsed || hovering;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex min-h-screen">
        {/* =======================
            Sidebar DESKTOP/TABLET
           ======================= */}
        <aside
          className={[
            "hidden lg:flex min-h-screen border-r border-black/10 bg-white flex-col",
            "transition-all duration-300 ease-out",
            expanded ? "w-[250px] px-5 py-6" : "w-[80px] px-3 py-6",
          ].join(" ")}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <BrandHeader condensed={!expanded} />

          {/* Botón colapsar/expandir (solo desktop) */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={[
              "mt-4 h-10 rounded-xl border border-black/10 bg-white",
              "hover:bg-black/[0.02] active:scale-[0.99] transition",
              "flex items-center justify-center",
            ].join(" ")}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <nav className={["mt-6 space-y-2 flex-1", expanded ? "" : "items-center"].join(" ")}>
            <PortalSideItem
              href="/portal/super-admin/dashboard"
              label="Inicio"
              exact
              icon={Home}
              brandColor={BRAND_GREEN}
              collapsed={!expanded}
            />
            <PortalSideItem
              href="/portal/super-admin/clientes"
              label="Clientes"
              icon={Users}
              brandColor={BRAND_GREEN}
              collapsed={!expanded}
            />
            <PortalSideItem
              href="/portal/super-admin/suministros"
              label="Suministros"
              icon={Package}
              brandColor={BRAND_GREEN}
              collapsed={!expanded}
            />
            <PortalSideItem
              href="/portal/super-admin/pedidos"
              label="Pedidos"
              icon={ClipboardList}
              brandColor={BRAND_GREEN}
              collapsed={!expanded}
            />
            <PortalSideItem
              href="/portal/super-admin/usuarios-y-roles"
              label="Usuarios y roles"
              icon={ShieldCheck}
              brandColor={BRAND_GREEN}
              collapsed={!expanded}
            />
            <PortalSideItem
              href="/portal/super-admin/configuracion"
              label="Configuración"
              icon={Settings}
              brandColor={BRAND_GREEN}
              collapsed={!expanded}
            />
            <PortalSideItem
              href="/portal/super-admin/reportes"
              label="Reportes"
              icon={BarChart3}
              brandColor={BRAND_GREEN}
              collapsed={!expanded}
            />
          </nav>

          {/* Logout (en colapsado se queda centrado) */}
          <div className="pt-4 border-t border-black/10">
           <LogoutButton collapsed={!expanded} />
          </div>
        </aside>

        {/* =======================
            Área principal
           ======================= */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar móvil (limpio) */}
          <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-black/10">
            <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className={[
                  "inline-flex items-center justify-center h-11 w-11 rounded-2xl",
                  "border border-black/10 bg-white",
                  "hover:bg-black/[0.02] active:scale-[0.98] transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
                ].join(" ")}
                aria-label="Abrir menú"
              >
                <Menu size={20} />
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
                  {pageTitle}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-white text-black">
            {children}
          </main>
        </div>

        {/* =======================
            Drawer MÓVIL (animado + blur)
           ======================= */}
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
            onClick={() => setOpen(false)}
          />

          <aside
            className={[
              "absolute left-0 top-0 h-full w-[320px] max-w-[85vw]",
              "bg-white border-r border-black/10 px-5 py-6 flex flex-col shadow-xl",
              "transform transition-transform duration-300 ease-out",
              open ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4">
              <BrandHeader condensed={false} />

              <button
                type="button"
                onClick={() => setOpen(false)}
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

            <nav className="mt-8 space-y-2 flex-1 overflow-auto pr-1">
              <PortalSideItem
                href="/portal/super-admin/dashboard"
                label="Inicio"
                exact
                icon={Home}
                brandColor={BRAND_GREEN}
                collapsed={false}
              />
              <PortalSideItem
                href="/portal/super-admin/clientes"
                label="Clientes"
                icon={Users}
                brandColor={BRAND_GREEN}
                collapsed={false}
              />
              <PortalSideItem
                href="/portal/super-admin/suministros"
                label="Suministros"
                icon={Package}
                brandColor={BRAND_GREEN}
                collapsed={false}
              />
              <PortalSideItem
                href="/portal/super-admin/pedidos"
                label="Pedidos"
                icon={ClipboardList}
                brandColor={BRAND_GREEN}
                collapsed={false}
              />
              <PortalSideItem
                href="/portal/super-admin/usuarios-y-roles"
                label="Usuarios y roles"
                icon={ShieldCheck}
                brandColor={BRAND_GREEN}
                collapsed={false}
              />
              <PortalSideItem
                href="/portal/super-admin/configuracion"
                label="Configuración"
                icon={Settings}
                brandColor={BRAND_GREEN}
                collapsed={false}
              />
              <PortalSideItem
                href="/portal/super-admin/reportes"
                label="Reportes"
                icon={BarChart3}
                brandColor={BRAND_GREEN}
                collapsed={false}
              />
            </nav>

            <div className="pt-4 border-t border-black/10">
              <LogoutButton />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function BrandHeader({ condensed = false }) {
  return (
    <div className={condensed ? "flex items-center justify-center w-full" : ""}>
      {condensed ? (
        <div
          className="h-10 w-10 rounded-2xl border border-black/10 bg-black/[0.02] flex items-center justify-center"
          title="XHUNCO"
        >
          <span className="text-xs font-semibold" style={{ color: BRAND_GREEN }}>
            XH
          </span>
        </div>
      ) : (
        <div>
          <div className="text-xs tracking-[0.35em] text-black/50">PORTAL</div>
          <div className="mt-3 text-3xl font-semibold leading-tight text-black">
            Super
            <br />
            administrador
          </div>
          <div
            className="mt-3 text-xs font-semibold tracking-[0.22em]"
            style={{ color: BRAND_GREEN }}
          >
            XHUNCO
          </div>
        </div>
      )}
    </div>
  );
}