"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import Image from "next/image";

import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import LoadingOverlay from "@/components/LoadingOverlay";

const LOGIN_BACKGROUNDS = [
  "/fondoportal1.avif",
  "/fondoportal2.avif",
  "/fondoportal3.avif",
];

export default function PortalLogin() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [backgroundImage, setBackgroundImage] = useState(LOGIN_BACKGROUNDS[0]);

  useEffect(() => {
    const storageKey = "xhunco_login_background_index";

    const lastIndex = Number(localStorage.getItem(storageKey) || "-1");

    const nextIndex = (lastIndex + 1) % LOGIN_BACKGROUNDS.length;

    localStorage.setItem(storageKey, String(nextIndex));

    setBackgroundImage(LOGIN_BACKGROUNDS[nextIndex]);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email") || "").trim().toLowerCase();

    const password = String(formData.get("password") || "");

    setErrorMessage("");

    setIsLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErrorMessage("Usuario o contraseña incorrectos.");

      setIsLoading(false);

      return;
    }

    const roleRes = await fetch("/api/auth/role", { method: "GET" });

    const roleData = await roleRes.json().catch(() => ({}));

    if (!roleRes.ok) {
      setErrorMessage("No se pudo determinar el rol del usuario.");

      setIsLoading(false);

      return;
    }

    if (roleData.role === "super_admin") {
      router.push("/portal/super-admin/dashboard");

      return;
    }

    if (roleData.role === "admin") {
      router.push("/portal/admin/dashboard");

      return;
    }

    if (roleData.role === "cliente") {
      router.push("/portal/cliente/dashboard");

      return;
    }

    router.push("/portal");
  }

  return (
    <>
      {isLoading ? <LoadingOverlay label="Cargando..." /> : null}

      <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* IMAGEN DE FONDO */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
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
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                required
                disabled={isLoading}
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                required
                disabled={isLoading}
              />

              {/* BOTÓN OJO */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition disabled:opacity-50"
                tabIndex={-1}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-3 text-right">
              <Link
                href="/recuperar-password"
                className="text-sm font-medium text-[#31572c] hover:text-[#25441f] hover:underline transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold tracking-wide hover:bg-gray-800 transition disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isLoading ? "Validando acceso..." : "Iniciar sesión"}
            </button>
          </form>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-600 text-center">
              {errorMessage}
            </p>
          ) : null}

          {/* TEXTO SEGURIDAD */}
          <p className="text-xs text-gray-400 text-center mt-8">
            Acceso protegido · Información confidencial
          </p>
        </div>
      </main>
    </>
  );
}