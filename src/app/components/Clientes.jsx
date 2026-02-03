"use client";

import { useEffect, useRef } from "react";

const clientes = [
  {
    nombre: "Barro Negro",
    telefono: "+522461299630",
    correo: "nobody@xno.com",
    imagen: "/clientes/barronegro.svg",
    redes: [
      { nombre: "Instagram", url: "https://www.instagram.com/barronegroterraza/" },
      { nombre: "Facebook", url: "https://facebook.com/cafecentral" },
    ],
  },
  {
    nombre: "Vive Cafe y Alitas",
    telefono: "+522464766405",
    correo: "jomahs@hotmail.com",
    imagen: "/clientes/vivecafe.svg",
    redes: [
      { nombre: "Instagram", url: "https://instagram.com/laespiga" },
      { nombre: "WhatsApp", url: "https://wa.me/528123456789" },
    ],
  },
  {
    nombre: "MOYA",
    telefono: "+526683406688",
    correo: "nobody@xno.com",
    imagen: "/clientes/moya.svg",
    redes: [
      { nombre: "LinkedIn", url: "https://linkedin.com/company/sierrasazul" },
      { nombre: "Facebook", url: "https://facebook.com/sierrasazul" },
    ],
  },
  {
    nombre: "La Cabaña del Pescador",
    telefono: "+522461744451",
    correo: "nobody@xno.mx",
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

    intervalRef.current = setInterval(() => {
      slider.scrollLeft += 1;

      if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth) {
        slider.scrollTo({ left: 0, behavior: "auto" });
      }
    }, 20);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleScroll = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const offset = slider.offsetWidth * 0.8;
    slider.scrollLeft += direction * offset;
  };

  return (
    <section id="clientes" className="mt-40 py-24 bg-[#F8F7F5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 mb-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-semibold">Nuestros Socios</h2>
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
            {/* LOGO CENTRADO – NO SE MUESTRA EL NOMBRE */}
            <div className="flex justify-center">
              <img
                src={cliente.imagen}
                alt="Logo del cliente"
                className="h-24 w-24 object-contain"
              />
            </div>

            {/* DATOS */}
            <div className="text-sm text-gray-600 space-y-1 text-center">
              <p>
                <span className="font-medium text-gray-800">Contacto:</span>{" "}
                {cliente.telefono}
              </p>
              <p>
                <span className="font-medium text-gray-800">Correo:</span>{" "}
                {cliente.correo}
              </p>
            </div>

            {/* REDES */}
            <div className="flex flex-wrap justify-center gap-3">
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
