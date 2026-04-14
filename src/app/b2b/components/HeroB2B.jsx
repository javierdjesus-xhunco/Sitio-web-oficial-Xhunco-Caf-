"use client";

import { ArrowRight, BadgeCheck } from "lucide-react";

const highlights = [
  "Atención B2B especializada",
  "Abastecimiento continuo",
  "Acompañamiento continuo",
];

export default function HeroB2B() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#F7F5F1_0%,#EEE7DD_100%)]">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,rgba(107,62,38,0.10),transparent_35%)]" />
      <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#6B3E26]/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1.15fr_0.85fr] md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DED5CA] bg-white/90 px-4 py-2 text-sm font-medium text-[#6B3E26] shadow-sm">
            <BadgeCheck className="h-4 w-4" />
            Soluciones B2B
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#0F172A] md:text-5xl lg:text-6xl">
            Soluciones de café para negocios que buscan operar mejor
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#475569] md:text-lg">
            Ayudamos a cafeterías, restaurantes, hoteles, oficinas y distribuidores
            con un modelo de abastecimiento, soporte y acompañamiento continuo
            para construir una operación más ordenada y confiable.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#E4DCCF] bg-white px-4 py-2 text-sm text-[#334155] shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#formulario-b2b"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2A1A12] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#1E120D]"
            >
              Solicitar cotización
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#proceso-b2b"
              className="inline-flex items-center justify-center rounded-full border border-[#2A1A12]/15 bg-white px-6 py-3.5 text-sm font-medium text-[#2A1A12] transition hover:border-[#2A1A12] hover:bg-[#2A1A12] hover:text-white"
            >
              Conocer proceso
            </a>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#E8E0D6] bg-white/95 p-6 shadow-[0_20px_60px_rgba(42,26,18,0.08)] backdrop-blur md:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#94A3B8]">
                Modelo de servicio
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#0F172A]">
                Suministro + soporte + acompañamiento
              </h3>
            </div>

            <div className="rounded-2xl bg-[#F5EFE8] px-3 py-1 text-xs font-semibold text-[#6B3E26]">
              Escalable
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-[#EFE8DE] bg-[#FCFBF9] p-4">
              <p className="text-sm font-semibold text-[#0F172A]">
                Atención B2B especializada
              </p>
              <p className="mt-1 text-sm leading-6 text-[#475569]">
                Un modelo pensado para negocios que requieren seguimiento,
                respuesta y continuidad operativa.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EFE8DE] bg-[#FCFBF9] p-4">
              <p className="text-sm font-semibold text-[#0F172A]">
                Abastecimiento continuo
              </p>
              <p className="mt-1 text-sm leading-6 text-[#475569]">
                Planeación de entregas y soporte para mantener tu operación
                activa y con mayor orden.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EFE8DE] bg-[#FCFBF9] p-4">
              <p className="text-sm font-semibold text-[#0F172A]">
                Acompañamiento continuo
              </p>
              <p className="mt-1 text-sm leading-6 text-[#475569]">
                Relación comercial cercana para ayudarte a crecer con una
                solución más estable y escalable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}