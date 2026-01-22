import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-6">
          Café con origen, historia y trazabilidad
        </h1>

        <p className="text-lg mb-8">
          Descubre cafés de especialidad y conoce el origen de cada lote.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/cafes"
            className="bg-[#6B3E26] hover:bg-[#5a331f] text-white px-6 py-3 rounded-lg font-semibold"
          >
            Explorar cafés
          </Link>

          <Link
            href="/trazabilidad"
            className="border border-white hover:bg-white hover:text-black px-6 py-3 rounded-lg font-semibold transition"
          >
            Buscar mi lote
          </Link>
        </div>
      </div>
    </section>
  );
}
