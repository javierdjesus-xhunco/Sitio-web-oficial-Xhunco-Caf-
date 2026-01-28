"use client";

export default function ProcesoB2B() {
  const pasos = [
    { paso: "01", titulo: "Diagnóstico", texto: "Entendemos tu consumo y necesidades." },
    { paso: "02", titulo: "Propuesta", texto: "Definimos café, volumen y precios." },
    { paso: "03", titulo: "Pruebas", texto: "Degustación y ajustes de tueste." },
    { paso: "04", titulo: "Suministro", texto: "Entrega continua y confiable." },
  ];

  return (
    <section id="proceso" className="py-24">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-3xl font-semibold mb-12">
          Nuestro proceso
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {pasos.map((item) => (
            <div
              key={item.paso}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <span className="text-3xl font-semibold text-gray-400">
                {item.paso}
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                {item.titulo}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {item.texto}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
