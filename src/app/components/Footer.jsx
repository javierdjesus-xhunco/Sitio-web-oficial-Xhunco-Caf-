import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#000000] text-gray-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Marca */}
        <div>
          <div className="mb-4">
            <Image
              src="/logo-xhunco-horizontal-blanco.png"
              alt="Xhunco Café"
              width={160}
              height={48}
              className="object-contain"
              priority
            />
          </div>

          <p className="text-sm leading-relaxed text-gray-100">
            Café de origen con trazabilidad real.  
            Conectamos productores, tostadores y consumidores
            a través de una experiencia digital transparente.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="text-white font-semibold mb-4">Explorar</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#cafes" className="hover:text-white transition">Cafés</Link></li>
            <li><Link href="/#trazabilidad" className="hover:text-white transition">Trazabilidad</Link></li>
            <li><Link href="/#clientes" className="hover:text-white transition">Clientes</Link></li>
            <li><Link href="/trazabilidad" className="hover:text-white transition">Buscar mi lote</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm text-gray-100">
            <li>📍 El Tordo 31 Col. Los Potrillos, Tlaxcala, Tlax C.P. 90014</li>
            <li>📧 soporte@xhunco.com</li>
            <li>📞 +52 246-142-86-84</li>
          </ul>
        </div>

        {/* Redes */}
        <div>
          <h4 className="text-white font-semibold mb-4">Síguenos</h4>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition">Instagram</a>
            <a href="#" className="hover:text-white transition">Facebook</a>
            <a href="#" className="hover:text-white transition">LinkedIn</a>
          </div>
        </div>

      </div>

      <div className="border-t border-white/20 mt-16 pt-6 text-center text-sm text-gray-200">
        © {new Date().getFullYear()} Xhunco® Café. Todos los derechos reservados.
      </div>
    </footer>
  );
}
