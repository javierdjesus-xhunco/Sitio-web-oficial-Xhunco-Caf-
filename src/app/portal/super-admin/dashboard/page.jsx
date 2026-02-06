export default function SuperAdminDashboardPage() {
  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_80px_rgba(255,255,255,0.06)]">
        <div className="text-sm text-white/70">Bienvenido, Paulina</div>

        <div className="mt-1 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold">Panel de control</h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Administra clientes, productos y pedidos en un solo lugar. Todo el equipo puede operar
              desde móvil o escritorio con accesibilidad garantizada.
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <ActionButton href="/portal/super-admin/clientes/nuevo" label="Crear cliente" />
            <ActionButton href="/portal/super-admin/productos" label="Actualizar precios" />
            <ActionButton href="/portal/super-admin/usuarios" label="Asignar roles" />
            <ActionButton href="/portal/super-admin/pedidos" label="Revisar pedidos" />
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <KPI title="CLIENTES ACTIVOS" value="128" note="+12 este mes" />
          <KPI title="PEDIDOS ACTIVOS" value="24" note="6 con entrega hoy" />
          <KPI title="INGRESOS DEL MES" value="$182,430" note="MXN · +8.4%" />
          <KPI title="PRODUCTOS" value="56" note="4 sin stock" />
        </div>
      </div>

      {/* Aquí después pondremos secciones (últimos pedidos, alertas, etc.) */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-medium text-white/80">Actividad reciente</div>
          <div className="mt-2 text-sm text-white/60">
            (Luego conectamos: pedidos recientes, altas de clientes, cambios de precios.)
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-medium text-white/80">Alertas</div>
          <div className="mt-2 text-sm text-white/60">
            (Luego conectamos: productos sin stock, pedidos en atraso, pagos pendientes.)
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ href, label }) {
  return (
    <a
      href={href}
      className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition text-center"
    >
      {label}
    </a>
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
