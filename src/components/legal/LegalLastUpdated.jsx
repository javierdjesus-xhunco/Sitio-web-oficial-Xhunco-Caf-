import { CalendarDays, FileCheck2 } from "lucide-react";

import { LEGAL } from "@/lib/legal/legalConfig";

export default function LegalLastUpdated({
  version,
  lastUpdated,
}) {
  const documentVersion = version || LEGAL.version;
  const documentLastUpdated =
    lastUpdated || LEGAL.lastUpdated;

  return (
    <div
      className="
        mt-6
        flex
        flex-col
        gap-3
        border-y
        border-gray-200
        py-4
        text-sm
        text-gray-500
        sm:flex-row
        sm:items-center
        sm:gap-6
      "
    >
      {/* Última actualización */}

      <div className="flex items-center gap-2">
        <CalendarDays
          size={16}
          strokeWidth={1.8}
          className="text-[#31572c]"
        />

        <span>
          Última actualización:
        </span>

        <span className="font-medium text-gray-700">
          {documentLastUpdated}
        </span>
      </div>

      {/* Separador */}

      <span
        aria-hidden="true"
        className="hidden h-4 w-px bg-gray-200 sm:block"
      />

      {/* Versión */}

      <div className="flex items-center gap-2">
        <FileCheck2
          size={16}
          strokeWidth={1.8}
          className="text-[#31572c]"
        />

        <span>
          Versión:
        </span>

        <span className="font-medium text-gray-700">
          {documentVersion}
        </span>
      </div>
    </div>
  );
}