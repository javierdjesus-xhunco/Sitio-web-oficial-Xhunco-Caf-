"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function PedidosPage() {
  const router = useRouter();
  const [tipoPedido, setTipoPedido] = useState("cafe");

  useEffect(() => {
    router.push(`/portal/panel/pedidos/${tipoPedido}`);
  }, [tipoPedido, router]);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        Pedidos
      </h1>

      {/* SELECTOR DE TIPO DE PEDIDO */}
      <div className="max-w-sm">
        <label className="block text-sm font-medium mb-1">
          Tipo de pedido
        </label>

        <select
          value={tipoPedido}
          onChange={(e) => setTipoPedido(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="cafe">Pedidos de Café</option>
          <option value="suministros">Pedidos de Suministros</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">
        Selecciona el tipo de pedido para continuar
      </p>

    </div>
  );
}
