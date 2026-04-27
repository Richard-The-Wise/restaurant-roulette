import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

import { ListSwitcher } from "@/components/list-switcher";
import { MobileSidebarDrawer } from "@/components/mobile-sidebar-drawer";
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

  const sidebarContent = (
    <>
      <Link href="/" className="hidden items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 lg:flex">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Restaurant Roulette</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">{dict.shell.brandSubtitle}</p>
        </div>
      </Link>

      <SiteNav locale={locale} />
      <ListSwitcher locale={locale} lists={lists} activeListId={activeList?.id ?? null} />
      <UserMenu locale={locale} />
    </>
  );

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <MobileSidebarDrawer brandSubtitle={dict.shell.brandSubtitle}>{sidebarContent}</MobileSidebarDrawer>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden shell-panel h-fit flex-col gap-6 px-5 py-5 lg:sticky lg:top-6 lg:flex">
          {sidebarContent}
        </aside>

        <section className="min-w-0 space-y-6 overflow-x-clip">{children}</section>
      </div>
    </main>
  );
}
