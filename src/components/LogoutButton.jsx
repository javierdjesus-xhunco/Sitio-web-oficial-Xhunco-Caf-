"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      className={[
        "w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/80 hover:bg-white/10 transition",
        className,
      ].join(" ")}
    >
      Cerrar sesión
    </button>
  );
}
