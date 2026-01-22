"use client";

import { useState } from "react";

export default function TrazabilidadPage() {
  const [lote, setLote] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  const buscarLote = () => {
    setError("");
    setResultado(null);

    // MOCK DATA (luego va backend real)
    const lotes = {
      XH2024CHI: {
        origen: "Chiapas, México",
        productor: "Cooperativa Sierra Azul",
        proceso: "Lavado",
        notas: "Cacao, cítricos, cuerpo medio",
        fecha: "Marzo 2024",
      },
      XH2024OAX: {
        origen: "Oaxaca, México",
        productor: "Finca La Montaña",
        proceso: "Honey",
        notas: "Miel, panela, floral",
        fecha: "Febrero 2024",
      },
    };

    if (!lote) {
      setError("Ingresa un código de lote");
      return;
    }

    if (!lotes[lote]) {
      setError("Lote no encontrado");
      return;
    }

    setResultado(lotes[lote]);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-40 px-6">
      <div className="max-w-xl mx-auto text-center">

        <h1 className="text-4xl font-semibold mb-4">
          Buscar mi lote
        </h1>

        <p className="text-gray-600 mb-10">
          Ingresa el código de lote impreso en tu empaque para conocer
          el origen y proceso de tu café.
        </p>

        <div className="flex gap-4 mb-6">
          <input
            value={lote}
            onChange={(e) => setLote(e.target.value.toUpperCase())}
            placeholder="Ej. XH2024CHI"
            className="flex-1 border rounded-md px-4 py-3 focus:outline-none"
          />
          <button
            onClick={buscarLote}
            className="px-6 py-3 bg-black text-white rounded-md"
          >
            Buscar
          </button>
        </div>

        {error && (
          <p className="text-red-600 mb-6">{error}</p>
        )}

        {resultado && (
          <div className="bg-white rounded-xl shadow-md p-6 text-left">
            <h2 className="text-2xl font-semibold mb-4">
              Información del lote
            </h2>

            <ul className="space-y-2 text-gray-700">
              <li><strong>Origen:</strong> {resultado.origen}</li>
              <li><strong>Productor:</strong> {resultado.productor}</li>
              <li><strong>Proceso:</strong> {resultado.proceso}</li>
              <li><strong>Notas:</strong> {resultado.notas}</li>
              <li><strong>Fecha:</strong> {resultado.fecha}</li>
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}
