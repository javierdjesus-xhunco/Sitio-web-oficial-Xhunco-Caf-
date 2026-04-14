"use client";

import {
  Truck,
  ShieldCheck,
  TrendingUp,
  Headphones,
} from "lucide-react";

const beneficios = [
  {
    icono: Truck,
    titulo: "Mayor continuidad operativa",
    descripcion:
      "Planeación y seguimiento para ayudarte a sostener tu servicio de café sin fricciones innecesarias.",
  },
  {
    icono: ShieldCheck,
    titulo: "Relación comercial confiable",
    descripcion:
      "Un partner que da seguimiento, acompaña tu operación y construye una relación de largo plazo.",
  },
  {
    icono: Headphones,
    titulo: "Atención más cercana",
    descripcion:
      "Soporte y acompañamiento continuo para resolver necesidades operativas con mayor claridad.",
  },
  {
    icono: TrendingUp,
    titulo: "Modelo escalable",
    descripcion:
      "Una solución que puede crecer con tu negocio y adaptarse a nuevos volúmenes o formatos.",
  },
];

export default function BeneficiosB2B() {
  return (
    <section className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-[#E6DED4] bg-[#FAF8F5] px-4 py-2 text-sm font-medium text-[#6B3E26]">
            Beneficios
          </span>

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A] md:text-5xl">
            Más que suministro: una solución para operar mejor
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#475569] md:text-lg">
            Buscamos ayudarte a construir una operación más estable, con mejor
            seguimiento y una relación comercial que acompañe tu crecimiento.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {beneficios.map((beneficio) => {
            const Icon = beneficio.icono;

            return (
              <div
                key={beneficio.titulo}
                className="rounded-[28px] border border-[#E8E0D6] bg-[#FCFBF9] p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2A1A12] text-white">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-[#0F172A]">
                  {beneficio.titulo}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#475569] md:text-[15px]">
                  {beneficio.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}