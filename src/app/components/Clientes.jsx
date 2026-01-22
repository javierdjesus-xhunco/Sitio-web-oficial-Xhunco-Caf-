"use client";

import { useEffect, useRef } from "react";

export default function Clientes() {
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const startScroll = () => {
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

    const stopScroll = () => {
      clearInterval(intervalRef.current);
    };

    startScroll();

    slider.addEventListener("mouseenter", stopScroll);
    slider.addEventListener("mouseleave", startScroll);

    return () => {
      stopScroll();
      slider.removeEventListener("mouseenter", stopScroll);
      slider.removeEventListener("mouseleave", startScroll);
    };
  }, []);

  return (
    <section
      id="clientes"
      className="mt-40 py-24 bg-[#F8F7F5] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-8 mb-12">
        <h2 className="text-4xl font-semibold">
          Nuestros clientes
        </h2>
        <p className="mt-4 text-gray-600">
          Negocios que confían en Xhunco® Café
        </p>
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
