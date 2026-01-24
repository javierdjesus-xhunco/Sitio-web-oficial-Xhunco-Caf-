"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="text-xl font-semibold tracking-wide">
          Xhunco® Café
        </Link>

        {/* MENÚ CENTRADO */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex gap-8 items-center">

          <Link href="/" className="font-medium hover:opacity-70">
            Inicio
          </Link>

          {/* CAFÉS DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button className="font-medium hover:opacity-70">
              Cafés
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg w-48">
                <Link
                  href="/cafes/tienda"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Tienda
                </Link>

                <Link
                  href="/cafes/origenes"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Orígenes
                </Link>

                <Link
                  href="/cafes/trazabilidad"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Trazabilidad
                </Link>
              </div>
            )}
          </div>

          <Link href="/b2b" className="font-medium hover:opacity-70">
            B2B
          </Link>

          <Link href="/suministros" className="font-medium hover:opacity-70">
            Suministros
          </Link>

          <Link href="/contacto" className="font-medium hover:opacity-70">
            Contacto
          </Link>
        </nav>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-4">

         <Link
         href="/portal"
         className="px-4 py-2 border border-black rounded-md hover:bg-black hover:text-white transition"
         >
         Portal
        </Link>


          {/* CTA */}
          <Link
            href="/cafes/tienda"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            Comprar café
          </Link>

        </div>

      </div>
    </header>
  );
}
