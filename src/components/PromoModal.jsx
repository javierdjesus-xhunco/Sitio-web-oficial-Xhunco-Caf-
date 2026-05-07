"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "xhunco_promo_seen_v1";
const INTERVAL = 4000; // 4 segundos

export default function PromoModal() {
  const [promos, setPromos] = useState([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const timerRef = useRef(null);

  useEffect(() => {
    if (pathname?.startsWith("/portal")) return;

    let mounted = true;

    async function loadPromos() {
      try {
        const res = await fetch("/api/public/promotions/active", {
          cache: "no-store",
        });

        const json = await res.json();

        if (!mounted || !json?.items?.length) return;

        setPromos(json.items);

        const seen = sessionStorage.getItem(STORAGE_KEY);
        if (seen) return;

        setTimeout(() => {
          if (mounted) setOpen(true);
        }, 150);
      } catch (err) {
        console.error(err);
      }
    }

    loadPromos();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  // autoplay tipo stories
  useEffect(() => {
    if (!open || promos.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % promos.length);
    }, INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [open, promos]);

  const closeModal = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const goPromo = () => {
    const promo = promos[index];
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);

    if (promo?.redirect_url) {
      router.push(promo.redirect_url);
    }
  };

  const goTo = (i) => {
    setIndex(i);
    clearInterval(timerRef.current);
  };

  if (!open || promos.length === 0) return null;

  const promo = promos[index];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      
      <div className="relative w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[55vw]">
        
        {/* cerrar */}
        <button
          onClick={closeModal}
          className="absolute right-3 top-3 z-30 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>

        {/* imagen */}
        <button
          onClick={goPromo}
          className="group block w-full overflow-hidden rounded-[24px] shadow-2xl"
        >
          <div className="relative w-full">
            <Image
              src={promo.image_url}
              alt={promo.title || "Promoción"}
              width={1400}
              height={800}
              priority
              className="w-full h-auto object-contain transition duration-300 group-hover:scale-[1.01]"
            />
          </div>
        </button>

        {/* DOTS tipo instagram */}
        {promos.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
            {promos.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-white"
                    : "w-2.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}