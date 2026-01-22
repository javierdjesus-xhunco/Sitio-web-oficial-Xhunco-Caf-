"use client";

import { useRouter } from "next/navigation";

export default function PortalLogin() {
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();

    // Simulación de login
    localStorage.setItem("xhunco-auth", "true");

    router.push("/portal/panel");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-3xl font-semibold mb-2 text-center">
          Portal de Socios
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Acceso exclusivo para clientes autorizados
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full border px-4 py-2 rounded-md"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border px-4 py-2 rounded-md"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            Iniciar sesión
          </button>
        </form>

      </div>
    </main>
  );
}
