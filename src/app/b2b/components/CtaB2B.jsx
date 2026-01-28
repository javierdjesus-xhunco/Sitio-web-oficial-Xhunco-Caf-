"use client";

import Link from "next/link";

export default function CtaB2B() {
  return (
    <section
      id="contacto"
      className="py-24 bg-black text-white text-center"
    >
      <div className="max-w-3xl mx-auto px-8">

        <h2 className="text-3xl font-semibold">
          ¿Listo para trabajar con nosotros?
        </h2>

        <p className="mt-4 text-gray-300">
          Solicita una cotización y llevemos café de especialidad a tu negocio.
        </p>

        <Link
          href="#"
          className="inline-block mt-8 px-8 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition"
        >
          Solicitar cotización
        </Link>

      </div>
    </section>
  );
}
