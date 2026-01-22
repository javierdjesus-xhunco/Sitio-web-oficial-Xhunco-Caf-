"use client";

import { useState } from "react";

/* CATEGORÍAS */
const CATEGORIAS = [
  { id: "jarabes", nombre: "Jarabes" },
  { id: "vasos", nombre: "Vasos" },
  { id: "accesorios", nombre: "Accesorios" },
];

/* PRODUCTOS */
const SUMINISTROS = [
  { id: 1, nombre: "Jarabe Vainilla", categoria: "jarabes", precio: 8.5 },
  { id: 2, nombre: "Jarabe Caramelo", categoria: "jarabes", precio: 8.5 },
  { id: 3, nombre: "Jarabe Avellana", categoria: "jarabes", precio: 9.0 },

  { id: 4, nombre: "Vaso térmico 12 oz", categoria: "vasos", precio: 3.5 },
  { id: 5, nombre: "Tapa para vaso", categoria: "vasos", precio: 1.2 },

  { id: 6, nombre: "Filtro para café", categoria: "accesorios", precio: 2.8 },
  { id: 7, nombre: "Servilletas premium", categoria: "accesorios", precio: 1.5 },
];

export default function PedidosSuministros() {
  const [categoriaActiva, setCategoriaActiva] = useState("jarabes");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [items, setItems] = useState([]);

  const productosFiltrados = SUMINISTROS.filter(
    (p) => p.categoria === categoriaActiva
  );

  const productoSeleccionado = SUMINISTROS.find(
    (p) => p.id === Number(productoId)
  );

  function agregarProducto() {
    if (!productoSeleccionado || cantidad <= 0) return;

    const subtotal = productoSeleccionado.precio * cantidad;

    setItems((prev) => [
      ...prev,
      {
        ...productoSeleccionado,
        cantidad,
        subtotal,
      },
    ]);

    setProductoId("");
    setCantidad(1);
  }

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="space-y-8">

      <h2 className="text-xl font-semibold">
        Pedidos de Suministros
      </h2>

      {/* MENÚ DE CATEGORÍAS */}
      <div className="flex gap-6 border-b pb-2">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoriaActiva(cat.id);
              setProductoId("");
            }}
            className={`text-sm font-medium pb-2 transition ${
              categoriaActiva === cat.id
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* FORMULARIO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border">

        <div>
          <label className="block text-sm mb-1">
            Producto
          </label>
          <select
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Seleccionar</option>
            {productosFiltrados.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={agregarProducto}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
          >
            Agregar
          </button>
        </div>

      </div>

      {/* TABLA */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">

          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">Precio unitario</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.nombre}</td>
                  <td className="p-3">${item.precio.toFixed(2)}</td>
                  <td className="p-3">{item.cantidad}</td>
                  <td className="p-3 font-medium">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end p-4 bg-gray-50">
            <span className="text-lg font-semibold">
              Total: ${total.toFixed(2)}
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
