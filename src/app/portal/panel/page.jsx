export default function PanelDashboard() {
  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-semibold">
        Dashboard
      </h1>

      {/* CARDS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pedidos realizados</p>
          <p className="text-3xl font-semibold mt-2">12</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pedidos pendientes</p>
          <p className="text-3xl font-semibold mt-2 text-yellow-600">2</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Saldo pendiente</p>
          <p className="text-3xl font-semibold mt-2 text-red-600">
            $4,200 MXN
          </p>
        </div>

      </div>

      {/* HISTORIAL */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Últimos pedidos
        </h2>

        <ul className="space-y-3 text-sm">
          <li className="flex justify-between">
            <span>Café Chiapas – 5kg</span>
            <span className="text-gray-500">Pagado</span>
          </li>
          <li className="flex justify-between">
            <span>Café Veracruz – 10kg</span>
            <span className="text-yellow-600">Pendiente</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
