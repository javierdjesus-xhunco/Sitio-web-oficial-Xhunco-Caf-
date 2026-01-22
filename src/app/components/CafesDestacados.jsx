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

    const startAutoScroll = () => {
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
    };

    const stopAutoScroll = () => {
      clearInterval(intervalRef.current);
    };

    startAutoScroll();

    slider.addEventListener("mouseenter", stopAutoScroll);
    slider.addEventListener("mouseleave", startAutoScroll);

    return () => {
      stopAutoScroll();
      slider.removeEventListener("mouseenter", stopAutoScroll);
      slider.removeEventListener("mouseleave", startAutoScroll);
    };
  }, []);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-4xl font-semibold mb-12">
          Productos destacados
        </h2>

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
