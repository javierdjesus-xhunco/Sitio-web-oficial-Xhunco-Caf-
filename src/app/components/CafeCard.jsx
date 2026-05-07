"use client";

import Link from "next/link";

export default function CafeCard({
  cafe,
  precioDB,
}) {

  const precio =
    precioDB || cafe.precio;

  return (
    <Link
      href={`/cafes/${cafe.slug}`}
      className="group block"
    >
      <div className="border border-gray-200 rounded-3xl overflow-hidden bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">

        {/* Imagen */}
        <div className="relative w-full h-80 bg-gradient-to-b from-gray-50 to-white p-6 flex items-center justify-center overflow-hidden">

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-[radial-gradient(circle_at_center,rgba(49,87,44,0.08),transparent_70%)]" />

          <img
            src={cafe.imagen}
            alt={cafe.nombre}
            className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition duration-700"
            loading="lazy"
          />
        </div>

        {/* Contenido */}
        <div className="p-6">

          <div className="mb-4">

            <h3 className="text-2xl font-semibold tracking-tight mb-2">
              {cafe.nombre}
            </h3>

            <p className="text-gray-600 leading-relaxed text-sm">
              {cafe.descripcion}
            </p>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">

            <span
              className="text-xl font-semibold"
              style={{ color: cafe.color }}
            >
              ${precio} MXN
            </span>

            <div
              className="inline-flex items-center gap-2 text-sm font-medium transition"
              style={{ color: cafe.color }}
            >
              Ver café

              <span className="group-hover:translate-x-1 transition">
                →
              </span>

            </div>

          </div>
        </div>
      </div>
    </Link>
  );
}