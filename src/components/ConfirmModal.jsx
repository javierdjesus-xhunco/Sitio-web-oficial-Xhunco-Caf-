"use client";

import { useEffect } from "react";
import { X, LogOut } from "lucide-react";

const BRAND_GREEN = "#31572c";

export default function ConfirmModal({
  open,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
}) {
  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  // Bloquear scroll al abrir
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={loading ? undefined : onCancel}
        type="button"
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={[
            "w-full max-w-md rounded-3xl border border-black/10 bg-white shadow-xl",
            "transform transition duration-200 ease-out",
            "animate-[pop_180ms_ease-out]",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-start gap-3 px-6 pt-6">
            <div
              className="h-11 w-11 rounded-2xl border border-black/10 bg-black/[0.02] flex items-center justify-center"
              aria-hidden="true"
            >
              <LogOut size={18} strokeWidth={2} style={{ color: BRAND_GREEN }} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-black">{title}</div>
              <div className="mt-1 text-sm text-black/60">{message}</div>
            </div>

            <button
              type="button"
              onClick={loading ? undefined : onCancel}
              className="h-10 w-10 rounded-2xl border border-black/10 hover:bg-black/[0.03] transition flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 pt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={loading ? undefined : onCancel}
              className={[
                "h-11 px-4 rounded-2xl border border-black/10 bg-white",
                "text-sm font-medium text-black/70",
                "hover:bg-black/[0.02] transition",
                "active:scale-[0.99]",
                loading ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={[
                "h-11 px-5 rounded-2xl text-sm font-semibold text-white",
                "transition active:scale-[0.99]",
                loading ? "opacity-70 cursor-not-allowed" : "",
              ].join(" ")}
              style={{ backgroundColor: BRAND_GREEN }}
            >
              {loading ? "Cerrando..." : confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pop {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}