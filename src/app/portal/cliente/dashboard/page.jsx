export default function ClienteDashboard() {
  return (
    <div className="max-w-[1100px]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_80px_rgba(255,255,255,0.06)]">
        <div className="text-sm text-white/70">Bienvenido</div>
        <h1 className="mt-1 text-4xl font-semibold">Panel del cliente</h1>
        <p className="mt-2 text-sm text-white/60">
          Aquí podrás revisar tu historial y crear nuevos pedidos.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <KPI title="PEDIDOS ESTE MES" value="0" note="Aún no hay pedidos" />
          <KPI title="ÚLTIMO PEDIDO" value="—" note="Sin registros" />
          <KPI title="ESTADO" value="Activo" note="Acceso habilitado" />
        </div>

        <div className="mt-8 flex gap-3">
          <a
            href="/portal/cliente/nuevo-pedido"
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm text-white/90 hover:bg-emerald-400/15 transition"
          >
            Crear pedido
          </a>
          <a
            href="/portal/cliente/pedidos"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Ver mis pedidos
          </a>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5">
      <div className="text-xs tracking-wider text-white/50">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-xs text-emerald-300/90">{note}</div>
    </div>
  );
}
