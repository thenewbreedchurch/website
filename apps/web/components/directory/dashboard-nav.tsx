"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/directory/dashboard", label: "Overview" },
  { href: "/directory/dashboard/listing", label: "My listing" },
  { href: "/directory/dashboard/portfolio", label: "Portfolio" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "t-eyebrow border px-4 py-3",
              active ? "border-white bg-white text-night" : "border-white/30 text-white/80 hover:border-white hover:text-white"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
