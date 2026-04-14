"use client";

import { Coffee, Building2, Hotel, Handshake } from "lucide-react";

const segmentos = [
  {
    titulo: "Restaurantes y cafeterías",
    descripcion:
      "Para negocios que necesitan continuidad en su servicio de café, mejor orden operativo y atención cercana.",
    icono: Coffee,
  },
  {
    titulo: "Hoteles y hospitalidad",
    descripcion:
      "Para operaciones que buscan una solución consistente para habitaciones, desayunos, áreas comunes o amenidades.",
    icono: Hotel,
  },
  {
    titulo: "Oficinas y corporativos",
    descripcion:
      "Para espacios de trabajo que quieren resolver su servicio de café con mayor estructura y seguimiento.",
    icono: Building2,
  },
  {
    titulo: "Distribuidores y aliados",
    descripcion:
      "Para partners comerciales que requieren una relación confiable, escalable y con acompañamiento continuo.",
    icono: Handshake,
  },
];

export default function ParaQuienB2B() {
  return (
    <section className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-[#E6DED4] bg-[#FAF8F5] px-4 py-2 text-sm font-medium text-[#6B3E26]">
            ¿Para quién?
          </span>

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A] md:text-5xl">
            Diseñado para negocios que necesitan una solución de café más ordenada
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#475569] md:text-lg">
            Trabajamos con negocios que buscan continuidad, atención especializada
            y una relación comercial más sólida para operar mejor.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {segmentos.map((item) => {
            const Icon = item.icono;

            return (
              <div
                key={item.titulo}
                className="group rounded-[28px] border border-[#E9E1D8] bg-[#FCFBF9] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(42,26,18,0.06)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3ECE5] text-[#6B3E26]">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-[#0F172A]">
                  {item.titulo}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#475569] md:text-[15px]">
                  {item.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}