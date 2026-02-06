export default function ClientesPage() {
  return (
    <div className="max-w-[1100px]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Clientes</h1>
            <p className="mt-2 text-sm text-white/60">
              Administra clientes: alta, edición, estado y datos de contacto.
            </p>
          </div>

          <a
            href="/portal/super-admin/clientes/nuevo"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            + Crear cliente
          </a>
        </div>

        <div className="mt-8 text-sm text-white/60">
          (Aquí pondremos tabla + búsqueda. Primero hacemos el formulario.)
        </div>
      </div>
    </div>
  );
}
