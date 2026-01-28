"use client";

import { useState } from "react";

export default function FormularioB2B() {
  const [form, setForm] = useState({
    empresa: "",
    contacto: "",
    correo: "",
    telefono: "",
    tipoNegocio: "",
    consumo: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validarFormulario = () => {
    if (
      !form.empresa ||
      !form.contacto ||
      !form.correo ||
      !form.telefono ||
      !form.tipoNegocio ||
      !form.consumo
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setLoading(true);

    try {
      // 🔴 Aquí después conectarás tu backend real
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEnviado(true);
      setForm({
        empresa: "",
        contacto: "",
        correo: "",
        telefono: "",
        tipoNegocio: "",
        consumo: "",
        mensaje: "",
      });
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-8">

        <h2 className="text-3xl font-semibold text-center">
            Solicita una cotización y llevemos café de especialidad a tu negocio.
        </h2>

        <p className="mt-4 text-gray-600 text-center max-w-2xl mx-auto">
          Nuestro equipo se pondrá en contacto contigo para ofrecerte una
          solución personalizada.
        </p>

        {/* MENSAJE DE ÉXITO */}
        {enviado && (
          <div className="mt-10 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl text-center">
            <h3 className="font-semibold text-lg">
              ¡Solicitud enviada con éxito!
            </h3>
            <p className="mt-2 text-sm">
              En breve uno de nuestros asesores se pondrá en contacto contigo.
            </p>
          </div>
        )}

        {/* FORMULARIO */}
        {!enviado && (
          <form
            onSubmit={handleSubmit}
            className="mt-12 bg-[#F8F7F5] border border-gray-200 rounded-2xl p-8 grid md:grid-cols-2 gap-6"
          >

            {error && (
              <div className="md:col-span-2 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre de la empresa *
              </label>
              <input
                type="text"
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Contacto */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Persona de contacto *
              </label>
              <input
                type="text"
                name="contacto"
                value={form.contacto}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Tipo negocio */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de negocio *
              </label>
              <select
                name="tipoNegocio"
                value={form.tipoNegocio}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-black"
              >
                <option value="">Selecciona una opción</option>
                <option value="cafeteria">Cafetería</option>
                <option value="restaurante">Restaurante</option>
                <option value="hotel">Hotel</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Consumo */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Consumo mensual *
              </label>
              <select
                name="consumo"
                value={form.consumo}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-black"
              >
                <option value="">Selecciona una opción</option>
                <option value="5-10kg">5 – 10 kg</option>
                <option value="10-30kg">10 – 30 kg</option>
                <option value="30-50kg">30 – 50 kg</option>
                <option value="+50kg">Más de 50 kg</option>
              </select>
            </div>

            {/* Mensaje */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Comentarios adicionales
              </label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                rows="4"
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            {/* BOTÓN */}
            <div className="md:col-span-2 text-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-md text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
