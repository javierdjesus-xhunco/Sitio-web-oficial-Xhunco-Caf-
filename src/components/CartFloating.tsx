"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const BRAND = "#31572c";
const BRAND_DARK = "#25441f";

export default function CartFloating() {
  const {
    carrito,
    isOpen,
    setIsOpen,
    updateQty,
    removeItem,
  } = useCart();

  const [hovered, setHovered] = useState(false);

  const items = Object.values(carrito);

  const total = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  if (!items.length) return null;

  return (
    <>
      {/* BOTÓN FLOTANTE MINIMAL + TOOLTIP */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="fixed bottom-6 right-6 z-50 transition-transform duration-300 hover:scale-110"
        >
          <div className="relative">
            {/* ICONO */}
            <div className="relative h-12 w-12">
              <Image
                src="/carrito.png"
                alt="Carrito"
                fill
                className="object-contain drop-shadow-md"
              />
            </div>

            {/* BADGE */}
            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow animate-in fade-in zoom-in">
              {items.length}
            </div>

            {/* TOOLTIP (TOTAL) */}
            <div
              className={`absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black px-3 py-1 text-xs text-white shadow-lg transition-all duration-200 ${
                hovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2 pointer-events-none"
              }`}
            >
              ${total.toFixed(2)} MXN
            </div>
          </div>
        </button>
      )}

      {/* OVERLAY */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* DRAWER */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[380px] max-w-[95vw] bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Tu carrito
          </h3>
          <button onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5 text-slate-500 hover:text-black" />
          </button>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 border rounded-xl p-3"
            >
              {/* IMAGEN */}
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-100">
                <Image
                  src={item.imagen || "/suministros/placeholder.svg"}
                  alt={item.nombre}
                  fill
                  className="object-cover"
                />
              </div>

              {/* INFO */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 line-clamp-1">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-slate-500">
                    ${item.precio.toFixed(2)}
                  </p>
                </div>

                {/* CONTROLES */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        updateQty(item.id, item.cantidad - 1)
                      }
                      className="px-2 py-1 hover:bg-slate-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="px-3 text-sm font-medium">
                      {item.cantidad}
                    </span>

                    <button
                      onClick={() =>
                        updateQty(item.id, item.cantidad + 1)
                      }
                      className="px-2 py-1 hover:bg-slate-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* TOTAL */}
              <div className="text-sm font-semibold">
                ${(item.precio * item.cantidad).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="border-t p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-semibold">
              ${total.toFixed(2)} MXN
            </span>
          </div>

          <a
            href="/suministros/carrito"
            className="block w-full text-center rounded-xl py-3 text-sm font-semibold text-white transition"
            style={{ backgroundColor: BRAND }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = BRAND_DARK)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = BRAND)
            }
          >
           Confirmar Pedido
          </a>
        </div>
      </div>
    </>
  );
}