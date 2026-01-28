"use client";

import {
  Truck,
  Coffee,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const beneficios = [
  {
    icono: Coffee,
    titulo: "Café de especialidad garantizado",
    descripcion:
      "Granos cuidadosamente seleccionados, tostados bajo estándares de calidad y consistencia.",
  },
  {
    icono: Truck,
    titulo: "Abastecimiento confiable",
    descripcion:
      "Entregas puntuales y disponibilidad constante para que tu operación nunca se detenga.",
  },
  {
    icono: ShieldCheck,
    titulo: "Transparencia y trazabilidad",
    descripcion:
      "Origen claro, procesos responsables y total confianza en cada lote que recibes.",
  },
  {
    icono: TrendingUp,
    titulo: "Crecemos contigo",
    descripcion:
      "Escalamos volúmenes, ajustamos precios y evolucionamos conforme crece tu negocio.",
  },
];

export default function BeneficiosB2B() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-8">

        {/* HEADER */}
        <div className="max-w-2xl mb-20">
          <h2 className="text-4xl font-semibold mb-4">
            Beneficios para tu negocio
          </h2>
          <p className="text-gray-600 text-lg">
            Más que un proveedor, somos un aliado estratégico
            para la operación y crecimiento de tu empresa.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {beneficios.map((beneficio, index) => {
            const Icon = beneficio.icono;

            return (
              <div
                key={index}
                className="bg-[#F8F7F5] border border-gray-200 rounded-3xl p-8"
              >
                {/* ICONO */}
                <div className="h-14 w-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center mb-6">
                  <Icon size={26} />
                </div>

                {/* TEXTO */}
                <h3 className="text-xl font-semibold mb-3">
                  {beneficio.titulo}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
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
