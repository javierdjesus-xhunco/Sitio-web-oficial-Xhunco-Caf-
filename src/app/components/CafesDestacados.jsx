"use client";

import { useRef, useEffect } from "react";
import CafeCard from "./CafeCard";

const cafes = [
  {
    nombre: "Café Sierra Norte",
    descripcion: "Notas a chocolate oscuro y nuez.",
    precio: "280 MXN",
    imagen: "/cafes/cafe1.jpg",
  },
  {
    nombre: "Café Altura Chiapas",
    descripcion: "Aromas cítricos y cuerpo balanceado.",
    precio: "310 MXN",
    imagen: "/cafes/cafe2.jpg",
  },
  {
    nombre: "Café Oaxaca Orgánico",
    descripcion: "Suave, floral y acidez brillante.",
    precio: "295 MXN",
    imagen: "/cafes/cafe3.jpg",
  },
];

export default function CafesDestacados() {
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    intervalRef.current = setInterval(() => {
      slider.scrollBy({
        left: 1,
        behavior: "smooth",
      });

      if (
        slider.scrollLeft + slider.offsetWidth >=
        slider.scrollWidth
      ) {
        slider.scrollTo({ left: 0 });
      }
    }, 20);

    return () => clearInterval(intervalRef.current);
  }, []);

  const scrollLeft = () => {
    sliderRef.current.scrollBy({
      left: -320,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current.scrollBy({
      left: 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 relative">

        {/* TÍTULO + CONTROLES */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-semibold">
            Productos destacados
          </h2>

          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              ←
            </button>

            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              →
            </button>
          </div>
        </div>

        {/* CARRUSEL */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth"
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
