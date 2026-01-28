export default function HeroB2B() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#6FDEA6] to-[#0F172A] text-white">
      {/* Decoración */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />

      <div className="relative max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

        {/* TEXTO */}
        <div>
          <span className="inline-block mb-4 px-4 py-1 text-sm tracking-wide rounded-full bg-white/10">
            Soluciones B2B
          </span>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Café de especialidad <br />
            para empresas que exigen calidad
          </h1>

          <p className="text-lg text-gray-300 max-w-xl mb-8">
            Abastece tu negocio con café premium, atención personalizada
            y soluciones a la medida para oficinas, hoteles, restaurantes
            y distribuidores.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <a
              href="#formulario-b2b"
              className="bg-[#C7A46A] hover:bg-[#b38f55] text-black font-semibold px-8 py-3 rounded-full transition"
            >
              Solicitar cotización
            </a>

            <a
              href="#beneficios-b2b"
              className="border border-white/30 hover:border-white px-8 py-3 rounded-full transition"
            >
              Conocer beneficios
            </a>
          </div>
        </div>

        {/* IMAGEN / MOCKUP */}
        <div className="relative">
          <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
            {/* Aquí va tu imagen */}
            <span className="text-gray-400 text-sm">
              Imagen / Mockup del producto
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
