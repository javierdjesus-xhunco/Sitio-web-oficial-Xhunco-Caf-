"use client";

import {
  BadgeCheck,
  Truck,
  Headphones,
} from "lucide-react";

export default function FormularioB2B() {
  return (
    <section className="py-32 bg-[#F8F7F5]">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* COLUMNA IZQUIERDA */}
          <div>
            <span className="uppercase text-sm tracking-widest text-gray-500">
              Contacto
            </span>

            <h2 className="text-4xl font-semibold mt-4 mb-6 leading-tight">
              Hablemos de tu <br />
              <span className="text-[#7B4A2D]">proyecto de café</span>
            </h2>

            <p className="text-gray-600 text-lg mb-14 max-w-md">
              Cuéntanos sobre tu negocio y un asesor especializado se pondrá
              en contacto contigo en menos de 24 horas.
            </p>

            {/* BENEFICIOS */}
            <div className="space-y-8">

              <div className="flex gap-5 items-start">
                <div className="h-12 w-12 rounded-2xl bg-[#EFE6DE] flex items-center justify-center">
                  <BadgeCheck className="text-[#7B4A2D]" size={22} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Calidad garantizada
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cafés con puntaje SCA superior a 85 puntos.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="h-12 w-12 rounded-2xl bg-[#EFE6DE] flex items-center justify-center">
                  <Truck className="text-[#7B4A2D]" size={22} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Entregas nacionales
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cobertura en todo México con tiempos garantizados.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="h-12 w-12 rounded-2xl bg-[#EFE6DE] flex items-center justify-center">
                  <Headphones className="text-[#7B4A2D]" size={22} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Soporte continuo
                  </h4>
                  <p className="text-sm text-gray-600">
                    Asesoría técnica y comercial durante toda la relación.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMNA DERECHA - FORMULARIO */}
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* EMPRESA */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]"
                />
              </div>

              {/* CONTACTO */}
              <div>
                <label className="text-sm font-medium">
                  Nombre de Contacto *
                </label>
                <input
                  type="text"
                  className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]"
                />
              </div>

              {/* TEL / NEGOCIO */}
              <div>
                <label className="text-sm font-medium">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Tipo de Negocio *
                </label>
                <select className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3">
                  <option>Selecciona...</option>
                  <option>Cafetería</option>
                  <option>Restaurante</option>
                  <option>Hotel</option>
                  <option>Oficina</option>
                  <option>Distribuidor</option>
                </select>
              </div>

              {/* CIUDAD / VOLUMEN */}
              <div>
                <label className="text-sm font-medium">
                  Ciudad
                </label>
                <input
                  type="text"
                  className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Volumen Mensual Estimado
                </label>
                <select className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3">
                  <option>Selecciona...</option>
                  <option>Menos de 10 kg</option>
                  <option>10 – 30 kg</option>
                  <option>30 – 100 kg</option>
                  <option>Más de 100 kg</option>
                </select>
              </div>

              {/* MENSAJE */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  placeholder="Cuéntanos más sobre tus necesidades..."
                  className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>

              {/* BOTÓN */}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#3B2F2F] text-white py-4 rounded-2xl font-semibold hover:bg-black transition"
                >
                  Enviar solicitud
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
