"use client";

import { useRef, useEffect } from "react";
import CafeCard from "./CafeCard";

const cafes = [
  {
    nombre: "Café Veracruz - Zongolica",
    descripcion: "Notas a chocolate oscuro y nuez.",
    precio: "369 MXN",
    imagen: "/cafes/xhuncoveracruz.png",
  },
  {
    nombre: "Café Chiapas - Chilon",
    descripcion: "Aromas cítricos y cuerpo balanceado.",
    precio: "379 MXN",
    imagen: "/cafes/xhuncochiapas.png",
  },
  {
    nombre: "Café Oaxaca - Pluma Hidalgo",
    descripcion: "Suave, floral y acidez brillante.",
    precio: "389 MXN",
    imagen: "/cafes/xhuncooaxaca.png",
  },
];

export default function CafesDestacados() {
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const startAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        slider.scrollLeft += 1;

        if (
          slider.scrollLeft + slider.offsetWidth >=
          slider.scrollWidth
        ) {
          slider.scrollTo({ left: 0, behavior: "auto" });
        }
      }, 20);
    };

    startAutoScroll();

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const handleScroll = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const offset = slider.offsetWidth * 0.8;
    slider.scrollLeft += direction * offset;
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
          <h2 className="text-4xl font-semibold">
            Productos destacados
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleScroll(-1)}
              aria-label="Retroceder productos destacados"
              className="h-10 w-10 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleScroll(1)}
              aria-label="Avanzar productos destacados"
              className="h-10 w-10 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto no-scrollbar"
        >
          {[...cafes, ...cafes].map((cafe, index) => (
            <div
              key={index}
              className="min-w-[300px] md:min-w-[360px]"
            >
              <CafeCard cafe={cafe} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
