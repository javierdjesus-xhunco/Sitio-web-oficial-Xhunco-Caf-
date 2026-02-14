"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingOverlay from "./LoadingOverlay";

export default function GlobalRouteLoader() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  // Oculta loader cuando ya cambió la ruta
  useEffect(() => {
    setShow(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e) => {
      try {
        const target = e.target;
        if (!(target instanceof Element)) return;

        const a = target.closest("a");
        if (!a) return;

        const href = a.getAttribute("href");
        if (!href) return;

        // Ignora acciones que no son navegación SPA
        if (href.startsWith("#")) return;
        if (a.target === "_blank") return;
        if (a.hasAttribute("download")) return;
        if (href.startsWith("http")) return;

        setShow(true);
      } catch {
        // Nunca rompas la app por el loader
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return show ? <LoadingOverlay label="Cargando..." /> : null;
}
