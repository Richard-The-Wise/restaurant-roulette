import { AuthCard } from "@/components/auth-card";
import { getLocaleFromCookies } from "@/lib/locale";

export default async function LoginPage() {
  const locale = await getLocaleFromCookies();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <AuthCard locale={locale} />
    </main>
  );
}
