"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getNavItems, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SiteNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const items = getNavItems(locale);

  return (
    <nav className="grid grid-cols-1 gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
              active
                ? "bg-ink text-white shadow-soft"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
