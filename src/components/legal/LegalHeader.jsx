export default function LegalHeader({
  badge = "Centro Legal",
  title,
  description,
  document = false,
}) {
  return (
    <header
      className={`relative overflow-hidden ${
        document
          ? "border-b border-gray-200 bg-white"
          : "bg-gradient-to-r from-[#31572c] via-[#3a6535] to-[#467a40]"
      }`}
    >
      {!document && (
        <>
          {/* Decoración de fondo */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white opacity-[0.04]" />

            <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-white opacity-[0.04]" />

            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white opacity-[0.04]" />
          </div>
        </>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {document ? (
          <div className="py-10 sm:py-12">

            {/* Badge */}

            <div className="mb-4">

              <span className="inline-flex items-center rounded-full border border-[#31572c]/15 bg-[#31572c]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#31572c]">
                {badge}
              </span>

            </div>

            {/* Título */}

            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">

              {title}

            </h1>

            {/* Descripción */}

            {description && (
              <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600 sm:text-lg">

                {description}

              </p>
            )}

          </div>
        ) : (
          <div className="py-16 sm:py-20 lg:py-24">

            {/* Badge */}

            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">

              {badge}

            </span>

            {/* Título */}

            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">

              {title}

            </h1>

            {/* Descripción */}

            {description && (
              <p className="mt-6 max-w-3xl text-base leading-8 text-green-100 sm:text-lg">

                {description}

              </p>
            )}

          </div>
        )}

      </div>
    </header>
  );
}