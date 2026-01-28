"use client";

import {
  MessageSquare,
  FileText,
  Coffee,
  Handshake,
} from "lucide-react";

const pasos = [
  {
    icono: MessageSquare,
    titulo: "Contacto inicial",
    descripcion:
      "Conocemos tu negocio, volumen, necesidades y objetivos para entender cómo podemos ayudarte.",
  },
  {
    icono: FileText,
    titulo: "Propuesta personalizada",
    descripcion:
      "Diseñamos una propuesta a la medida: cafés, precios, logística y servicios específicos.",
  },
  {
    icono: Coffee,
    titulo: "Pruebas & arranque",
    descripcion:
      "Realizamos pruebas de producto y ajustes antes de iniciar el suministro formal.",
  },
  {
    icono: Handshake,
    titulo: "Relación a largo plazo",
    descripcion:
      "Acompañamiento continuo, abastecimiento constante y evolución conforme crece tu negocio.",
  },
];

export default function ProcesoB2B() {
  return (
    <section className="py-28 bg-[#F8F7F5]">
      <div className="max-w-7xl mx-auto px-8">

        {/* TÍTULO */}
        <div className="max-w-2xl mb-20">
          <h2 className="text-4xl font-semibold mb-4">
            Nuestro proceso de trabajo
          </h2>
          <p className="text-gray-600 text-lg">
            Un proceso claro, humano y eficiente que nos permite
            construir relaciones sólidas con cada cliente.
          </p>
        </div>

        {/* PASOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">

          {/* LÍNEA CONECTORA */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-px bg-gray-300"></div>

          {pasos.map((paso, index) => {
            const Icon = paso.icono;

            return (
              <div
                key={index}
                className="relative bg-white border border-gray-200 rounded-3xl p-8 text-center"
              >
                {/* NUMERO */}
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>

                {/* ICONO */}
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gray-900 text-white mx-auto mb-6 mt-6">
                  <Icon size={26} />
                </div>

                {/* TEXTO */}
                <h3 className="text-xl font-semibold mb-3">
                  {paso.titulo}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
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
