"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMensaje("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/actualizar-password`,
      });

      if (error) throw error;

      setMensaje(
        "Si el correo está registrado, recibirás un enlace seguro para restablecer tu contraseña."
      );

      setEmail("");
    } catch (err: any) {
      setError(err?.message || "No se pudo enviar el correo de recuperación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* IMAGEN DE FONDO */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/fondoportal.jpeg')" }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* CARD */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl p-10 sm:p-12 rounded-3xl shadow-2xl animate-fade-in">
        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-xhunco.png"
            alt="Xhunco Café"
            width={165}
            height={42}
            priority
            className="object-contain"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold text-center text-gray-950 mb-3 tracking-tight">
          Recuperar contraseña
        </h1>

        <p className="text-gray-600 text-center mb-9 leading-relaxed">
          Ingresa el correo con el que accedes al portal de clientes y te
          enviaremos un enlace seguro para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@negocio.com"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#31572c] focus:ring-2 focus:ring-[#31572c]/20"
            />
          </div>

          {mensaje && (
            <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 leading-relaxed">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold tracking-wide hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login?next=%2Fportal%2Fcliente%2Fdashboard"
            className="text-sm font-medium text-[#31572c] hover:text-[#25441f] hover:underline transition"
          >
            Volver al inicio de sesión
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Acceso protegido · Información confidencial
        </p>
      </div>
    </main>
  );
}