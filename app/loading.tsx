import { getDictionary } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/locale";

export default async function Loading() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="surface-panel flex items-center gap-3 px-6 py-4 text-sm font-medium text-slate-600">
        <div className="h-2.5 w-2.5 rounded-full bg-aurora-500" />
        {dict.common.loading}
      </div>
    </div>
  );
}
