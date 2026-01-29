"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";

export default function PortalLogin() {
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();
    localStorage.setItem("xhunco-auth", "true");
    router.push("/portal/panel");
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

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl p-12 rounded-3xl shadow-2xl animate-fade-in">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-xhunco.png"
            alt="Xhunco Café"
            width={160}
            height={40}
            priority
          />
        </div>

        <h1 className="text-3xl font-semibold text-center text-gray-900 mb-2">
          Portal de Socios
        </h1>

        <p className="text-gray-600 text-center mb-10">
          Acceso seguro para clientes y aliados comerciales
        </p>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl font-semibold tracking-wide hover:bg-gray-800 transition"
          >
            Iniciar sesión
          </button>
        </form>

        {/* TEXTO SEGURIDAD */}
        <p className="text-xs text-gray-400 text-center mt-8">
          Acceso protegido · Información confidencial
        </p>

      </div>
    </main>
  );
}
