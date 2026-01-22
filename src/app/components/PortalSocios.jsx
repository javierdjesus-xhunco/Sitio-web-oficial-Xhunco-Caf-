import Link from "next/link";

export default function PortalSocios() {
  return (
    <section className="bg-black text-white py-24">
      <div className="max-w-6xl mx-auto px-8 text-center">

        <h2 className="text-4xl font-semibold mb-6">
          Portal de Socios
        </h2>

        <p className="text-gray-300 max-w-2xl mx-auto mb-10">
          Acceso exclusivo para clientes y socios.
          Realiza pedidos, consulta historial y gestiona tu cuenta.
        </p>

        <div className="flex justify-center gap-6">
          <Link
            href="/portal/login"
            className="px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/portal/registro"
            className="px-6 py-3 border border-white rounded-md font-medium hover:bg-white hover:text-black transition"
          >
            Alta de cliente
          </Link>
        </div>

      </div>
    </section>
  );
}
