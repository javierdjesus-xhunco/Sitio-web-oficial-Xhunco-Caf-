"use client";

import { useEffect, useRef } from "react";

export default function Clientes() {
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const startScroll = () => {
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

    startScroll();

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
    <section
      id="clientes"
      className="mt-40 py-24 bg-[#F8F7F5] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-8 mb-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-semibold">
            Nuestros clientes
          </h2>
          <p className="mt-4 text-gray-600">
            Negocios que confían en Xhunco® Café
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleScroll(-1)}
            aria-label="Retroceder clientes"
            className="h-10 w-10 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => handleScroll(1)}
            aria-label="Avanzar clientes"
            className="h-10 w-10 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-16 px-8 overflow-x-auto no-scrollbar"
      >
        {[1, 2, 3, 4, 1, 2, 3, 4].map((i, index) => (
          <div
            key={index}
            className="min-w-[160px] h-16 bg-black text-white flex items-center justify-center opacity-70 hover:opacity-100 transition"
          >
            Cliente {i}
          </div>
        ))}
      </div>
    </section>
  );
}
