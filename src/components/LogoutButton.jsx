"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function LogoutButton({ className = "", collapsed = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
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
    <>
      {collapsed ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className={[
            "w-full flex items-center justify-center",
            "rounded-2xl border border-black/10 bg-white",
            "p-2 hover:bg-black/[0.02] hover:shadow-sm transition",
            "active:scale-[0.99]",
            className,
          ].join(" ")}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-black/[0.02]">
            <Lock className="h-5 w-5 text-[#31572c]" />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={[
            "w-full rounded-xl bg-[#31572c] hover:bg-[#27461f] text-white font-medium px-5 py-3 transition shadow-sm flex items-center justify-center gap-2",
            className,
          ].join(" ")}
        >
          <Lock className="h-5 w-5" />
          Cerrar sesión
        </button>
      )}

      <ConfirmModal
        open={open}
        title="Cerrar sesión"
        message="¿Seguro que deseas cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onCancel={() => setOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}