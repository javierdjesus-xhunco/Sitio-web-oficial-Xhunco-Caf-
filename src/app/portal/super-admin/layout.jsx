import PortalSideItem from "@/components/PortalSideItem";
import LogoutButton from "@/components/LogoutButton";

export default function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex">
        <aside className="w-[280px] min-h-screen px-5 py-6 border-r border-black/10 bg-white flex flex-col">
          <div className="text-xs tracking-[0.35em] text-black/50">PORTAL</div>

          <div className="mt-3 text-3xl font-semibold leading-tight text-black">
            Super
            <br />
            administrador
          </div>

          <nav className="mt-8 space-y-2 flex-1">
            <PortalSideItem href="/portal/super-admin/dashboard" label="Resumen" exact />
            <PortalSideItem href="/portal/super-admin/clientes/nuevo" label="Alta de clientes" />
            <PortalSideItem href="/portal/super-admin/suministros" label="Suministros" />
            <PortalSideItem href="/portal/super-admin/pedidos" label="Pedidos" />
            <PortalSideItem href="/portal/super-admin/usuarios" label="Usuarios y roles" />
            <PortalSideItem href="/portal/super-admin/configuracion" label="Configuración" />
            <PortalSideItem href="/portal/super-admin/reportes" label="Reportes" />
            
          {/* ✅ Logout siempre visible al fondo */}
          <div className="pt-4 border-t border-black/10">
            <LogoutButton />
          </div>
          </nav>
        </aside>

        <main className="flex-1 px-8 py-8 bg-white text-black">{children}</main>
      </div>
    </div>
  );
}