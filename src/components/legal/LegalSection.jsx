export default function LegalSection({
  number,
  title,
  children,
  id,
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28"
    >
      <div className="flex gap-4 sm:gap-5">

        {/* Número de sección */}

        {number && (
          <div className="hidden shrink-0 pt-1 sm:block">
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-[#31572c]/10
                text-sm
                font-semibold
                text-[#31572c]
              "
            >
              {number}
            </span>
          </div>
        )}

        {/* Contenido */}

        <div className="min-w-0 flex-1">

          <h2
            className="
              text-xl
              font-bold
              tracking-tight
              text-gray-900
              sm:text-2xl
            "
          >
            {title}
          </h2>

          <div
            className="
              mt-5
              space-y-5
              text-[15px]
              leading-7
              text-gray-600
            "
          >
            {children}
          </div>

        </div>

      </div>
    </section>
  );
}