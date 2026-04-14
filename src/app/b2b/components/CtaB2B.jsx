"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaB2B() {
  return (
    <section className="relative overflow-hidden bg-[#2A1A12] py-24 text-white md:py-28">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,#ffffff,transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
          Soluciones B2B
        </span>

        <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
          Construyamos una solución de café para tu negocio
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
          Trabajemos en una operación más ordenada, con abastecimiento continuo,
          atención especializada y acompañamiento a largo plazo.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="#formulario-b2b"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#2A1A12] transition hover:bg-[#F3ECE5]"
          >
            Solicitar asesoría
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/suministros"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ver catálogo
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/60">
          Atención B2B especializada · Abastecimiento continuo · Acompañamiento continuo
        </p>
      </div>
    </section>
  );
}