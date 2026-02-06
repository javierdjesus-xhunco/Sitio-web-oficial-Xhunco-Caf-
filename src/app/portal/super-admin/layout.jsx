import PortalSideItem from "@/components/PortalSideItem";
import LogoutButton from "@/components/LogoutButton";


export default function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#050812] text-white">
      <div className="flex">
        <aside className="w-[280px] min-h-screen px-5 py-6 border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="text-xs tracking-[0.35em] text-white/50">PORTAL</div>

          <div className="mt-3 text-3xl font-semibold leading-tight">
            Super
            <br />
            administrador
          </div>

          <nav className="mt-8 space-y-2">
            <PortalSideItem href="/portal/super-admin/dashboard" label="Resumen" exact />
            <PortalSideItem href="/portal/super-admin/clientes" label="Alta de clientes" />
            <PortalSideItem href="/portal/super-admin/productos" label="Productos" />
            <PortalSideItem href="/portal/super-admin/pedidos" label="Pedidos" />
            <PortalSideItem href="/portal/super-admin/usuarios" label="Usuarios y roles" />
            <PortalSideItem href="/portal/super-admin/configuracion" label="Configuración" />
            <PortalSideItem href="/portal/super-admin/reportes" label="Reportes" />
             <div className="mt-6">
          <LogoutButton />
          </div>
          </nav>
        </aside>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
