"use client";

import {
  MessageSquare,
  FileText,
  Settings,
  Handshake,
} from "lucide-react";

const pasos = [
  {
    icono: MessageSquare,
    titulo: "Conocemos tu operación",
    descripcion:
      "Entendemos tu tipo de negocio, necesidades, ritmo operativo y objetivos para identificar la mejor solución.",
  },
  {
    icono: FileText,
    titulo: "Diseñamos una propuesta",
    descripcion:
      "Armamos una propuesta clara con enfoque en abastecimiento, seguimiento y acompañamiento para tu operación.",
  },
  {
    icono: Settings,
    titulo: "Implementamos la solución",
    descripcion:
      "Definimos la dinámica de trabajo, el esquema de suministro y los puntos clave para arrancar con mayor orden.",
  },
  {
    icono: Handshake,
    titulo: "Damos seguimiento continuo",
    descripcion:
      "Mantenemos una relación comercial cercana para ayudarte a sostener y escalar tu operación con continuidad.",
  },
];

export default function ProcesoB2B() {
  return (
    <section id="proceso-b2b" className="bg-[#F7F5F1] py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-[#E6DED4] bg-white px-4 py-2 text-sm font-medium text-[#6B3E26]">
            Proceso
          </span>

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A] md:text-5xl">
            Así trabajamos con cada negocio
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#475569] md:text-lg">
            Un proceso claro para implementar una solución más ordenada, funcional
            y sostenible en el tiempo.
          </p>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-[#DDD4C8] xl:block" />

          {pasos.map((paso, index) => {
            const Icon = paso.icono;

            return (
              <div
                key={paso.titulo}
                className="relative rounded-[28px] border border-[#E8E0D6] bg-white p-7 text-left shadow-[0_16px_40px_rgba(42,26,18,0.04)]"
              >
                <span className="absolute -top-4 left-7 flex h-9 w-9 items-center justify-center rounded-full bg-[#2A1A12] text-sm font-semibold text-white">
                  {index + 1}
                </span>

                <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3ECE5] text-[#6B3E26]">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-[#0F172A]">
                  {paso.titulo}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#475569] md:text-[15px]">
                  {paso.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}