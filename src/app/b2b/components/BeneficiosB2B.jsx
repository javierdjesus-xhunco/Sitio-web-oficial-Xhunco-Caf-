export default function BeneficiosB2B() {
  const beneficios = [
    {
      titulo: "Café de calidad garantizado",
      descripcion:
        "Seleccionamos granos de origen mexicano con estándares de calidad constantes para asegurar una experiencia agradable en cada taza.",
    },
    {
      titulo: "Precios preferenciales para negocios",
      descripcion:
        "Ofrecemos esquemas de precios escalonados según tu volumen de consumo mensual.",
    },
    {
      titulo: "Abastecimiento confiable",
      descripcion:
        "Logística eficiente que garantiza entregas puntuales y continuidad operativa para tu negocio.",
    },
    {
      titulo: "Asesoría personalizada",
      descripcion:
        "Te ayudamos a elegir el café ideal según tu tipo de negocio y perfil de cliente.",
    },
    {
      titulo: "Opciones de molienda y tueste",
      descripcion:
        "Adaptamos el producto a tu equipo, método de preparación y preferencia de sabor.",
    },
    {
      titulo: "Relación a largo plazo",
      descripcion:
        "Más que un proveedor, buscamos convertirnos en un aliado estratégico para tu crecimiento.",
    },
  ];

  return (
    <section className="py-24 bg-[#F8F7F5]">
      <div className="max-w-7xl mx-auto px-8">

        {/* TÍTULO */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl font-semibold">
            ¿Por qué elegir Xhunco® Café?
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Trabajamos con negocios que buscan calidad, consistencia y un
            proveedor confiable de café de especialidad.
          </p>
        </div>

        {/* GRID DE BENEFICIOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {beneficios.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold">
                {item.titulo}
              </h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {item.descripcion}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
