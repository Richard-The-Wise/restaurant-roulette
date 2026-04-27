import { AuthCard } from "@/components/auth-card";
import { getLocaleFromCookies } from "@/lib/locale";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const resolvedSearchParams = await searchParams;
  const next = resolvedSearchParams.next ?? "/";

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <AuthCard locale={locale} next={next} />
    </main>
  );
}
