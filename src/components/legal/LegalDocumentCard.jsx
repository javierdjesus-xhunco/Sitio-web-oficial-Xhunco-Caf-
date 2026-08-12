import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LegalDocumentCard({
  title,
  description,
  href,
  icon: Icon,
  category,
}) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        h-full
        flex-col
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#31572c]
        hover:shadow-lg
      "
    >
      {/* Icono */}
      <div className="flex items-start justify-between">
        <div
  className="
    flex
    h-11
    w-11
    items-center
    justify-center
    rounded-xl
    bg-[#e8f1e6]
    transition-colors
    duration-300
    group-hover:bg-[#dcebd9]
  "
>
  {Icon && (
    <Icon
      size={22}
      strokeWidth={1.8}
      className="
        text-[#31572c]
        transition-colors
        duration-300
      "
    />
  )}
</div>

        {/* Categoría */}
        {category && (
          <span
            className="
              rounded-full
              bg-gray-100
              px-3
              py-1
              text-xs
              font-medium
              text-gray-500
            "
          >
            {category}
          </span>
        )}
      </div>

      {/* Información */}
      <div className="mt-6 flex flex-1 flex-col">
        <h3
          className="
            text-xl
            font-semibold
            tracking-tight
            text-gray-900
            transition-colors
            duration-200
            group-hover:text-[#31572c]
          "
        >
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-gray-600">
          {description}
        </p>
      </div>

      {/* Acción */}
      <div
        className="
          mt-7
          flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-[#31572c]
        "
      >
        <span>Consultar documento</span>

        <ArrowRight
          size={17}
          strokeWidth={2}
          className="
            transition-transform
            duration-200
            group-hover:translate-x-1
          "
        />
      </div>
    </Link>
  );
} 