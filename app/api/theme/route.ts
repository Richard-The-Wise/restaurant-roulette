import { NextResponse } from "next/server";

import { DEFAULT_THEME, THEME_COOKIE_NAME, isTheme } from "@/lib/theme";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const theme = isTheme(url.searchParams.get("theme")) ? url.searchParams.get("theme")! : DEFAULT_THEME;
  const redirectTo = url.searchParams.get("redirect") || "/";

  const response = NextResponse.redirect(new URL(redirectTo, url.origin));
  response.cookies.set(THEME_COOKIE_NAME, theme, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return response;
}
