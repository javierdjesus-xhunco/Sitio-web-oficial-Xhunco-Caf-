import Image from "next/image";
import Link from "next/link";

export default function NuestraHistoria() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* TEXTO */}
        <div>
          <h2 className="text-4xl font-semibold mb-6">
            Nuestra historia
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Xhunco® Café nace con una idea clara: conectar el trabajo de los
            caficultores mexicanos con personas y negocios que valoran la
            calidad real, la trazabilidad y las relaciones honestas.
          </p>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Trabajamos directamente con regiones cafetaleras, cuidando cada
            etapa del proceso para ofrecer cafés consistentes, responsables
            y con identidad propia.
          </p>

          <Link
            href="/origenes"
            className="inline-block text-black font-medium border-b border-black hover:opacity-70 transition"
          >
            Conocer nuestros orígenes →
          </Link>
        </div>

        {/* IMAGEN */}
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden">
          <Image
            src="/historia.jpg"
            alt="Nuestra historia"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </section>
  );
}
