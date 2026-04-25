"use client";

import { MonitorCog, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";

import { type Locale, getDictionary } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  locale: Locale;
  theme: Theme;
}

export function ThemeSwitcher({ locale, theme }: ThemeSwitcherProps) {
  const pathname = usePathname();
  const dict = getDictionary(locale);

  return (
    <div className="grid grid-cols-1 items-start gap-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        <MonitorCog className="h-4 w-4" />
        {dict.common.appearance}
      </div>
      <div className="grid w-full grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        {([
          { value: "light", label: dict.common.lightMode, icon: Sun },
          { value: "dark", label: dict.common.darkMode, icon: Moon }
        ] as const).map((option) => {
          const Icon = option.icon;

          return (
            <a
              key={option.value}
              href={`/api/theme?theme=${option.value}&redirect=${encodeURIComponent(pathname || "/")}`}
              className={cn(
                "touch-manipulation inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center text-[11px] font-semibold uppercase transition sm:px-3 sm:text-xs",
                option.value === theme
                  ? "bg-ink text-white shadow-sm dark:bg-aurora-600 dark:text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
