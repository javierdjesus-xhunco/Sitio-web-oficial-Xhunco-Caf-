"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ActualizarPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validandoSesion, setValidandoSesion] = useState(true);
  const [loading, setLoading] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function prepararSesion() {
      setError("");

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) throw error;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(
            "El enlace no es válido o ya expiró. Solicita un nuevo enlace de recuperación."
          );
        }
      } catch (err: any) {
        setError(
          err?.message || "No se pudo validar el enlace de recuperación."
        );
      } finally {
        setValidandoSesion(false);
      }
    }

    prepararSesion();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMensaje("Tu contraseña se actualizó correctamente.");

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login?next=%2Fportal%2Fcliente%2Fdashboard");
      }, 1800);
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar la contraseña.");
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
          Nueva contraseña
        </h1>

        <p className="text-gray-600 text-center mb-9 leading-relaxed">
          Crea una nueva contraseña para recuperar el acceso al portal de
          clientes.
        </p>

        {validandoSesion ? (
          <div className="rounded-2xl bg-white border border-gray-200 px-4 py-4 text-sm text-gray-600 text-center">
            Validando enlace...
          </div>
        ) : error && !mensaje ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 leading-relaxed">
              {error}
            </div>

            <Link
              href="/recuperar-password"
              className="block w-full text-center bg-black text-white py-3 rounded-xl font-semibold tracking-wide hover:bg-gray-800 transition"
            >
              Solicitar nuevo enlace
            </Link>

            <div className="text-center">
              <Link
                href="/login?next=%2Fportal%2Fcliente%2Fdashboard"
                className="text-sm font-medium text-[#31572c] hover:text-[#25441f] hover:underline transition"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#31572c] focus:ring-2 focus:ring-[#31572c]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#31572c] focus:ring-2 focus:ring-[#31572c]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
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
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>

            <div className="text-center">
              <Link
                href="/login?next=%2Fportal%2Fcliente%2Fdashboard"
                className="text-sm font-medium text-[#31572c] hover:text-[#25441f] hover:underline transition"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}

        <p className="text-xs text-gray-400 text-center mt-8">
          Acceso protegido · Información confidencial
        </p>
      </div>
    </main>
  );
}