"use client"; 
// Indica que este componente se ejecuta en el cliente (necesario para usar useState y eventos)

import Link from "next/link";
// Link permite navegación interna en Next.js sin recargar la página

import Image from "next/image";

import { useState } from "react";
// Hook de React para manejar estados (abrir/cerrar menús)

export default function Header() {

  // Estado para abrir/cerrar el menú móvil
  const [menuOpen, setMenuOpen] = useState(false);

  // Estado para abrir/cerrar el dropdown de Cafés en desktop
  const [cafesOpen, setCafesOpen] = useState(false);

  return (
    <header
      className="fixed top-0 w-full z-50 bg-white/-10 backdrop-blur-md  border-white/-10"
    >
      {/* Header fijo en la parte superior con fondo semitransparente */}

      <div
        className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"
      >
        {/* Contenedor centrado que alinea logo, menú y botones */}

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

        {/* Logo que redirige a la página principal */}

        {/* MENÚ DESKTOP */}
        <nav
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center"
        >
          {/* Menú visible solo en pantallas medianas en adelante */}

          <Link
            href="/"
            className="font-medium hover:opacity-70"
          >
            Inicio
          </Link>
          {/* Enlace a Inicio */}

          {/* DROPDOWN CAFÉS */}
          <div
            className="relative"
            onMouseEnter={() => setCafesOpen(true)}
            // Abre el dropdown al pasar el mouse
            onMouseLeave={() => setCafesOpen(false)}
            // Cierra el dropdown al quitar el mouse
          >
            <button
              className="font-medium hover:opacity-70"
            >
              Cafés
            </button>
            {/* Botón que muestra el menú de Cafés */}

            {cafesOpen && (
              // Renderiza el menú solo si cafesOpen es true
              <div
                className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg w-48"
              >
                {/* Contenedor del dropdown */}

                <Link
                  href="/suministros"
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
                  href="/trazabilidad"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Trazabilidad
                </Link>
              </div>
            )}
          </div>

          {/* Enlaces normales del menú */}
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
        <div
          className="hidden md:flex items-center gap-4"
        >
        
          {/* Botón principal portal*/}
          <Link
            href="/portal"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition"
          >
            Portal
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA (MÓVIL) */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          // Alterna abrir/cerrar el menú móvil
        >
          {/* Líneas del ícono hamburguesa */}
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        // Se muestra solo cuando menuOpen es true
        <div
          className="md:hidden bg-white border-t border-gray-200 px-6 py-6 space-y-4"
        >
          <Link href="/" className="block font-medium">
            Inicio
          </Link>

          {/* CAFÉS EN MÓVIL */}
          <details className="group">
            {/* details crea un desplegable nativo */}
            <summary className="cursor-pointer font-medium">
              Cafés
            </summary>

            <div className="ml-4 mt-2 space-y-2">
              <Link href="/trazabilidad" className="block text-sm">
                Tienda
              </Link>

              <Link href="/cafes/origenes" className="block text-sm">
                Orígenes
              </Link>

              <Link href="/trazabilidad" className="block text-sm">
                Trazabilidad
              </Link>
            </div>
          </details>

          <Link href="/b2b" className="block font-medium">
            B2B
          </Link>

          <Link href="/suministros" className="block font-medium">
            Suministros
          </Link>

          <Link href="/contacto" className="block font-medium">
            Contacto
          </Link>

          {/* BOTONES MÓVILES */}
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
