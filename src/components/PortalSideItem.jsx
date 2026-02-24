"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PortalSideItem({ href, label, exact = false }) {
  const pathname = usePathname() || ""; // ✅ agregado fallback
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined} // ✅ agregado accesibilidad
      className={[
        "group flex items-center justify-between rounded-2xl px-4 py-3 border transition-all duration-200 ease-out ",
        active
  ? "border-[#31572c] bg-[#31572c] shadow-[0_4px_14px_rgba(49,87,44,0.25)]"
  : "border-black/10 bg-white hover:bg-[#31572c]/5 hover:border-[#31572c]/40 hover:shadow-sm"
      ].join(" ")}
    >
      <span
        className={[
          "text-sm",
          active ? "text-white font-medium" : "text-black/80",
        ].join(" ")}
      >
        {label}
      </span>

      <span
        className={[
          "transition",
          active
            ? "text-white"
            : "text-black/40 group-hover:text-black/70",
        ].join(" ")}
      >
        →
      </span>
    </Link>
  );
}