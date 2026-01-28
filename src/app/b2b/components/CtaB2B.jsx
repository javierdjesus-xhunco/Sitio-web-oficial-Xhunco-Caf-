"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaB2B() {
  return (
    <section className="py-28 bg-[#2F2421] text-white relative overflow-hidden">

      {/* DECORACIÓN SUAVE */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,#ffffff,transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-8 text-center">

        <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
          Lleva tu negocio de café <br />
          al siguiente nivel
        </h2>

        <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-12">
          Trabaja con un proveedor especializado en café de especialidad,
          suministros y asesoría integral para negocios que buscan crecer
          con calidad y consistencia.
        </p>

        {/* BOTONES */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">

          {/* CTA PRINCIPAL */}
          <Link
            href="#contacto"
            className="inline-flex items-center justify-center gap-3 bg-[#7B4A2D] hover:bg-[#8A5A3C] text-white px-10 py-4 rounded-2xl font-semibold transition"
          >
            Solicitar asesoría
            <ArrowRight size={20} />
          </Link>

          {/* CTA SECUNDARIO */}
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center px-10 py-4 rounded-2xl font-semibold border border-white/30 hover:bg-white/10 transition"
          >
            Ver catálogo
          </Link>

        </div>

        {/* MICRO COPY */}
        <p className="text-sm text-gray-300 mt-10">
          Atención personalizada · Entregas nacionales · Café de especialidad
        </p>

      </div>
    </section>
  );
}
