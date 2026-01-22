export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur border-b border-gray-200">

  <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
    
<header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

    {/* Logo */}
    <div className="text-xl font-semibold tracking-wide">
      Xhunco® Café
    </div>

    {/* Menu */}
    <nav className="flex gap-8 text-sm text-gray-700">
      <a href="#cafes" className="hover:text-black transition">Cafés</a>
      <a href="#" className="hover:text-black transition">Tienda</a>
      <a href="#" className="hover:text-black transition">Negocios</a>
      <a href="#" className="hover:text-black transition">Orígenes</a>
      <a href="#clientes" className="hover:text-black transition">
        Nuestros Clientes
      </a>
      <a href="#" className="hover:text-black transition">Contacto</a>
    </nav>

  </div>
</header><header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

    {/* Logo */}
    <div className="text-xl font-semibold tracking-wide">
      Xhunco® Café
    </div>

    {/* Menu */}
    <nav className="flex gap-8 text-sm text-gray-700">
      <a href="#cafes" className="hover:text-black transition">Cafés</a>
      <a href="#" className="hover:text-black transition">Tienda</a>
      <a href="#" className="hover:text-black transition">Negocios</a>
      <a href="#" className="hover:text-black transition">Orígenes</a>
      <a href="#clientes" className="hover:text-black transition">
        Nuestros Clientes
      </a>
      <a href="#" className="hover:text-black transition">Contacto</a>
    </nav>

  </div>
</header>

    {/* Logo */}
    <div className="text-xl font-semibold tracking-wide">
      Xhunco® Café
    </div>

    {/* Menu */}
    <nav className="flex gap-8 text-sm text-gray-700">
      <a href="#cafes" className="hover:text-black transition">
        Cafés
      </a>
      <a href="#" className="hover:text-black transition">
        Tienda
      </a>
      <a href="#" className="hover:text-black transition">
        Negocios
      </a>
      <a href="#" className="hover:text-black transition">
        Orígenes
      </a>
      <a href="#" className="hover:text-black transition">
        Contacto
      </a>
    </nav>

  </div>
</header>

      {/* HEADER */}
        <h1 className="text-2xl font-bold tracking-wide">
          Xhunco® Café
        </h1>

        <nav className="flex gap-6 text-sm font-medium">
          <a href="#" className="hover:text-black">Inicio</a>
          <a href="#" className="hover:text-black">Tienda</a>
          <a href="#" className="hover:text-black">Orígenes</a>
          <a href="#" className="hover:text-black">Trazabilidad</a>
          <a href="#" className="hover:text-black">Academia</a>
          <a href="#" className="hover:text-black">Soluciones B2B</a>
          <a href="#" className="hover:text-black">Suministros</a>
          <a href="#" className="hover:text-black">Contacto</a>
        </nav>
      

      {/* HERO */}
      <section className="px-10 py-28 max-w-6xl mx-auto">
  <h2 className="text-5xl font-semibold leading-tight max-w-4xl">
    Café mexicano de especialidad,  
    trazable, honesto y hecho para quienes toman el café en serio.
  </h2>

  <p className="mt-8 text-lg text-gray-600 max-w-3xl leading-relaxed">
    En Xhunco® Café conectamos el trabajo de los caficultores con
    consumidores y negocios que buscan calidad real, consistencia
    y una relación transparente con su café.
  </p>

  <div className="mt-12 flex gap-4">
    <button className="px-7 py-3 bg-black text-white text-sm rounded-md">
      Explorar café
    </button>

    <button className="px-7 py-3 border border-black text-sm rounded-md">
      Soluciones para negocios
    </button>
  </div>
</section>
<section id="cafes" className="mt-40 max-w-7xl mx-auto px-8">
  <h2 className="text-4xl font-semibold mb-16">
    Cafés que distribuimos
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

    {/* Veracruz */}
    <div>
      <div className="relative h-[420px] rounded-xl overflow-hidden bg-gray-200">
        <img
          src="https://images.unsplash.com/photo-1509042239860-f550ce710b93"
          alt="Café Veracruz"
          className="w-full h-full object-cover"
        />
        <h3 className="absolute bottom-6 left-6 text-2xl text-white font-semibold">
          Veracruz
        </h3>
      </div>

      <div className="mt-6 text-sm text-gray-700 leading-relaxed">
        <p><strong>Proceso:</strong> Lavado</p>
        <p><strong>Notas:</strong> Chocolate, nuez, caramelo</p>
      </div>
    </div>

    {/* Chiapas */}
    <div>
      <div className="relative h-[420px] rounded-xl overflow-hidden bg-gray-200">
        <img
          src="https://images.unsplash.com/photo-1511920170033-f8396924c348"
          alt="Café Chiapas"
          className="w-full h-full object-cover"
        />
        <h3 className="absolute bottom-6 left-6 text-2xl text-white font-semibold">
          Chiapas
        </h3>
      </div>

      <div className="mt-6 text-sm text-gray-700 leading-relaxed">
        <p><strong>Proceso:</strong> Natural</p>
        <p><strong>Notas:</strong> Frutos rojos, cacao, cuerpo medio</p>
      </div>
    </div>

    {/* Puebla */}
    <div>
      <div className="relative h-[420px] rounded-xl overflow-hidden bg-gray-200">
        <img
          src="https://images.unsplash.com/photo-1521401292936-0a2129a30b1c"
          alt="Café Puebla"
          className="w-full h-full object-cover"
        />
        <h3 className="absolute bottom-6 left-6 text-2xl text-white font-semibold">
          Puebla
        </h3>
      </div>

      <div className="mt-6 text-sm text-gray-700 leading-relaxed">
        <p><strong>Proceso:</strong> Honey</p>
        <p><strong>Notas:</strong> Panela, miel, cítricos suaves</p>
      </div>
    </div>

    {/* Oaxaca */}
    <div>
      <div className="relative h-[420px] rounded-xl overflow-hidden bg-gray-200">
        <img
          src="https://images.unsplash.com/photo-1541167760496-1628856ab772"
          alt="Café Oaxaca"
          className="w-full h-full object-cover"
        />
        <h3 className="absolute bottom-6 left-6 text-2xl text-white font-semibold">
          Oaxaca
        </h3>
      </div>

      <div className="mt-6 text-sm text-gray-700 leading-relaxed">
        <p><strong>Proceso:</strong> Lavado</p>
        <p><strong>Notas:</strong> Floral, cacao, acidez balanceada</p>
      </div>
    </div>

  </div>
