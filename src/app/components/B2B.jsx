import Link from "next/link";
import { ArrowRight, BadgeCheck, Coffee, Truck, Headphones } from "lucide-react";

const features = [
  {
    icon: Coffee,
    title: "Atención para tu operación",
    description:
      "Un modelo pensado para negocios que necesitan orden, seguimiento y respuesta continua.",
  },
  {
    icon: Truck,
    title: "Abastecimiento continuo",
    description:
      "Entregas programadas y continuidad operativa para mantener tu servicio siempre activo.",
  },
  {
    icon: Headphones,
    title: "Acompañamiento continuo",
    description:
      "Soporte, asesoría y seguimiento para ayudarte a sostener y mejorar tu operación.",
  },
];

const highlights = [
  "Atención B2B especializada",
  "Abastecimiento continuo",
  "Acompañamiento continuo",
];

export default function B2B() {
  return (
    <section className="bg-[#F7F5F1] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/* Columna principal */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD4C8] bg-white px-4 py-2 text-sm font-medium text-[#6B3E26] shadow-sm">
              <BadgeCheck className="h-4 w-4" />
              Soluciones B2B
            </span>

            <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#0F172A] md:text-5xl">
               Proveedor de Café para Cafeterías y Restaurantes 
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#475569] md:text-lg">
               Suministro continuo de café de especialidad para cafeterías, restaurantes, hoteles 
               y oficinas en México. Atención B2B con acompañamiento. Solicita una cotización.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#E5DED4] bg-white px-4 py-2 text-sm text-[#334155]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/b2b"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2A1A12] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#1E120D]"
              >
                Solicitar cotización
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card lateral */}
          <div className="rounded-[28px] border border-[#E8E0D6] bg-white p-6 shadow-[0_20px_60px_rgba(42,26,18,0.06)] md:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#94A3B8]">
                  Modelo de servicio
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#0F172A]">
                  Suministro + soporte + capacitación
                </h3>
              </div>

              <div className="rounded-2xl bg-[#F5EFE8] px-3 py-1 text-xs font-semibold text-[#6B3E26]">
                Escalable
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {features.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-[#EFE8DE] bg-[#FCFBF9] p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3ECE5] text-[#6B3E26]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[#0F172A] md:text-base">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-[#475569]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}