import Image from "next/image";
import Link from "next/link";

export default function B2B() {
  return (
    <section className="bg-[#F7F3EE] py-28">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* COLUMNA TEXTO */}
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-medium bg-[#EDE7DF] text-[#6B3E26] px-4 py-1.5 rounded-full mb-6">
            Soluciones B2B
          </span>

          <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Café de especialidad <br />
            <span className="text-[#6B3E26]">para tu negocio</span>
          </h2>

          <p className="text-gray-700 text-lg mb-10 max-w-xl">
            Ofrecemos soluciones integrales para cafeterías, restaurantes,
            hoteles y oficinas. Desde el suministro de granos premium hasta
            capacitación barista y equipamiento.
          </p>

          {/* BENEFICIOS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border shadow-sm">
                ☕
              </div>
              <h4 className="font-semibold">Calidad Premium</h4>
              <p className="text-sm text-gray-600">
                Café de especialidad con puntaje SCA +85
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border shadow-sm">
                🚚
              </div>
              <h4 className="font-semibold">Logística Eficiente</h4>
              <p className="text-sm text-gray-600">
                Entregas programadas en todo México
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border shadow-sm">
                🎧
              </div>
              <h4 className="font-semibold">Soporte Dedicado</h4>
              <p className="text-sm text-gray-600">
                Asesoría y capacitación para tu equipo
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#2A1A12] text-white font-medium hover:bg-[#1f130d] transition"
            >
              Solicitar Cotización →
            </Link>

            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[#2A1A12] text-[#2A1A12] font-medium hover:bg-[#2A1A12] hover:text-white transition"
            >
              Hablar con un Asesor
            </Link>
          </div>
        </div>

        {/* COLUMNA IMÁGENES */}
        <div className="grid grid-cols-2 gap-6">
          <div className="row-span-2 rounded-3xl overflow-hidden">
            <Image
              src="/b2b/cafe-terraza.jpg"
              alt="Cafetería"
              width={600}
              height={800}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <Image
              src="/b2b/latte-art.jpg"
              alt="Latte art"
              width={400}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <Image
              src="/b2b/granos-cafe.jpg"
              alt="Granos de café"
              width={400}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
