import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
     <footer className="bg-[#edf7e7] text-[#25441f] pt-12 pb-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        
        {/* Marca */}
        <div>
          <div className="mb-4">
            <Image
              src="/logo-xhunco.png"
              alt="Xhunco Café"
              width={150}
              height={46}
              className="object-contain"
              priority
            />
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-[#31572c]/85">
            Café de origen con trazabilidad real. Conectamos productores,
            tostadores y consumidores a través de una experiencia digital
            transparente.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#31572c]">
            Explorar
          </h4>

          <ul className="space-y-2 text-sm text-[#25441f]/80">
            <li>
              <Link href="/#cafes" className="transition hover:text-[#31572c]">
                Cafés
              </Link>
            </li>
            <li>
              <Link href="/#trazabilidad" className="transition hover:text-[#31572c]">
                Trazabilidad
              </Link>
            </li>
            <li>
              <Link href="/#clientes" className="transition hover:text-[#31572c]">
                Clientes
              </Link>
            </li>
            <li>
              <Link href="/trazabilidad" className="transition hover:text-[#31572c]">
                Buscar mi lote
              </Link>
            </li>
            <li>
              <Link href="/legal" className="transition hover:text-[#31572c]">
                Centro Legal
              </Link>
            </li>
            <li>
              <Link href="/legal/privacidad" className="transition hover:text-[#31572c]">
                Aviso de Privacidad
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#31572c]">
            Contacto
          </h4>

          <ul className="space-y-3 text-sm text-[#25441f]/80">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#31572c]" />
              <span>
                El Tordo 31 Col. Los Potrillos, Tlaxcala, Tlax. C.P. 90014
              </span>
            </li>

            <li>
              <a
                href="mailto:soporte@xhunco.com"
                className="flex items-center gap-3 transition hover:text-[#31572c]"
              >
                <Mail className="h-4 w-4 shrink-0 text-[#31572c]" />
                <span>soporte@xhunco.com</span>
              </a>
            </li>

            <li>
              <a
                href="tel:+522463607392"
                className="flex items-center gap-3 transition hover:text-[#31572c]"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#31572c]" />
                <span>+52 246 360 7392</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Redes */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#31572c]">
            Síguenos
          </h4>

          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/xhuncocafe/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Xhunco Café"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#31572c]/20 bg-white/70 text-[#31572c] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#31572c] hover:text-white"
            >
              <Instagram className="h-5 w-5" />
            </a>

            <a
              href="https://www.facebook.com/XhuncoCafe"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de Xhunco Café"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#31572c]/20 bg-white/70 text-[#31572c] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#31572c] hover:text-white"
            >
              <Facebook className="h-5 w-5" />
            </a>

            <a
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok de Xhunco Café"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#31572c]/20 bg-white/70 text-[#31572c] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#31572c] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M16.6 5.82c1.15.82 2.5 1.3 3.94 1.35v3.18a7.82 7.82 0 0 1-3.91-1.02v5.75a5.66 5.66 0 1 1-5.66-5.66c.36 0 .72.03 1.06.1v3.28a2.48 2.48 0 1 0 1.45 2.26V3h3.12v2.82Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-[#31572c]/15 px-6 pt-5 text-center text-xs text-[#25441f]/70 sm:px-8">
        © {new Date().getFullYear()} Xhunco® Café. Todos los derechos reservados.
      </div>
    </footer>
  );
}