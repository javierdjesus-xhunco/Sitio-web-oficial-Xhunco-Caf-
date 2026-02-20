"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Menu, X } from "lucide-react";
import NotificationsBell from "@/components/NotificationsBell";

const BRAND_GREEN = "#31572c";
const BRAND_GREEN_HOVER = "#3f6b38";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function initialsFromProfile(p) {
  const a = (p?.first_name || "").trim();
  const b = (p?.last_name_paterno || "").trim();
  const c = (p?.last_name_materno || "").trim();
  const email = (p?.email || "").trim();
  const first = a ? a[0] : email ? email[0] : "A";
  const second = b ? b[0] : c ? c[0] : "";
  return (first + second).toUpperCase();
}

function displayName(p) {
  const parts = [p?.first_name, p?.last_name_paterno, p?.last_name_materno]
    .map((x) => (x || "").trim())
    .filter(Boolean);
  if (parts.length) return parts.join(" ");
  return (p?.email || "Administrador").trim();
}

function NavItem({ href, label, onNavigate, prefetch = true }) {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={() => onNavigate?.({ href })}
      className="block rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"
      style={{
        backgroundColor: active ? BRAND_GREEN : "transparent",
        color: active ? "white" : "black",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = BRAND_GREEN_HOVER;
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "black";
        }
      }}
    >
      {label}
    </Link>
  );
}

function QuickNavItem({ href, title, subtitle, onNavigate, prefetch = false }) {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={() => onNavigate?.({ href })}
      className="block rounded-2xl border border-gray-200 px-4 py-3 transition-all duration-200"
      style={{
        backgroundColor: active ? BRAND_GREEN : "white",
        color: active ? "white" : "black",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = BRAND_GREEN_HOVER;
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.color = "black";
        }
      }}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div
          className="truncate text-xs"
          style={{ color: active ? "rgba(255,255,255,0.85)" : "#6b7280" }}
        >
          {subtitle}
        </div>
      </div>
    </Link>
  );
}

function SidebarContent({ profile, loadingProfile, onLogoutClick, onNavigate }) {
  const name = displayName(profile);
  const initials = initialsFromProfile(profile);

  return (
    <div className="flex h-full flex-col p-4">
      {/* Profile + Bell */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="grid h-11 w-11 place-items-center rounded-2xl text-sm font-extrabold text-white"
              style={{ background: BRAND_GREEN }}
              title={name}
            >
              {initials}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-black">
                {loadingProfile ? "Cargando…" : name}
              </div>
              <div className="truncate text-xs text-gray-500">
                {profile?.role ? `Rol: ${profile.role}` : "Panel Admin"}
              </div>
            </div>
          </div>

          {/* ✅ Campanita restaurada */}
          <NotificationsBell />
        </div>
      </div>

      {/* Nav principal */}
      <div className="space-y-2">
        <NavItem href="/portal/admin/dashboard" label="Inicio" onNavigate={onNavigate} />
        <NavItem href="/portal/admin/pedidos" label="Pedidos" onNavigate={onNavigate} />
      </div>

      {/* Accesos rápidos */}
      <div className="mt-4 space-y-2">
        <QuickNavItem
          href="/portal/admin/clientes"
          title="Clientes"
          subtitle="Visualizar y agregar clientes"
          onNavigate={onNavigate}
        />
        <QuickNavItem
          href="/portal/admin/suministros"
          title="Suministros"
          subtitle="Agregar productos"
          onNavigate={onNavigate}
        />
        <QuickNavItem
          href="/portal/admin/inventario"
          title="Inventario"
          subtitle="Revisar stock general"
          onNavigate={onNavigate}
        />
        <QuickNavItem
          href="/portal/admin/reportes"
          title="Reportes"
          subtitle="Descargar rendimiento"
          onNavigate={onNavigate}
        />
         <button
        className="mt-6 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.99]"
        style={{ background: BRAND_GREEN }}
        onClick={() => onNavigate?.({ href: "/portal/admin/pedidos/nuevo" })}
      >
        Crear pedido manual
      </button>
      </div>
      <button
        onClick={onLogoutClick}
        className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
      >
        Cerrar sesión
      </button>
      <div className="mt-3 text-[11px] text-gray-400">Xhunco · Admin Panel</div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = useCallback(
    (payload) => {
      if (payload?.href) router.push(payload.href);
      setDrawerOpen(false);
    },
    [router]
  );

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) {
          if (alive) setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("email, role, active, first_name, last_name_paterno, last_name_materno")
          .eq("id", user.id)
          .limit(1);

        if (!alive) return;

        if (error) {
          console.error(error);
          setProfile({ email: user.email, role: "admin" });
        } else {
          setProfile(data?.[0] || { email: user.email, role: "admin" });
        }
      } finally {
        if (alive) setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, []);

  const headerName = useMemo(() => displayName(profile), [profile]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-xl border border-gray-200 bg-white p-2 text-black hover:bg-gray-50 active:scale-[0.99] transition"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 px-3">
            <div className="truncate text-sm font-semibold">{headerName || "Administrador"}</div>
            <div className="truncate text-[11px] text-gray-500">Panel Admin</div>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ Campanita también en mobile */}
            <NotificationsBell />
            <div
              className="grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold text-white"
              style={{ background: BRAND_GREEN }}
              title={headerName}
            >
              {initialsFromProfile(profile)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[340px] bg-white shadow-2xl border-r border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="text-sm font-semibold text-black">Menú</div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50 active:scale-[0.99] transition"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-57px)] overflow-y-auto">
              <SidebarContent
                profile={profile}
                loadingProfile={loadingProfile}
                onLogoutClick={handleLogout}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop shell */}
      <div className="hidden md:flex min-h-screen">
        <aside className="w-[280px] shrink-0 border-r border-gray-200 bg-white">
          <div className="sticky top-0 h-screen">
            <div className="h-full overflow-y-auto">
              <SidebarContent
                profile={profile}
                loadingProfile={loadingProfile}
                onLogoutClick={handleLogout}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <div className="mx-auto max-w-[1680px]">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile content */}
      <div className="md:hidden px-4 py-6">{children}</div>
    </div>
  );
}