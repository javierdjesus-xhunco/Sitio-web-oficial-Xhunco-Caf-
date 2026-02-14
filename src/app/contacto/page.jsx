import Image from "next/image";

export default function CONTACTOPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-8">
            {/* Imagen principal */}
            <div className="relative overflow-hidden rounded-2xl bg-neutral-200 shadow-sm">
              <div className="relative h-56 w-full sm:h-64 md:h-72">
                <Image
                  src="/recursos/cafemetodo.jpg"
                  alt="Preparación de café de especialidad"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Badge */}
              <div className="absolute bottom-4 left-4 right-4 max-w-md rounded-xl bg-black/55 p-4 text-white backdrop-blur">
                <div className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400" />
                  <div>
                    <p className="text-sm font-semibold">
                      Café de Altura Premium
                    </p>
                    <p className="text-xs text-white/80">
                      Cultivado a más de 1,500 msnm para un perfil de sabor excepcional.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Títulos */}
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-[#31572c]">
                TRABAJEMOS JUNTOS
              </p>

              <h1 className="mt-3 text-4xl font-extrabold leading-tight text-neutral-900 sm:text-5xl">
                Eleva tu <span className="text-[#31572c]">Experiencia Cafetera</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
                Ya seas cafetería, restaurante, hotel o distribuidor, te ofrecemos
                café de especialidad de altura y suministros premium para elevar
                cada taza que sirves.
              </p>
            </div>

            {/* CTA cards */}
            <div className="space-y-3">
              <a
                href="#contact-form"
                className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Conviértete en Distribuidor
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Únete a nuestra red y lleva café de altura a tu mercado.
                  </p>
                </div>
                <span className="text-neutral-400 transition group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#contact-form"
                className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Solicitar Muestra
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Conoce nuestros granos y suministros antes de hacer tu pedido.
                  </p>
                </div>
                <span className="text-neutral-400 transition group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#contact-form"
                className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Precios Mayoreo
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Tarifas competitivas para cafeterías, restaurantes y hoteles.
                  </p>
                </div>
                <span className="text-neutral-400 transition group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>

            {/* Contacto directo */}
            <div className="pt-2">
              <p className="text-xs font-semibold tracking-[0.25em] text-neutral-400">
                CONTACTO DIRECTO
              </p>

              <div className="mt-4 space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-neutral-100 p-2">✉️</div>
                  <div>
                    <p className="text-xs text-neutral-500">Correo</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      soporte@xhunco.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-neutral-100 p-2">📞</div>
                  <div>
                    <p className="text-xs text-neutral-500">Teléfono</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      +52 246 142 86 84
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-neutral-100 p-2">📍</div>
                  <div>
                    <p className="text-xs text-neutral-500">Dirección</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      El Tordo 31 Col. Los Potrillos, Tlaxcala, Tlax. C.P. 90014
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-neutral-100 p-2">🕒</div>
                  <div>
                    <p className="text-xs text-neutral-500">Horario</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      Lun – Vie, 8:00 AM – 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-6">
            {/* Imágenes superiores */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { src: "/recursos/DaVinci.png", label: "Jarabes y Suministros" },
                { src: "/recursos/coffebeans.jpg", label: "Café de Especialidad" },
                { src: "/recursos/insumos.jpg", label: "Insumos para Café" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="relative overflow-hidden rounded-2xl bg-neutral-200 shadow-sm"
                >
                  <div className="relative h-20 w-full sm:h-24">
                    <Image
                      src={item.src}
                      alt={item.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/45 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Formulario */}
            <div
              id="contact-form"
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7"
            >
              <h2 className="text-lg font-bold text-neutral-900">
                Ponte en Contacto
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Completa el formulario y nuestro equipo te responderá a la brevedad.
              </p>

              <form className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Nombre completo *"
                    className="rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-amber-700 outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nombre del negocio"
                    className="rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-amber-700 outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="email"
                    placeholder="Correo electrónico *"
                    className="rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-amber-700 outline-none"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    className="rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-amber-700 outline-none"
                  />
                </div>

                <textarea
                  placeholder="Cuéntanos sobre tu negocio y qué estás buscando *"
                  className="min-h-[120px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-amber-700 outline-none resize-none"
                  required
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:opacity-95 transition"
                >
                  Enviar Mensaje
                </button>

                <p className="text-center text-xs text-neutral-500">
                  Respondemos en un plazo máximo de un día hábil.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
