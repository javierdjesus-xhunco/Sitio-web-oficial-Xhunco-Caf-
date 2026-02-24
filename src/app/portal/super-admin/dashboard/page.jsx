import Link from "next/link";

export default function SuperAdminDashboardPage() {
  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="rounded-3xl border border-black/10 bg-white p-8">
        <div className="text-sm text-black/60">Bienvenido, Paulina</div>

        <div className="mt-1 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold text-black">Panel de control</h1>
            <p className="mt-2 max-w-xl text-sm text-black/60">
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

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-sm font-medium text-black/80">Actividad reciente</div>
          <div className="mt-2 text-sm text-black/60">
            (Luego conectamos: pedidos recientes, altas de clientes, cambios de precios.)
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-sm font-medium text-black/80">Alertas</div>
          <div className="mt-2 text-sm text-black/60">
            (Luego conectamos: productos sin stock, pedidos en atraso, pagos pendientes.)
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ href, label }) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-5 py-2 text-sm text-center transition",
        "border border-[#31572c]/25 bg-[#31572c] text-white",
        "hover:bg-[#2a4b27] active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#31572c]/40",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function KPI({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-xs tracking-wider text-black/50">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-black">{value}</div>
      <div className="mt-2 text-xs text-[#31572c]">{note}</div>
    </div>
  );
}