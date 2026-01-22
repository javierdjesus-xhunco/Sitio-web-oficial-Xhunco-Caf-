import Link from "next/link";

export default function CafeCard({ cafe }) {
  return (
    <div className="border rounded-2xl overflow-hidden hover:shadow-lg transition">
      
      <img
        src={cafe.imagen}
        alt={cafe.nombre}
        className="w-full h-56 object-cover"
      />

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
            className="text-sm font-medium underline"
          >
            Ver café
          </Link>
        </div>
      </div>

    </div>
  );
}
