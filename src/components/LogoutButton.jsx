"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();

  const logout = async () => {
    const confirmLogout = window.confirm("¿Seguro que deseas cerrar sesión?");
    if (!confirmLogout) return;

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo cerrar sesión.");
    }
  };

  return (
    <button
      onClick={logout}
      className={[
        "w-full rounded-xl bg-[#31572c] hover:bg-[#27461f] text-white font-medium px-5 py-3 transition shadow-sm flex items-center justify-center gap-2",
        className,
      ].join(" ")}
    >
      <LogOut className="h-5 w-5" />
      Cerrar sesión
    </button>
  );
}