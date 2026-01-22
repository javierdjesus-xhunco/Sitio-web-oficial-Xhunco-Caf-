export default function Perfil() {
  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        Mi perfil
      </h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <p>
          <strong>Empresa:</strong> Café La Montaña
        </p>

        <p>
          <strong>Correo:</strong> compras@cafemontana.mx
        </p>

        <div>
          <h3 className="font-semibold mb-2">
            Productos más comprados
          </h3>

          <ul className="list-disc list-inside text-gray-600">
            <li>Café Chiapas</li>
            <li>Café Veracruz</li>
            <li>Café Oaxaca</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
