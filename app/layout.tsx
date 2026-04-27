import type { Metadata, Viewport } from "next";
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
    description: dict.metadata.description,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: dict.metadata.title
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content"
};

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
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} ${theme === "dark" ? "dark" : ""}`}
    >
      <body className="overflow-x-clip font-[var(--font-body)]">
        <div className="min-h-screen overflow-x-clip bg-grid-fade bg-[size:32px_32px]">{children}</div>
      </body>
    </html>
  );
}
