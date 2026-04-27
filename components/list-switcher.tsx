"use client";

import { usePathname } from "next/navigation";

import type { RestaurantList } from "@/types/domain";
import { type Locale, getDictionary } from "@/lib/i18n";

export function ListSwitcher({
  locale,
  lists,
  activeListId
}: {
  locale: Locale;
  lists: RestaurantList[];
  activeListId: string | null;
}) {
  const pathname = usePathname() || "/";
  const dict = getDictionary(locale);

  return (
    <div className="surface-panel space-y-3 px-4 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{dict.lists.activeList}</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{lists.find((list) => list.id === activeListId)?.name ?? "-"}</p>
      </div>
      <form action="/api/active-list" method="get" className="grid gap-3" autoComplete="off" suppressHydrationWarning>
        <input type="hidden" name="redirect" value={pathname} />
        <select name="listId" defaultValue={activeListId ?? ""} className="field" autoComplete="off" suppressHydrationWarning>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {dict.lists.switchList}
        </button>
      </form>
    </div>
  );
}
