import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import {
  getRelatedLegalDocuments,
} from "@/lib/legal/legalDocuments";

export default function LegalRelatedDocs({
  currentSlug,
  limit = 3,
}) {
  const documents = getRelatedLegalDocuments(currentSlug).slice(
    0,
    limit
  );

  if (!documents.length) {
    return null;
  }

  return (
    <section className="mt-14 border-t border-gray-200 pt-10">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#31572c]">
          Documentación
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          Documentos relacionados
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          También puedes consultar otros documentos legales y políticas
          de Xhunco Café.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {documents.map((document) => {
          const Icon = document.icon;

          return (
            <Link
              key={document.slug}
              href={document.href}
              className="
                group
                flex
                h-full
                flex-col
                rounded-xl
                border
                border-gray-200
                bg-white
                p-5
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-[#31572c]
                hover:shadow-md
              "
            >
              <div className="flex items-center justify-between">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#31572c]/10
                    text-[#31572c]
                    transition-colors
                    duration-200
                    group-hover:bg-[#31572c]
                    group-hover:text-white
                  "
                >
                  {Icon ? (
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <FileText
                      size={19}
                      strokeWidth={1.8}
                    />
                  )}
                </div>

                <ArrowRight
                  size={17}
                  className="
                    text-gray-400
                    transition-all
                    duration-200
                    group-hover:translate-x-1
                    group-hover:text-[#31572c]
                  "
                />
              </div>

              <h3
                className="
                  mt-5
                  text-base
                  font-semibold
                  text-gray-900
                  transition-colors
                  duration-200
                  group-hover:text-[#31572c]
                "
              >
                {document.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {document.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}