"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NuestraHistoria() {
  // ✅ Cambia/añade aquí tus imágenes (en /public)
  const slides = [
    "/recursos/hombrecaficultor3.jpg",
    "/recursos/mujercaficultora1.jpg",
    "/recursos/mujercaficultora2.jpg",
    "/recursos/mujercaficultora4.webp",
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000); // ✅ 2 segundos

    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* TEXTO */}
        <div>
          <h2 className="text-4xl font-semibold mb-6">Nuestra historia</h2>

          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Xhunco® Café nace con una idea clara: conectar el trabajo de los
            caficultores mexicanos con personas y negocios que valoran la
            calidad real, la trazabilidad y las relaciones honestas.
          </p>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Trabajamos directamente con regiones cafetaleras, cuidando cada
            etapa del proceso para ofrecer cafés consistentes, responsables y
            con identidad propia.
          </p>

          <Link
            href="/origenes"
            className="inline-block text-black font-medium border-b border-black hover:opacity-70 transition"
          >
            Conocer nuestros orígenes →
          </Link>
        </div>

        {/* GALERÍA (FADE) */}
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden">
          {slides.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt="Nuestra historia"
              fill
              priority={i === 0}
              className={[
                "object-cover",
                "absolute inset-0",
                "transition-opacity duration-700 ease-in-out", // ✅ desvanecido
                i === active ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
