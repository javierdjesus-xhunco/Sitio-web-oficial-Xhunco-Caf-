"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import PromoModal from "@/components/PromoModal";
import CartFloating from "@/components/CartFloating";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");

  return (
    <>
      {!isPortal && <Header />}
      {!isPortal && <PromoModal />}
      {!isPortal && <CartFloating />}

      <main className={isPortal ? "min-h-screen" : "min-h-screen pt-20"}>
        {children}
      </main>
    </>
  );
}