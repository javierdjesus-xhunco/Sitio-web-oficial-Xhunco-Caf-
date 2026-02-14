import Link from "next/link";

export default function CafeCard({ cafe }) {
  return (
    <div className="border rounded-2xl overflow-hidden hover:shadow-lg transition bg-white">
      {/* CONTENEDOR PARA QUE LA IMAGEN QUEPA COMPLETA */}
      <div className="w-full h-72 bg-gray-50 p-4 flex items-center justify-center">
        <img
          src={cafe.imagen}
          alt={cafe.nombre}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2">
          {cafe.nombre}
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          {cafe.descripcion}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">
            ${cafe.precio}
          </span>

          <Link
            href={`/cafes/${cafe.slug}`}
            className="text-sm font-medium underline text-[#31572c]"
          >
            Ver café
          </Link>
        </div>
      </div>
    </div>
  );
}
