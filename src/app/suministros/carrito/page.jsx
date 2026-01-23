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

  const items = useMemo(() => Object.values(carrito), [carrito]);
  const totalArticulos = items.reduce(
    (total, item) => total + item.cantidad,
    0,
  );
  const totalPrecio = items.reduce(
    (total, item) => total + item.cantidad * item.precio,
    0,
  );

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
                    key={item.nombre}
                    className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4"
                  >
                    <div>
                      <p className="text-sm text-gray-500">{item.categoria}</p>
                      <p className="text-lg font-semibold">{item.nombre}</p>
                      <p className="text-sm text-gray-600">
                        ${item.precio} MXN c/u
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Cantidad</p>
                      <p className="text-lg font-semibold">{item.cantidad}</p>
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
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Pago seguro
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg">
                  🏦
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    Institución financiera
                  </p>
                  <p className="text-xs text-gray-500">
                    Logo genérico (se reemplazará por el banco real).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}