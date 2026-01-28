import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Marca */}
        <div>
          <h3 className="text-white text-xl font-semibold mb-4">
            Xhunco® Café
          </h3>
          <p className="text-sm leading-relaxed">
            Café de origen con trazabilidad real.  
            Conectamos productores, tostadores y consumidores
            a través de una experiencia digital transparente.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="text-white font-semibold mb-4">Explorar</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#cafes">Cafés</Link></li>
            <li><Link href="/#trazabilidad">Trazabilidad</Link></li>
            <li><Link href="/#clientes">Clientes</Link></li>
            <li><Link href="/trazabilidad">Buscar mi lote</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm">
            <li>📍 Tlaxcala</li>
            <li>📧 javier.ortiz@xhunco.com</li>
            <li>📞 +52 246-142-86-84</li>
          </ul>
        </div>

        {/* Redes */}
        <div>
          <h4 className="text-white font-semibold mb-4">Síguenos</h4>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">Facebook</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
          </div>
        </div>

      </div>

      {/* Línea inferior */}
      <div className="border-t border-gray-800 mt-16 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Xhunco® Café. Todos los derechos reservados.
      </div>
    </footer>
  );
}
