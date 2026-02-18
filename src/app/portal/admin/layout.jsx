"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Menu, X } from "lucide-react";
import NotificationsBell from "@/components/NotificationsBell";

const BRAND_GREEN = "#31572c";

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

function NavItem({ href, label, onNavigate }) {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);

  return (
    <Link
      href={href}
      onClick={() => onNavigate?.({ href })}
      className={cx(
        "block rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
        active
          ? "bg-black text-white"
          : "text-black hover:bg-gray-100 active:scale-[0.99]"
      )}
    >
      {label}
    </Link>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  disabled,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={disabled ? undefined : onCancel}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="p-5">
            <div className="text-lg font-semibold text-black">{title}</div>
            <div className="mt-1 text-sm text-gray-600">{description}</div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={disabled}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={disabled}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                style={{ background: "#b91c1c" }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ profile, loadingProfile, onLogoutClick, onNavigate }) {
  const name = displayName(profile);
  const initials = initialsFromProfile(profile);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-sm">
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

          <NotificationsBell />
        </div>
      </div>

      <div className="space-y-2">
        <NavItem href="/portal/admin/dashboard" label="Inicio" onNavigate={onNavigate} />
        <NavItem href="/portal/admin/pedidos" label="Pedidos" onNavigate={onNavigate} />
      </div>

      <button
        className="mt-6 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.99]"
        style={{ background: BRAND_GREEN }}
        onClick={() => onNavigate?.({ href: "/portal/admin/pedidos/nuevo" })}
      >
        Crear pedido manual
      </button>

      <div className="flex-1" />

      <button
        onClick={onLogoutClick}
        className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 active:scale-[0.99]"
      >
        Cerrar sesión
      </button>

      <div className="mt-3 text-[11px] text-gray-400">Xhunco · Admin Panel</div>
    </div>
  );
}

/** Panel derecho (solo layout) */
function RightNavItem({ href, title, subtitle }) {
  return (
    <Link
      href={href}
      className="group block rounded-[22px] border border-gray-200 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition hover:shadow-[0_16px_44px_rgba(0,0,0,0.09)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-black">{title}</div>
          <div className="truncate text-xs text-gray-600">{subtitle}</div>
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-white transition group-hover:opacity-95"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          Abrir
        </span>
      </div>
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  const pathname = usePathname();
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  async function handleLogoutConfirm() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setLogoutOpen(false);
      setDrawerOpen(false);
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function handleNavigate(payload) {
    if (payload?.href) router.push(payload.href);
    setDrawerOpen(false);
  }

  const headerName = useMemo(() => displayName(profile), [profile]);

  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      <ConfirmModal
        open={logoutOpen}
        title="¿Cerrar sesión?"
        description="Vas a salir del panel de administración. Puedes volver a iniciar sesión cuando quieras."
        confirmText={loggingOut ? "Cerrando…" : "Sí, cerrar sesión"}
        cancelText="Cancelar"
        disabled={loggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutOpen(false)}
      />

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
            <div className="truncate text-sm font-semibold">
              {headerName || "Administrador"}
            </div>
            <div className="truncate text-[11px] text-gray-500">Panel Admin</div>
          </div>

          <div className="flex items-center gap-2">
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
                onLogoutClick={() => setLogoutOpen(true)}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop shell */}
      <div className="hidden md:flex min-h-[calc(100vh-0px)]">
        <aside className="w-[280px] shrink-0 border-r border-gray-200 bg-white">
          <div className="sticky top-0 h-screen">
            <div className="h-full overflow-y-auto">
              <SidebarContent
                profile={profile}
                loadingProfile={loadingProfile}
                onLogoutClick={() => setLogoutOpen(true)}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        </aside>

        {/* ✅ Aquí está el grid correcto (contenido + panel derecho) */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <div className="mx-auto max-w-[1720px]">
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">{children}</div>

                <aside className="hidden xl:block">
                  <div className="sticky top-6 space-y-3">
                    <RightNavItem
                      href="/portal/admin/clientes"
                      title="Clientes"
                      subtitle="Ver y administrar clientes"
                    />
                    <RightNavItem
                      href="/portal/admin/pedidos"
                      title="Pedidos"
                      subtitle="Compras recientes y entrega"
                    />
                    <RightNavItem
                      href="/portal/admin/pagos"
                      title="Pagos"
                      subtitle="Transacciones y liquidaciones"
                    />
                    <RightNavItem
                      href="/portal/admin/marketing"
                      title="Marketing"
                      subtitle="Campañas y promociones"
                    />
                    <RightNavItem
                      href="/portal/admin/automatizacion"
                      title="Automatización"
                      subtitle="Reglas y flujos"
                    />
                    <RightNavItem
                      href="/portal/admin/reportes"
                      title="Reportes"
                      subtitle="Desempeño e insights"
                    />
                    {/* ✅ SIN Ayuda y soporte */}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile content */}
      <div className="md:hidden px-4 py-6">{children}</div>
    </div>
  );
}
