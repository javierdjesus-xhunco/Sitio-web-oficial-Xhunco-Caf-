import PortalSideItem from "@/components/PortalSideItem";
import LogoutButton from "@/components/LogoutButton";


export default function ClienteLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#050812] text-white">
      <div className="flex">
        <aside className="w-[280px] min-h-screen px-5 py-6 border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="text-xs tracking-[0.35em] text-white/50">PORTAL</div>

          <div className="mt-3 text-3xl font-semibold leading-tight">
            Cliente
            <br />
            Panel
          </div>

          <nav className="mt-8 space-y-2">
            <PortalSideItem href="/portal/cliente/dashboard" label="Resumen" exact />
            <PortalSideItem href="/portal/cliente/pedidos" label="Mis pedidos" />
            <PortalSideItem href="/portal/cliente/nuevo-pedido" label="Nuevo pedido" />
            <PortalSideItem href="/portal/cliente/perfil" label="Mi perfil" />
            <div className="mt-6">
            <LogoutButton />
            </div>
          </nav>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium text-white/80">Ayuda</div>
            <div className="mt-2 text-xs text-white/60">
              Aquí podrás consultar y crear pedidos.
            </div>
          </div>
        </aside>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
