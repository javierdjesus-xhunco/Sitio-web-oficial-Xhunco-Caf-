"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "xhunco_promo_seen_v1";

export default function PromoModal() {
  const [promo, setPromo] = useState(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname?.startsWith("/portal")) return;

    let mounted = true;
    let timer = null;

    async function loadPromo() {
      try {
        const res = await fetch("/api/public/promotions/active", {
          cache: "no-store",
        });

        const json = await res.json();

        if (!mounted || !json?.item) return;

        setPromo(json.item);

        const alreadySeenInSession = window.sessionStorage.getItem(STORAGE_KEY);
        if (alreadySeenInSession) return;

        timer = window.setTimeout(() => {
          if (mounted) setOpen(true);
        }, 150);
      } catch {
        return;
      }
    }

    loadPromo();

    return () => {
      mounted = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [pathname]);

  const closeModal = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const goPromo = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);

    if (promo?.redirect_url) {
      router.push(promo.redirect_url);
    }
  };

  if (!promo || !open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
      <div className="relative w-full max-w-[95vw] sm:max-w-[88vw] md:max-w-[78vw] lg:max-w-[68vw] xl:max-w-[58vw]">
        <button
          onClick={closeModal}
          className="absolute right-3 top-3 z-20 rounded-full bg-black/55 p-2 text-white shadow-lg transition hover:bg-black/75"
          aria-label="Cerrar promoción"
        >
          <X className="h-5 w-5" />
        </button>

        <button
          onClick={goPromo}
          className="group block w-full overflow-hidden rounded-[24px] bg-white shadow-2xl outline-none"
          aria-label={promo.title || "Ver promoción"}
        >
          <div className="relative flex max-h-[85vh] min-h-[320px] w-full items-center justify-center bg-white">
            <Image
              src={promo.image_url}
              alt={promo.title || "Promoción"}
              width={1400}
              height={1400}
              priority
              className="h-auto max-h-[85vh] w-auto max-w-full object-contain transition duration-300 group-hover:scale-[1.01]"
            />
          </div>
        </button>
      </div>
    </div>
  );
}