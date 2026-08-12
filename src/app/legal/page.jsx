import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import LegalHeader from "@/components/legal/LegalHeader";
import LegalDocumentCard from "@/components/legal/LegalDocumentCard";
import LegalFooter from "@/components/legal/LegalFooter";

import {
  LEGAL_DOCUMENTS,
} from "@/lib/legal/legalDocuments";

import { LEGAL } from "@/lib/legal/legalConfig";

export const metadata = {
  title: `Centro Legal | ${LEGAL.companyName}`,
  description:
    "Consulta la documentación legal, políticas y condiciones de uso de Xhunco Café.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* =========================================
          HEADER
      ========================================= */}

      <LegalHeader
        badge="Centro Legal"
        title="Documentación legal"
        description="Consulta de forma clara y transparente las políticas, condiciones y documentos legales que regulan tu relación con Xhunco Café."
        document={false}
      />

      {/* =========================================
          CONTENIDO
      ========================================= */}

      <main>
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-12
            sm:px-6
            sm:py-16
            lg:px-8
            lg:py-20
          "
        >

          {/* Introducción */}

          <section className="max-w-3xl">
            <div className="flex items-start gap-4">

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#31572c]/10
                  text-[#31572c]
                "
              >
                <ShieldCheck
                  size={22}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h2
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-gray-900
                    sm:text-3xl
                  "
                >
                  Transparencia y confianza
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-gray-600
                    sm:text-base
                  "
                >
                  En Xhunco Café consideramos importante que
                  conozcas cómo funciona nuestra plataforma,
                  cómo protegemos tu información y cuáles son
                  las condiciones aplicables a nuestros
                  productos y servicios.
                </p>
              </div>

            </div>
          </section>

          {/* =========================================
              DOCUMENTOS
          ========================================= */}

          <section className="mt-12">

            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-[#31572c]
                  "
                >
                  Documentos
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    tracking-tight
                    text-gray-900
                    sm:text-3xl
                  "
                >
                  Políticas y condiciones
                </h2>
              </div>

              <p className="text-sm text-gray-500">
                {LEGAL_DOCUMENTS.length} documentos disponibles
              </p>

            </div>

            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {LEGAL_DOCUMENTS.map((document) => (
                <LegalDocumentCard
                  key={document.slug}
                  title={document.title}
                  description={document.description}
                  href={document.href}
                  icon={document.icon}
                  category={document.category}
                />
              ))}
            </div>

          </section>

          {/* =========================================
              CONTACTO LEGAL
          ========================================= */}

          <section >
          </section>

          {/* =========================================
              FOOTER LEGAL
          ========================================= */}

          <LegalFooter />

        </div>
      </main>

    </div>
  );
}