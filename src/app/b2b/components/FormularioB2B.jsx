"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Truck,
  Headphones,
} from "lucide-react";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Atención B2B especializada",
    text: "Cuéntanos sobre tu operación y te ayudamos a identificar una solución adecuada para tu negocio.",
  },
  {
    icon: Truck,
    title: "Abastecimiento continuo",
    text: "Buscamos ayudarte a mantener una operación más estable con mejor orden y seguimiento.",
  },
  {
    icon: Headphones,
    title: "Acompañamiento continuo",
    text: "Un asesor puede orientarte según tu tipo de negocio, volumen y necesidades operativas.",
  },
];

const initialForm = {
  company_name: "",
  contact_name: "",
  email: "",
  phone: "",
  business_type: "",
  city: "",
  monthly_volume: "",
  message: "",
};

export default function FormularioB2B() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const res = await fetch("/api/b2b/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo enviar la solicitud.");
      }

      setStatus({
        type: "success",
        message: "Gracias. Recibimos tu solicitud y pronto te contactaremos.",
      });

      setForm(initialForm);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Ocurrió un error al enviar el formulario.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="formulario-b2b" className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <span className="inline-flex rounded-full border border-[#E6DED4] bg-[#FAF8F5] px-4 py-2 text-sm font-medium text-[#6B3E26]">
              Contacto
            </span>

            <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#0F172A] md:text-5xl">
              Hablemos de la operación de tu negocio
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#475569] md:text-lg">
              Comparte algunos datos sobre tu negocio y un asesor se pondrá en
              contacto contigo para entender tus necesidades y proponerte una
              solución adecuada.
            </p>

            <div className="mt-10 space-y-6">
              {reasons.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3ECE5] text-[#6B3E26]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="text-base font-semibold text-[#0F172A]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm leading-7 text-[#475569] md:text-[15px]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#E8E0D6] bg-[#FCFBF9] p-6 shadow-[0_20px_60px_rgba(42,26,18,0.06)] md:p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[#334155]">
                  Nombre de la empresa *
                </label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  type="text"
                  required
                  className="mt-2 w-full rounded-2xl border border-[#D8D5CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B3E26] focus:ring-2 focus:ring-[#6B3E26]/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">
                  Nombre de contacto *
                </label>
                <input
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleChange}
                  type="text"
                  required
                  className="mt-2 w-full rounded-2xl border border-[#D8D5CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B3E26] focus:ring-2 focus:ring-[#6B3E26]/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">
                  Correo electrónico *
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  required
                  className="mt-2 w-full rounded-2xl border border-[#D8D5CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B3E26] focus:ring-2 focus:ring-[#6B3E26]/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">
                  Teléfono
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                  className="mt-2 w-full rounded-2xl border border-[#D8D5CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B3E26] focus:ring-2 focus:ring-[#6B3E26]/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">
                  Tipo de negocio *
                </label>
                <select
                  name="business_type"
                  value={form.business_type}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-[#D8D5CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B3E26] focus:ring-2 focus:ring-[#6B3E26]/10"
                >
                  <option value="">Selecciona...</option>
                  <option value="Cafetería">Cafetería</option>
                  <option value="Restaurante">Restaurante</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Distribuidor">Distribuidor</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">
                  Ciudad
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-[#D8D5CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B3E26] focus:ring-2 focus:ring-[#6B3E26]/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">
                  Volumen mensual estimado
                </label>
                <select
                  name="monthly_volume"
                  value={form.monthly_volume}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-[#D8D5CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B3E26] focus:ring-2 focus:ring-[#6B3E26]/10"
                >
                  <option value="">Selecciona...</option>
                  <option value="Menos de 10 kg">Menos de 10 kg</option>
                  <option value="10 – 30 kg">10 – 30 kg</option>
                  <option value="30 – 100 kg">30 – 100 kg</option>
                  <option value="Más de 100 kg">Más de 100 kg</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[#334155]">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Cuéntanos más sobre tu negocio o tus necesidades..."
                  className="mt-2 w-full rounded-2xl border border-[#D8D5CF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B3E26] focus:ring-2 focus:ring-[#6B3E26]/10"
                />
              </div>

              {status.message ? (
                <div
                  className={`md:col-span-2 rounded-2xl px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {status.message}
                </div>
              ) : null}

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#2A1A12] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1E120D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Enviando..." : "Enviar solicitud"}
                </button>

                <p className="mt-3 text-center text-xs leading-6 text-[#64748B]">
                  Al enviarlo, podremos contactarte para entender mejor tu operación
                  y darte seguimiento comercial.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}