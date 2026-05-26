"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

function navLinkClass(pathname, href) {
  const isActive = pathname === href;
  return [
    "relative text-sm font-medium transition-colors",
    isActive ? "text-[#2A1A12]" : "text-[#334155] hover:text-[#2A1A12]",
  ].join(" ");
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cafesOpen, setCafesOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/portal")) {
    return null;
  }

  const closeMobileMenu = () => setMenuOpen(false);

  const isB2B = pathname === "/b2b";
  const isHome = pathname === "/";
  const isSupplies = pathname === "/suministros";
  const isContact = pathname === "/contacto";
  const isCafeSection =
    pathname.startsWith("/cafes") || pathname === "/trazabilidad" || pathname === "/suministros";

  return (
   <header className="fixed inset-x-0 top-0 z-50 bg-transparent backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LOGO */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo-xhunco.png"
            alt="Xhunco Café"
            width={170}
            height={40}
            priority
          />
        </Link>

        {/* MENÚ DESKTOP */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          <Link href="/" className={navLinkClass(pathname, "/")}>
            Inicio
            {isHome && (
              <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#2A1A12]" />
            )}
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setCafesOpen(true)}
            onMouseLeave={() => setCafesOpen(false)}
          >
            <button
              className={[
                "inline-flex items-center gap-1 text-sm font-medium transition-colors",
                isCafeSection ? "text-[#2A1A12]" : "text-[#334155] hover:text-[#2A1A12]",
              ].join(" ")}
              type="button"
            >
              Cafés
              <ChevronDown
                className={`h-4 w-4 transition-transform ${cafesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCafeSection && (
              <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#2A1A12]" />
            )}

            {cafesOpen && (
              <div className="absolute left-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-[#E8E0D6] bg-white p-2 shadow-[0_20px_50px_rgba(42,26,18,0.10)]">
                <Link
                  href="/suministros"
                  className="block rounded-xl px-4 py-3 text-sm text-[#334155] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
                >
                  Tienda
                </Link>
                <Link
                  href="/cafes/origenes"
                  className="block rounded-xl px-4 py-3 text-sm text-[#334155] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
                >
                  Orígenes
                </Link>
                <Link
                  href="/trazabilidad"
                  className="block rounded-xl px-4 py-3 text-sm text-[#334155] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
                >
                  Trazabilidad
                </Link>
              </div>
            )}
          </div>

          <Link href="/b2b" className={navLinkClass(pathname, "/b2b")}>
            Para Negocios
            {isB2B && (
              <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#2A1A12]" />
            )}
          </Link>

          <Link href="/suministros" className={navLinkClass(pathname, "/suministros")}>
            Insumos para cafeteria
            {isSupplies && (
              <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#2A1A12]" />
            )}
          </Link>


           <Link href="/blog" className={navLinkClass(pathname, "/blog")}>
            Blog
            {isContact && (
              <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#2A1A12]" />
            )}
          </Link>
        </nav>
        

        {/* ACCIONES DESKTOP */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/portal"
            className="inline-flex items-center justify-center rounded-full bg-[#2A1A12] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E120D]"
          >
            Portal
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA */}
        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E0D6] bg-white text-[#2A1A12] transition hover:bg-[#F7F5F1] md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        <div className="border-t border-[#E8E0D6] bg-white/95 px-6 py-6 backdrop-blur md:hidden">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-[#334155] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
            >
              Inicio
            </Link>

            <details className="group rounded-xl">
              <summary className="cursor-pointer list-none rounded-xl px-3 py-3 text-sm font-medium text-[#334155] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]">
                <div className="flex items-center justify-between">
                  <span>Cafés</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </div>
              </summary>

              <div className="mt-1 space-y-1 pl-3">
                <Link
                  href="/suministros"
                  onClick={closeMobileMenu}
                  className="block rounded-xl px-3 py-2 text-sm text-[#475569] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
                >
                  Tienda
                </Link>
                <Link
                  href="/cafes/origenes"
                  onClick={closeMobileMenu}
                  className="block rounded-xl px-3 py-2 text-sm text-[#475569] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
                >
                  Orígenes
                </Link>
                <Link
                  href="/trazabilidad"
                  onClick={closeMobileMenu}
                  className="block rounded-xl px-3 py-2 text-sm text-[#475569] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
                >
                  Trazabilidad
                </Link>
              </div>
            </details>

            <Link
              href="/b2b"
              onClick={closeMobileMenu}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-[#334155] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
            >
              Para negocios
            </Link>

            <Link
              href="/suministros"
              onClick={closeMobileMenu}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-[#334155] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
            >
              Insumos para Cafeteria
            </Link>

            <Link
              href="/blog"
              onClick={closeMobileMenu}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-[#334155] transition hover:bg-[#F7F5F1] hover:text-[#2A1A12]"
            >
              Blog
            </Link>

          </div>

          <div className="mt-5 border-t border-[#E8E0D6] pt-5">
            <Link
              href="/portal"
              onClick={closeMobileMenu}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#2A1A12] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1E120D]"
            >
              Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}