"use client";

import { useEffect, useMemo, useState } from "react";

export default function CarritoPage() {
  const [carrito, setCarrito] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const guardado = window.localStorage.getItem("suministrosCarrito");
    if (guardado) {
      try {
        setCarrito(JSON.parse(guardado));
      } catch (error) {
        console.error("No se pudo leer el carrito guardado.", error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("suministrosCarrito", JSON.stringify(carrito));
  }, [carrito]);

  const items = useMemo(() => Object.values(carrito), [carrito]);
  const totalArticulos = items.reduce(
    (total, item) => total + item.cantidad,
    0,
  );
  const totalPrecio = items.reduce(
    (total, item) => total + item.cantidad * item.precio,
    0,
  );

  const actualizarCantidad = (nombre, delta) => {
    setCarrito((prev) => {
      const item = prev[nombre];
      if (!item) {
        return prev;
      }
      const nuevaCantidad = Math.max(0, item.cantidad + delta);
      if (nuevaCantidad === 0) {
        const { [nombre]: _, ...resto } = prev;
        return resto;
      }
      return {
        ...prev,
        [nombre]: {
          ...item,
          cantidad: nuevaCantidad,
        },
      };
    });
  };

  const eliminarProducto = (nombre) => {
    setCarrito((prev) => {
      const { [nombre]: _, ...resto } = prev;
      return resto;
    });
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="max-w-6xl mx-auto px-8 pt-32 pb-12">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          Carrito
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold">
          Resumen de tus compras
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl">
          Aquí verás los artículos seleccionados y el total antes de finalizar
          la compra.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold">Artículos</h2>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Aún no agregas productos al carrito.
              </p>
            ) : (
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li
                    key={item.sku}
                    className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-100 pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-100">
                        <img
                          src={item.imagen || "/suministros/placeholder.svg"}
                          alt={item.nombre}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {item.categoria}
                        </p>
                        <p className="text-lg font-semibold">{item.nombre}</p>
                        <p className="text-sm text-gray-600">
                          ${item.precio} MXN c/u
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2">
                        <span className="text-xs text-gray-500">Cantidad</span>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.cantidad}
                        </span>
                        <div className="flex flex-col overflow-hidden rounded-md border border-gray-200">
                          <button
                            type="button"
                            onClick={() => actualizarCantidad(item.sku, 1)}
                            className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                            aria-label={`Aumentar ${item.nombre}`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => actualizarCantidad(item.sku, -1)}
                            className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                            aria-label={`Disminuir ${item.nombre}`}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarProducto(item.sku)}
                        className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:border-gray-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold">Resumen</h2>
            <div className="mt-6 space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Artículos</span>
                <span className="font-semibold">{totalArticulos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold">${totalPrecio} MXN</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Comprar ahora
            </button>
            <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-300 p-6">
              <img
                src="/pagos/spinnegocios.png"
                alt="Logo de la institución financiera"
                className="h-20 w-auto object-contain"
                onError={(event) => {
                  event.currentTarget.src = "/suministros/placeholder.svg";
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}