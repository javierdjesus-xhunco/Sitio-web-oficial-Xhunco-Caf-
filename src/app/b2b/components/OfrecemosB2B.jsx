"use client";

import {
  Coffee,
  Truck,
  Settings,
  BadgeCheck,
} from "lucide-react";

const ofertas = [
  {
    icono: Coffee,
    titulo: "Suministro para tu operación",
    descripcion:
      "Una solución de café pensada para negocios que requieren continuidad, seguimiento y atención especializada.",
    puntos: [
      "Atención B2B especializada",
      "Planeación de suministro",
      "Seguimiento comercial",
    ],
  },
  {
    icono: Truck,
    titulo: "Abastecimiento continuo",
    descripcion:
      "Entregas programadas y coordinación operativa para ayudarte a mantener tu servicio activo con mayor orden.",
    puntos: [
      "Entregas programadas",
      "Mayor continuidad operativa",
      "Abasto más predecible",
    ],
  },
  {
    icono: Settings,
    titulo: "Soporte y acompañamiento",
    descripcion:
      "Asesoría para ayudarte a implementar una operación más funcional y sostenerla conforme tu negocio evoluciona.",
    puntos: [
      "Asesoría operativa",
      "Seguimiento continuo",
      "Acompañamiento comercial",
    ],
  },
  {
    icono: BadgeCheck,
    titulo: "Solución escalable",
    descripcion:
      "Un modelo que puede adaptarse a distintos volúmenes, formatos de negocio y etapas de crecimiento.",
    puntos: [
      "Escalable",
      "Flexible",
      "Relación de largo plazo",
    ],
  },
];

export default function OfrecemosB2B() {
  return (
    <section className="bg-[#F7F5F1] py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-[#E6DED4] bg-white px-4 py-2 text-sm font-medium text-[#6B3E26]">
            Lo que ofrecemos
          </span>

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A] md:text-5xl">
            Un modelo de servicio pensado para negocios
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#475569] md:text-lg">
            Integramos abastecimiento, soporte y acompañamiento en una solución
            más clara, escalable y orientada a la operación.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {ofertas.map((item) => {
            const Icon = item.icono;

            return (
              <div
                key={item.titulo}
                className="rounded-[28px] border border-[#E8E0D6] bg-white p-7 shadow-[0_16px_40px_rgba(42,26,18,0.04)] transition hover:shadow-[0_20px_50px_rgba(42,26,18,0.07)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2A1A12] text-white">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-[#0F172A]">
                  {item.titulo}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#475569] md:text-[15px]">
                  {item.descripcion}
                </p>

                <ul className="mt-6 space-y-3 text-sm text-[#334155]">
                  {item.puntos.map((punto) => (
                    <li key={punto} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#2A1A12]" />
                      {punto}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}