import LegalHeader from "./LegalHeader";
import LegalSidebar from "./LegalSidebar";
import LegalBreadcrumb from "./LegalBreadcrumb";
import LegalRelatedDocs from "./LegalRelatedDocs";
import LegalFooter from "./LegalFooter";

export default function LegalLayout({
  children,
  title,
  description,
  currentSlug,
  badge = "Centro Legal",
  document = true,
  relatedDocuments = true,
}) {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}

      <LegalHeader
        badge={badge}
        title={title}
        description={description}
        document={document}
      />

      {/* Breadcrumb */}

      <LegalBreadcrumb
        current={title}
      />

      {/* Contenido principal */}

      <main>
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-10
            sm:px-6
            sm:py-12
            lg:px-8
            lg:py-14
          "
        >
          <div
            className="
              grid
              gap-8
              lg:grid-cols-[260px_minmax(0,1fr)]
              lg:gap-12
            "
          >

            {/* Sidebar */}

            <LegalSidebar
              currentSlug={currentSlug}
            />

            {/* Documento */}

            <article
              className="
                min-w-0
                max-w-4xl
              "
            >
              {children}

              {/* Documentos relacionados */}

              {relatedDocuments && currentSlug && (
                <LegalRelatedDocs
                  currentSlug={currentSlug}
                />
              )}

              {/* Footer */}

              <LegalFooter />

            </article>

          </div>
        </div>
      </main>

    </div>
  );
}