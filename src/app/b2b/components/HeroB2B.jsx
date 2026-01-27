"use client";

import Link from "next/link";

export default function HeroB2B() {
  return (
    <section className="min-h-[70vh] flex items-center">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">

        <div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Café de Calidad <br /> para negocios
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Abastecemos cafeterías, restaurantes, hoteles y empresas con
            café de alta calidad, trazabilidad garantizada y suministro
            confiable.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#contacto"
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Solicitar cotización
            </Link>

            <Link
              href="#proceso"
              className="px-6 py-3 border border-black rounded-md hover:bg-black hover:text-white transition"
            >
              Cómo trabajamos
            </Link>
          </div>
        </div>

        <div className="hidden md:flex justify-center">
          <div className="w-full h-[380px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
            Imagen B2B
          </div>
        </div>

      </div>
    </section>
  );
}
