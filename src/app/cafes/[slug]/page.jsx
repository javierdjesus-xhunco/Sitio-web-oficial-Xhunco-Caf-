import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import cafes from "@/data/cafes";
import { getCafePrices } from "@/lib/getCafePrices";

export default async function CafePage({
  params,
}) {
  const { slug } = await params;

  const cafe = cafes.find(
    (cafe) => cafe.slug === slug
  );

  if (!cafe) {
    notFound();
  }

  // =========================
  // DATOS SUPABASE
  // =========================

  const productos =
    await getCafePrices();

  
// =========================
// MATCH REAL CON SUPABASE
// =========================

const productosCafe =
  productos.filter((item) => {

    const nombre =
      item.nombre
        ?.toLowerCase()
        .trim() || "";

    // Veracruz
    if (
      slug.includes("veracruz")
    ) {
      return nombre.includes(
        "xhunco veracruz"
      );
    }

    // Chiapas
    if (
      slug.includes("chiapas")
    ) {
      return nombre.includes(
        "xhunco chiapas"
      );
    }

    // Oaxaca
    if (
      slug.includes("oaxaca")
    ) {
      return nombre.includes(
        "xhunco oaxaca"
      );
    }

    return false;
  });

// PRIORIZAR GRANO
const productoDB =
  productosCafe.find((p) =>
    p.nombre
      ?.toLowerCase()
      .includes("grano")
  ) || productosCafe[0];

const precio =
  productoDB?.precio_web ??
  cafe.precio;

const stock =
  productoDB?.stock ?? 0;



  const disponible =
    productoDB?.activo &&
    stock > 0;

  return (
    <main className="bg-white text-black">
      {/* HERO */}
      <section className="min-h-screen grid lg:grid-cols-2 items-center px-6 lg:px-20 py-20 gap-16">
        {/* INFO */}
        <div>
          <p
            className="uppercase tracking-[0.3em] text-sm mb-5"
            style={{
              color: cafe.color,
            }}
          >
            Xhunco Coffee
          </p>

          <h1 className="text-5xl lg:text-7xl font-semibold leading-tight tracking-tight mb-8">
            {cafe.nombre}
          </h1>

          <p className="text-2xl text-gray-700 leading-relaxed mb-8 max-w-2xl">
            {cafe.hero}
          </p>

          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
            {cafe.descripcion}
          </p>

          {/* Notas */}
          <div className="flex flex-wrap gap-3 mb-10">
            {cafe.notas.map(
              (nota) => (
                <span
                  key={nota}
                  className="px-5 py-2 rounded-full bg-gray-100 text-sm"
                >
                  {nota}
                </span>
              )
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-6 flex-wrap">
            <Link
              href={`/suministros?buscar=${encodeURIComponent(
  productoDB?.nombre || cafe.nombre
)}`}
              className="text-white px-8 py-4 rounded-full hover:opacity-90 transition"
              style={{
                backgroundColor:
                  cafe.color,
              }}
            >
              Comprar ahora
            </Link>

            <p
              className="text-2xl font-semibold"
              style={{
                color: cafe.color,
              }}
            >
              ${precio} MXN
            </p>

            <div
              className={`text-sm font-medium ${
                disponible
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {disponible
                ? `Stock disponible: ${stock}`
                : "Agotado"}
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="relative flex justify-center">
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{
              backgroundColor:
                cafe.color,
            }}
          />

          <Image
            src={cafe.imagen}
            alt={cafe.nombre}
            width={550}
            height={550}
            className="relative z-10 object-contain hover:scale-105 transition duration-700"
            priority
          />
        </div>
      </section>

      {/* INFO GRID */}
      <section className="px-6 lg:px-20 pb-14">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="p-8 rounded-3xl bg-gray-50">
            <p className="text-sm text-gray-500 mb-3">
              Origen
            </p>

            <h3 className="text-2xl font-medium">
              {cafe.origen}
            </h3>
          </div>

          <div className="p-8 rounded-3xl bg-gray-50">
            <p className="text-sm text-gray-500 mb-3">
              Proceso
            </p>

            <h3 className="text-2xl font-medium">
              {cafe.proceso}
            </h3>
          </div>

          <div className="p-8 rounded-3xl bg-gray-50">
            <p className="text-sm text-gray-500 mb-3">
              Altura
            </p>

            <h3 className="text-2xl font-medium">
              {cafe.altura}
            </h3>
          </div>

          <div className="p-8 rounded-3xl bg-gray-50">
            <p className="text-sm text-gray-500 mb-3">
              Tueste
            </p>

            <h3 className="text-2xl font-medium">
              {cafe.tueste}
            </h3>
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="px-6 lg:px-20 pb-24">
        <div className="max-w-4xl">
          <p
            className="uppercase tracking-[0.3em] text-sm mb-5"
            style={{
              color: cafe.color,
            }}
          >
            Historia
          </p>

          <h2 className="text-4xl font-semibold tracking-tight mb-8">
            El origen detrás de la taza
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed">
            {cafe.historia}
          </p>
        </div>
      </section>

      {/* MÉTODOS */}
      <section className="px-6 lg:px-20 pb-28">
        <p
          className="uppercase tracking-[0.3em] text-sm mb-5"
          style={{
            color: cafe.color,
          }}
        >
          Métodos recomendados
        </p>

        <div className="flex flex-wrap gap-4">
          {cafe.recomendados.map(
            (metodo) => (
              <div
                key={metodo}
                className="px-6 py-4 rounded-2xl bg-gray-100 text-lg"
              >
                {metodo}
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}