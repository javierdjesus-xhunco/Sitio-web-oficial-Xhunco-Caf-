"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PortalSideItem({ href, label, exact = false }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "group flex items-center justify-between rounded-2xl px-4 py-3 border transition",
        active
          ? "border-emerald-400/30 bg-emerald-400/10"
          : "border-white/10 bg-white/5 hover:bg-white/10",
      ].join(" ")}
    >
      <span className="text-sm text-white/80">{label}</span>
      <span className="text-white/40 group-hover:text-white/70">→</span>
    </Link>
  );
}
