import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Serif, Manrope } from "next/font/google";

import { getDictionary } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/locale";
import { DEFAULT_THEME, THEME_COOKIE_NAME, isTheme } from "@/lib/theme";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display"
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);

  return {
    title: dict.metadata.title,
    description: dict.metadata.description
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromCookies();
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME;

  return (
    <html lang={locale} className={`${bodyFont.variable} ${displayFont.variable} ${theme === "dark" ? "dark" : ""}`}>
      <body className="font-[var(--font-body)]">
        <div className="min-h-screen bg-grid-fade bg-[size:32px_32px]">{children}</div>
      </body>
    </html>
  );
}
