import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale } from "@/lib/i18n";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = isLocale(url.searchParams.get("locale")) ? url.searchParams.get("locale")! : DEFAULT_LOCALE;
  const redirectTo = url.searchParams.get("redirect") || "/";

  const response = NextResponse.redirect(new URL(redirectTo, url.origin));
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return response;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { locale?: string; redirect?: string } | null;
  const locale = isLocale(body?.locale) ? body.locale : DEFAULT_LOCALE;
  const redirectTo = body?.redirect || "/";

  const response = NextResponse.json({ ok: true, locale, redirectTo });
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return response;
}
