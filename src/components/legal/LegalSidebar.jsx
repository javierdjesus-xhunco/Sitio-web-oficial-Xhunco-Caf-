import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { LEGAL_DOCUMENTS } from "@/lib/legal/legalDocuments";

export default function LegalSidebar({
  currentSlug,
}) {
  return (
    <aside
      className="
        lg:sticky
        lg:top-24
        lg:self-start
      "
    >
      <div
        className="
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-4
          shadow-sm
        "
      >
        {/* Encabezado */}

        <div className="px-3 pb-3">
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.15em]
              text-[#31572c]
            "
          >
            Documentación
          </p>

          <h2 className="mt-1 text-base font-semibold text-gray-900">
            Documentos legales
          </h2>
        </div>

        {/* Navegación */}

        <nav
          aria-label="Documentos legales"
          className="space-y-1"
        >
          {LEGAL_DOCUMENTS.map((document) => {
            const isActive =
              document.slug === currentSlug;

            const Icon = document.icon;

            return (
              <Link
                key={document.slug}
                href={document.href}
                aria-current={
                  isActive ? "page" : undefined
                }
                className={`
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? "bg-[#31572c]/10 text-[#31572c]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#31572c]"
                  }
                `}
              >
                {/* Icono */}

                <span
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    transition-colors
                    duration-200

                    ${
                      isActive
                        ? "bg-[#31572c] text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-[#31572c]/10 group-hover:text-[#31572c]"
                    }
                  `}
                >
                  {Icon && (
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />
                  )}
                </span>

                {/* Nombre */}

                <span className="min-w-0 flex-1 truncate font-medium">
                  {document.shortTitle ||
                    document.title}
                </span>

                {/* Flecha */}

                <ChevronRight
                  size={16}
                  strokeWidth={1.8}
                  className={`
                    shrink-0
                    transition-transform
                    duration-200

                    ${
                      isActive
                        ? "text-[#31572c]"
                        : "text-gray-300 group-hover:translate-x-0.5 group-hover:text-[#31572c]"
                    }
                  `}
                />
              </Link>
            );
          })}
        </nav>

        {/* Separador */}

        <div className="my-4 border-t border-gray-100" />

        {/* Regresar al Centro Legal */}

        <Link
          href="/legal"
          className="
            group
            flex
            items-center
            justify-between
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-medium
            text-gray-500
            transition-colors
            hover:bg-gray-50
            hover:text-[#31572c]
          "
        >
          <span>
            Centro Legal
          </span>

          <ChevronRight
            size={16}
            strokeWidth={1.8}
            className="
              transition-transform
              duration-200
              group-hover:translate-x-0.5
            "
          />
        </Link>
      </div>
    </aside>
  );
}