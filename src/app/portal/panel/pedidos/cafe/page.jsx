"use client";

import { useState } from "react";

const CAFES = [
  { id: 1, nombre: "Café Chiapas", precio: 180 },
  { id: 2, nombre: "Café Veracruz", precio: 170 },
  { id: 3, nombre: "Café Oaxaca", precio: 190 },
];

export default function CafeList() {
  const [items, setItems] = useState([]);

  const agregarFila = () => {
    setItems([
      ...items,
      {
        cafeId: "",
        cantidad: 1,
        presentacion: "grano",
        tueste: "",
        molienda: "",
        precio: 0,
        subtotal: 0,
      },
    ]);
  };

  const actualizarItem = (index, campo, valor) => {
    const copia = [...items];
    copia[index][campo] = valor;

    const cafe = CAFES.find(
      (c) => c.id === Number(copia[index].cafeId)
    );

    if (cafe) {
      copia[index].precio = cafe.precio;
      copia[index].subtotal =
        cafe.precio * copia[index].cantidad;
    }

    setItems(copia);
  };

  const total = items.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">

      <h2 className="text-lg font-semibold">
        Pedidos de Café
      </h2>

      <button
        onClick={agregarFila}
        className="px-4 py-2 bg-black text-white rounded-md text-sm"
      >
        + Agregar café
      </button>

      {items.length > 0 && (
        <table className="w-full text-sm border mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Café</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Grano / Molido</th>
              <th className="p-2">Tueste</th>
              <th className="p-2">Molienda</th>
              <th className="p-2">Precio unitario</th>
              <th className="p-2">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t">
                {/* CAFÉ */}
                <td className="p-2">
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={item.cafeId}
                    onChange={(e) =>
                      actualizarItem(index, "cafeId", e.target.value)
                    }
                  >
                    <option value="">Seleccionar</option>
                    {CAFES.map((cafe) => (
                      <option key={cafe.id} value={cafe.id}>
                        {cafe.nombre}
                      </option>
                    ))}
                  </select>
                </td>

                {/* CANTIDAD */}
                <td className="p-2">
                  <input
                    type="number"
                    min="1"
                    className="border rounded px-2 py-1 w-20"
                    value={item.cantidad}
                    onChange={(e) =>
                      actualizarItem(
                        index,
                        "cantidad",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                {/* PRESENTACIÓN */}
                <td className="p-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={item.presentacion}
                    onChange={(e) =>
                      actualizarItem(index, "presentacion", e.target.value)
                    }
                  >
                    <option value="grano">Grano</option>
                    <option value="molido">Molido</option>
                  </select>
                </td>

                {/* TUESTE */}
                <td className="p-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={item.tueste}
                    onChange={(e) =>
                      actualizarItem(index, "tueste", e.target.value)
                    }
                  >
                    <option value="">Seleccionar</option>
                    <option value="claro">Claro</option>
                    <option value="medio">Medio</option>
                    <option value="oscuro">Oscuro</option>
                  </select>
                </td>

                {/* MOLIENDA */}
                <td className="p-2">
                  {item.presentacion === "molido" ? (
                    <select
                      className="border rounded px-2 py-1"
                      value={item.molienda}
                      onChange={(e) =>
                        actualizarItem(index, "molienda", e.target.value)
                      }
                    >
                      <option value="">Seleccionar</option>
                      <option value="fina">Fina</option>
                      <option value="media">Media</option>
                      <option value="gruesa">Gruesa</option>
                    </select>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* PRECIO */}
                <td className="p-2">
                  ${item.precio.toFixed(2)}
                </td>

                {/* SUBTOTAL */}
                <td className="p-2 font-medium">
                  ${item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {items.length > 0 && (
        <div className="text-right text-lg font-semibold">
          Total: ${total.toFixed(2)}
        </div>
      )}

    </div>
  );
}
