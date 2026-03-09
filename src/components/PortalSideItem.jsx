"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BRAND_GREEN = "#31572c";

export default function PortalSideItem({
  href,
  label,
  exact = false,
  icon: Icon,
  brandColor = BRAND_GREEN,
  collapsed = false,
}) {
  const pathname = usePathname() || "";
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={[
        "group rounded-2xl border transition-all duration-200 ease-out",
        collapsed
          ? "w-full flex items-center justify-center p-2"
          : "w-full flex items-center px-4 py-3",
        active
          ? "border-[#31572c] bg-[#31572c] shadow-[0_4px_14px_rgba(49,87,44,0.25)]"
          : "border-black/10 bg-white hover:bg-[#31572c]/5 hover:border-[#31572c]/40 hover:shadow-sm",
      ].join(" ")}
    >
      <div className={["flex items-center", collapsed ? "justify-center" : "gap-3"].join(" ")}>
        {Icon ? (
          <span
            className={[
              "flex h-10 w-10 items-center justify-center rounded-xl border transition",
              active
                ? "border-white/20 bg-white/10"
                : "border-black/10 bg-black/[0.02] group-hover:bg-black/[0.03]",
            ].join(" ")}
            aria-hidden="true"
          >
            <Icon
              size={18}
              strokeWidth={2}
              style={{ color: active ? "#ffffff" : brandColor }}
            />
          </span>
        ) : null}

        {!collapsed && (
          <span
            className={[
              "text-sm truncate",
              active ? "text-white font-medium" : "text-black/80",
            ].join(" ")}
          >
            {label}
          </span>
        )}
      </div>
    </Link>
  );
}