</section>
{/*AQUI EMPIEZA LA BARRA ANIMADA DE NUESTROS CLIENTES*/}
<section
  id="clientes"
  className="mt-40 py-24 bg-[#F8F7F5] overflow-hidden"
>
  <div className="max-w-7xl mx-auto px-8 mb-12">
    <h2 className="text-4xl font-semibold">
      Nuestros clientes
    </h2>
    <p className="mt-4 text-gray-600 max-w-2xl">
      Cafeterías y negocios que confían en Xhunco® Café
      como su proveedor de café de especialidad.
    </p>
  </div>

  {/* Barra animada */}
  <div className="relative w-full overflow-hidden">
    <div className="flex w-max animate-marquee gap-20 px-8">
      
      {/* Logos (puedes repetirlos para loop infinito) */}
      <img
        src="https://dummyimage.com/160x80/000/fff&text=Cliente+1"
        className="h-16 opacity-70 hover:opacity-100 transition"
        alt="Cliente 1"
      />
      <img
        src="https://dummyimage.com/160x80/000/fff&text=Cliente+2"
        className="h-16 opacity-70 hover:opacity-100 transition"
        alt="Cliente 2"
      />
      <img
        src="https://dummyimage.com/160x80/000/fff&text=Cliente+3"
        className="h-16 opacity-70 hover:opacity-100 transition"
        alt="Cliente 3"
      />
      <img
        src="https://dummyimage.com/160x80/000/fff&text=Cliente+4"
        className="h-16 opacity-70 hover:opacity-100 transition"
        alt="Cliente 4"
      />

      {/* Duplicados para que el loop sea continuo */}
      <img
        src="https://dummyimage.com/160x80/000/fff&text=Cliente+1"
        className="h-16 opacity-70 hover:opacity-100 transition"
        alt="Cliente 1"
      />
      <img
        src="https://dummyimage.com/160x80/000/fff&text=Cliente+2"
        className="h-16 opacity-70 hover:opacity-100 transition"
        alt="Cliente 2"
      />
      <img
        src="https://dummyimage.com/160x80/000/fff&text=Cliente+3"
        className="h-16 opacity-70 hover:opacity-100 transition"
        alt="Cliente 3"
      />
      <img
        src="https://dummyimage.com/160x80/000/fff&text=Cliente+4"
        className="h-16 opacity-70 hover:opacity-100 transition"
        alt="Cliente 4"
      />
    </div>
  </div>
</section>

      {/* PROPUESTA DE VALOR */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-semibold mb-3">Trazabilidad y control</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Cada lote de café puede rastrearse desde su origen,
              proceso, perfil de tueste y características en taza.
              </p>

          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Café de origen mexicano</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Seleccionamos cafés de regiones cafetaleras clave,
              priorizando calidad, consistencia y relaciones directas.
              </p>

          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Aliados de tu negocio</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Acompañamos a cafeterías y negocios con café,
              asesoría, capacitación y soluciones de suministro.
              </p>

          </div>

        </div>
      </section>

      {/* BLOQUE B2B */}
      <section className="px-10 py-24 max-w-6xl mx-auto">
        <h3 className="text-3xl font-semibold mb-6">
          Café y suministros para negocios que buscan diferenciarse
          </h3>
          <p className="text-gray-600 max-w-3xl mb-8 leading-relaxed">
            En Xhunco® Café trabajamos con cafeterías, restaurantes y hoteles
            que quieren un proveedor confiable, con café consistente,
            acompañamiento técnico y una visión de largo plazo.
            <br /><br />
            A partir de 2026, integraremos una línea de suministros
            especializados para operación de cafeterías.
            </p>

        <button className="px-6 py-3 bg-black text-white text-sm rounded-md">
          Quiero ser cliente B2B
        </button>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 px-10 text-sm text-gray-500">
        <div className="max-w-6xl mx-auto flex justify-between">
          <span>© {new Date().getFullYear()} Xhunco® Café</span>
          <span>Café mexicano de especialidad</span>
        </div>
      </footer>

    </main>
  );
}
