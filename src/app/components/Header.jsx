"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation"; // 👈 NUEVO

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cafesOpen, setCafesOpen] = useState(false);

  const pathname = usePathname(); // 👈 NUEVO

  // 👇 Si estamos dentro del portal, no mostramos el header
  if (pathname.startsWith("/portal")) {
    return null;
  }

  return (
    <header
      className="fixed top-0 w-full z-50 bg-white/-10 backdrop-blur-md border-white/-10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-xhunco.png"
            alt="Xhunco Café"
            width={170}
            height={40}
            priority
          />
        </Link>

        {/* MENÚ DESKTOP */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center">
          <Link href="/" className="font-medium hover:opacity-70">
            Inicio
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setCafesOpen(true)}
            onMouseLeave={() => setCafesOpen(false)}
          >
            <button className="font-medium hover:opacity-70">
              Cafés
            </button>

            {cafesOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg w-48">
                <Link href="/suministros" className="block px-4 py-2 hover:bg-gray-100">
                  Tienda
                </Link>
                <Link href="/cafes/origenes" className="block px-4 py-2 hover:bg-gray-100">
                  Orígenes
                </Link>
                <Link href="/trazabilidad" className="block px-4 py-2 hover:bg-gray-100">
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

        {/* ACCIONES DESKTOP */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/portal"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition"
          >
            Portal
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-6 space-y-4">
          <Link href="/" className="block font-medium">Inicio</Link>

          <details className="group">
            <summary className="cursor-pointer font-medium">Cafés</summary>
            <div className="ml-4 mt-2 space-y-2">
              <Link href="/trazabilidad" className="block text-sm">Tienda</Link>
              <Link href="/cafes/origenes" className="block text-sm">Orígenes</Link>
              <Link href="/trazabilidad" className="block text-sm">Trazabilidad</Link>
            </div>
          </details>

          <Link href="/b2b" className="block font-medium">B2B</Link>
          <Link href="/suministros" className="block font-medium">Suministros</Link>
          <Link href="/contacto" className="block font-medium">Contacto</Link>

          <div className="pt-4 border-t space-y-3">
            <Link
              href="/portal"
              className="block text-center bg-black text-white py-2 rounded-md"
            >
              Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
