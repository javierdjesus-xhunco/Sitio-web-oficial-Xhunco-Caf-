export default function AdminDashboard() {
  return (
    <div className="max-w-[1100px]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_80px_rgba(255,255,255,0.06)]">
        <div className="text-sm text-white/70">Bienvenido</div>
        <h1 className="mt-1 text-4xl font-semibold">Panel de pedidos</h1>
        <p className="mt-2 text-sm text-white/60">
          Revisa pedidos pendientes y actualiza su estatus de entrega.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <KPI title="PEDIDOS ACTIVOS" value="—" note="Conectamos datos después" />
          <KPI title="ENTREGAS HOY" value="—" note="Conectamos datos después" />
          <KPI title="EN RETRASO" value="—" note="Conectamos datos después" />
        </div>

        <div className="mt-8 flex gap-3">
          <a
            href="/portal/admin/pedidos"
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm text-white/90 hover:bg-emerald-400/15 transition"
          >
            Ver pedidos
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-medium text-white/80">Pendientes recientes</div>
          <div className="mt-2 text-sm text-white/60">
            (Aquí listaremos los últimos pedidos con estatus “pendiente”.)
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-medium text-white/80">Actualizaciones</div>
          <div className="mt-2 text-sm text-white/60">
            (Aquí se mostrará un resumen de cambios de estatus.)
          </div>
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
