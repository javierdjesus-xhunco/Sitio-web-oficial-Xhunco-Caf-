"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const images = [
  "/hero/hero1.png",
  "/hero/hero2.png",
  "/hero/hero3.png",
  "/hero/hero4.png",
  "/hero/hero5.png",
  "/hero/hero6.png",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* IMÁGENES DE FONDO */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* OVERLAY OSCURO */}
      <div className="absolute inset-0 bg-black/60" />

      {/* CONTENIDO */}
      <div className="relative z-10 text-center max-w-3xl px-6 text-white">
        <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight">
          Café con origen, <br /> historia y trazabilidad
        </h1>

        <p className="text-lg md:text-xl mb-10 text-gray-200">
          Cafés de especialidad cuidadosamente seleccionados,
          con procesos transparentes desde el origen hasta tu taza.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/cafes"
              className="border border-white hover:bg-white hover:text-black px-8 py-4 rounded-lg font-semibold transition"
          >
            Explorar cafés
          </Link>

          <Link
            href="/trazabilidad"
            className="border border-white hover:bg-white hover:text-black px-8 py-4 rounded-lg font-semibold transition"
          >
            Buscar mi lote
          </Link>
        </div>
      </div>
    </section>
  );
}
