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
    titulo: "Café de Especialidad",
    descripcion:
      "Granos seleccionados, tostados de forma artesanal y perfiles adaptados a las necesidades de tu negocio.",
    puntos: [
      "Origen trazable",
      "Tostado fresco",
      "Perfiles personalizados",
    ],
  },
  {
    icono: Truck,
    titulo: "Suministro Constante",
    descripcion:
      "Logística confiable para que nunca te quedes sin café, con entregas programadas y atención personalizada.",
    puntos: [
      "Abastecimiento continuo",
      "Planeación mensual",
      "Soporte dedicado",
    ],
  },
  {
    icono: Settings,
    titulo: "Equipamiento & Asesoría",
    descripcion:
      "Te ayudamos a elegir, usar y optimizar el equipo ideal para ofrecer una taza perfecta.",
    puntos: [
      "Asesoría técnica",
      "Capacitación básica",
      "Optimización operativa",
    ],
  },
  {
    icono: BadgeCheck,
    titulo: "Marca Blanca & Alianzas",
    descripcion:
      "Desarrolla tu propia marca de café con el respaldo de Xhunco®.",
    puntos: [
      "Empaque personalizado",
      "Escalabilidad",
      "Soporte comercial",
    ],
  },
];

export default function OfrecemosB2B() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-8">

        {/* TÍTULO */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl font-semibold mb-4">
            ¿Qué ofrecemos a tu negocio?
          </h2>
          <p className="text-gray-600 text-lg">
            Soluciones integrales para negocios que buscan calidad,
            consistencia y una relación a largo plazo.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {ofertas.map((item, index) => {
            const Icon = item.icono;

            return (
              <div
                key={index}
                className="group bg-gray-50 border border-gray-200 rounded-3xl p-8 transition hover:shadow-lg"
              >
                {/* ICONO */}
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gray-900 text-white mb-6">
                  <Icon size={28} />
                </div>

                {/* TITULO */}
                <h3 className="text-2xl font-semibold mb-3">
                  {item.titulo}
                </h3>

                {/* DESCRIPCIÓN */}
                <p className="text-gray-600 mb-6">
                  {item.descripcion}
                </p>

                {/* LISTA */}
                <ul className="space-y-2 text-sm text-gray-700">
                  {item.puntos.map((punto, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-900"></span>
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
