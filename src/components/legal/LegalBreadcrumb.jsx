import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function LegalBreadcrumb({
  current,
}) {
  return (
    <nav
      aria-label="Navegación de ruta"
      className="border-b border-gray-100 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ol className="flex min-h-12 items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">

          {/* Inicio */}

          <li className="flex items-center gap-2">
            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-1.5
                text-gray-500
                transition-colors
                hover:text-[#31572c]
              "
            >
              <Home
                size={15}
                strokeWidth={1.8}
              />

              <span>Inicio</span>
            </Link>
          </li>

          <li
            aria-hidden="true"
            className="text-gray-300"
          >
            <ChevronRight
              size={15}
            />
          </li>

          {/* Centro Legal */}

          <li className="flex items-center gap-2">

            <Link
              href="/legal"
              className="
                text-gray-500
                transition-colors
                hover:text-[#31572c]
              "
            >
              Centro Legal
            </Link>

          </li>

          {/* Documento actual */}

          {current && (
            <>
              <li
                aria-hidden="true"
                className="text-gray-300"
              >
                <ChevronRight
                  size={15}
                />
              </li>

              <li
                aria-current="page"
                className="
                  max-w-[220px]
                  truncate
                  font-medium
                  text-gray-900
                "
              >
                {current}
              </li>
            </>
          )}

        </ol>
      </div>
    </nav>
  );
}