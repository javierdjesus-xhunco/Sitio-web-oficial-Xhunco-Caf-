import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { LEGAL } from "@/lib/legal/legalConfig";

export default function LegalFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 pt-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

        {/* Información */}

        <div>
          <p className="text-sm font-semibold text-gray-900">
            {LEGAL.companyName}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Documentación legal y políticas del sitio.
          </p>
        </div>

        {/* Enlaces */}

        <nav
          aria-label="Enlaces legales"
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          <Link
            href="/legal/privacidad"
            className="
              text-sm
              text-gray-500
              transition-colors
              hover:text-[#31572c]
            "
          >
            Privacidad
          </Link>

          <Link
            href="/legal/terminos"
            className="
              text-sm
              text-gray-500
              transition-colors
              hover:text-[#31572c]
            "
          >
            Términos
          </Link>

          <Link
            href="/legal/cookies"
            className="
              text-sm
              text-gray-500
              transition-colors
              hover:text-[#31572c]
            "
          >
            Cookies
          </Link>
        </nav>
      </div>

      {/* Copyright / información secundaria */}

      <div className="mt-8 flex flex-col gap-2 border-t border-gray-100 pt-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {LEGAL.companyName}. Todos los
          derechos reservados.
        </p>

        <p>
          {LEGAL.address}
        </p>
      </div>
    </footer>
  );
}