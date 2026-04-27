import { LogOut, Sparkles } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getDictionary, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME, THEME_COOKIE_NAME, isTheme } from "@/lib/theme";

export async function UserMenu({ locale }: { locale: Locale }) {
  const supabase = await createClient();
  const dict = getDictionary(locale);
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME;

  async function signOut() {
    "use server";

    const serverClient = await createClient();
    await serverClient.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="surface-panel space-y-4 px-4 py-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{dict.common.signedIn}</p>
        <p className="break-all text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.email}</p>
      </div>

      <form action={signOut} className="w-full" autoComplete="off" suppressHydrationWarning>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          <Sparkles className="h-4 w-4 text-aurora-600" />
          {dict.common.signOut}
          <LogOut className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </button>
      </form>

      <div className="space-y-3 border-t border-slate-200/80 pt-3 dark:border-slate-800">
        <LanguageSwitcher locale={locale} />
        <ThemeSwitcher locale={locale} theme={theme} />
      </div>
    </div>
  );
}
