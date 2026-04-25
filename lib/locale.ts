import { cookies } from "next/headers";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("locale")?.value;
  return isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
}
