export default function AdminPedidosPage() {
  return (
    <div className="max-w-[1100px]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">Pedidos</h1>
            <p className="mt-2 text-sm text-white/60">
              Visualiza y actualiza pedidos (estatus, fecha, notas).
            </p>
          </div>

          <a
            href="/portal/admin/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Volver
          </a>
        </div>

        <div className="mt-8 text-sm text-white/60">
          (Aquí pondremos tabla, filtros y botón para cambiar estatus.)
        </div>
      </div>
    </div>
  );
}
