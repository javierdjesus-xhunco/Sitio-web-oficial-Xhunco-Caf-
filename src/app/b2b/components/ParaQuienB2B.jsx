export default function ParaQuienB2B() {
  const segmentos = [
    {
      titulo: "Restaurantes & Cafeterías",
      descripcion:
        "Café de especialidad consistente, perfiles personalizados y suministro confiable para tu operación diaria.",
      icono: "☕",
    },
    {
      titulo: "Hoteles & Resorts",
      descripcion:
        "Eleva la experiencia de tus huéspedes con café premium en habitaciones, desayunos y áreas comunes.",
      icono: "🏨",
    },
    {
      titulo: "Oficinas & Corporativos",
      descripcion:
        "Soluciones prácticas para oficinas que buscan bienestar, productividad y café de alta calidad.",
      icono: "🏢",
    },
    {
      titulo: "Distribuidores",
      descripcion:
        "Alianzas comerciales con márgenes atractivos, soporte técnico y productos de marca confiable.",
      icono: "🤝",
    },
  ];

  return (
    <section className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">

        {/* ENCABEZADO */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl font-semibold text-gray-900">
            ¿Para quién es Xhunco® B2B?
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Trabajamos con empresas que valoran la calidad, la trazabilidad
            y un servicio confiable a largo plazo.
          </p>
        </div>

        {/* TARJETAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {segmentos.map((item, index) => (
            <div
              key={index}
              className="group border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition bg-white"
            >
              <div className="text-4xl mb-6">
                {item.icono}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {item.titulo}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {item.descripcion}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
