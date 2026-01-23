"use client";

import { useEffect, useRef } from "react";

const clientes = [
  {
    nombre: "Café Central",
    telefono: "+52 55 1234 5678",
    correo: "contacto@cafecentral.mx",
    imagen: "/clientes/cliente-placeholder.svg",
    redes: [
      { nombre: "Instagram", url: "https://instagram.com/cafecentral" },
      { nombre: "Facebook", url: "https://facebook.com/cafecentral" },
    ],
  },
  {
    nombre: "Panadería La Espiga",
    telefono: "+52 81 2345 6789",
    correo: "hola@laespiga.mx",
    imagen: "/clientes/cliente-placeholder.svg",
    redes: [
      { nombre: "Instagram", url: "https://instagram.com/laespiga" },
      { nombre: "WhatsApp", url: "https://wa.me/528123456789" },
    ],
  },
  {
    nombre: "Hotel Sierra Azul",
    telefono: "+52 33 3456 7890",
    correo: "ventas@sierrasazul.mx",
    imagen: "/clientes/cliente-placeholder.svg",
    redes: [
      { nombre: "LinkedIn", url: "https://linkedin.com/company/sierrasazul" },
      { nombre: "Facebook", url: "https://facebook.com/sierrasazul" },
    ],
  },
  {
    nombre: "Restaurante Valle Verde",
    telefono: "+52 222 456 7890",
    correo: "reservas@valleverde.mx",
    imagen: "/clientes/cliente-placeholder.svg",
    redes: [
      { nombre: "Instagram", url: "https://instagram.com/valleverde" },
      { nombre: "TikTok", url: "https://tiktok.com/@valleverde" },
    ],
  },
];

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
        className="flex gap-8 px-8 overflow-x-auto no-scrollbar"
      >
        {[...clientes, ...clientes].map((cliente, index) => (
          <article
            key={`${cliente.nombre}-${index}`}
            className="min-w-[260px] md:min-w-[300px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={cliente.imagen}
                alt={`Logo de ${cliente.nombre}`}
                className="h-16 w-16 rounded-full object-cover border border-gray-200"
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {cliente.nombre}
              </h3>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium text-gray-800">
                  Contacto:
                </span>{" "}
                {cliente.telefono}
              </p>
              <p>
                <span className="font-medium text-gray-800">
                  Correo:
                </span>{" "}
                {cliente.correo}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {cliente.redes.map((red) => (
                <a
                  key={red.nombre}
                  href={red.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-amber-700 hover:text-amber-600 transition"
                >
                  {red.nombre}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}