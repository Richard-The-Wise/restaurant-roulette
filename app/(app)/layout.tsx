import Link from "next/link";
import { Sparkles, UtensilsCrossed } from "lucide-react";

import { ListSwitcher } from "@/components/list-switcher";
import { SiteNav } from "@/components/site-nav";
import { UserMenu } from "@/components/user-menu";
import { getDictionary } from "@/lib/i18n";
import { getActiveListForCurrentUser } from "@/lib/list-selection";
import { getLocaleFromCookies } from "@/lib/locale";

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const { activeList, lists } = await getActiveListForCurrentUser();

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="shell-panel flex h-fit flex-col gap-6 px-5 py-5 lg:sticky lg:top-6">
          <Link href="/" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">Restaurant Roulette</p>
              <p className="text-xs text-slate-500">{dict.shell.brandSubtitle}</p>
            </div>
          </Link>

          <div className="rounded-2xl border border-dashed border-aurora-200 bg-aurora-50/80 p-4 text-sm leading-6 text-aurora-700">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4" />
              {dict.shell.smartShortlistTitle}
            </div>
            {dict.shell.smartShortlistBody}
          </div>

          <SiteNav locale={locale} />
          <ListSwitcher locale={locale} lists={lists} activeListId={activeList?.id ?? null} />
          <UserMenu locale={locale} />
        </aside>

        <section className="space-y-6">{children}</section>
      </div>
    </main>
  );
}
