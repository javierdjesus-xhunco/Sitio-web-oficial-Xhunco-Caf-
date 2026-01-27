"use client";

export default function ParaQuienB2B() {
  const clientes = [
    "Cafeterías",
    "Restaurantes",
    "Hoteles",
    "Eventos corporativos",
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-3xl font-semibold mb-12">
          ¿Para quién es Xhunco® Café B2B?
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {clientes.map((item) => (
            <div
              key={item}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center font-medium shadow-sm hover:shadow-md transition"
            >
              {item}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
