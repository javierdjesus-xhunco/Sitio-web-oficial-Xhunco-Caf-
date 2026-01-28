"use client";

export default function OfrecemosB2B() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">

        <div>
          <h2 className="text-3xl font-semibold mb-6">
            Lo que ofrecemos
          </h2>

          <p className="text-gray-600 mb-8">
            Nos adaptamos a las necesidades de tu negocio con soluciones
            claras, consistentes y de alta calidad.
          </p>

          <ul className="space-y-4 text-gray-700">
            <li>✔ Grano o molido</li>
            <li>✔ Tuestes personalizados</li>
            <li>✔ Trazabilidad y origen garantizados</li>
            <li>✔ Suministro constante</li>
            <li>✔ Atención directa y personalizada</li>
          </ul>
        </div>

        <div className="w-full h-[320px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
          Imagen de producto
        </div>

      </div>
    </section>
  );
}
