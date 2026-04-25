"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";

import { type Locale, getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  locale: Locale;
  compact?: boolean;
}

export function LanguageSwitcher({ locale, compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const dict = getDictionary(locale);

  return (
    <div className={cn("gap-2", compact ? "flex items-center justify-end" : "grid grid-cols-1 items-start gap-2")}>
      {!compact ? (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          <Languages className="h-4 w-4" />
          {dict.common.language}
        </div>
      ) : null}
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900",
          compact ? "inline-flex" : "grid w-full grid-cols-2"
        )}
      >
        {(["es", "en"] as const).map((option) => (
          <a
            key={option}
            href={`/api/locale?locale=${option}&redirect=${encodeURIComponent(pathname || "/")}`}
            className={cn(
              "touch-manipulation rounded-xl px-3 py-2 text-center text-xs font-semibold uppercase transition",
              option === locale
                ? "bg-ink text-white shadow-sm dark:bg-aurora-600 dark:text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
          >
            {option}
          </a>
        ))}
      </div>
    </div>
  );
}
