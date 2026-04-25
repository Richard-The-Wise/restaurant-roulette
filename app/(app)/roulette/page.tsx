import { EmptyState } from "@/components/empty-state";
import { RouletteWheel } from "@/components/roulette-wheel";
import { SectionHeading } from "@/components/section-heading";
import { getDictionary } from "@/lib/i18n";
import { getActiveListForCurrentUser } from "@/lib/list-selection";
import { getLocaleFromCookies } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

export default async function RoulettePage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const { activeList } = await getActiveListForCurrentUser();

  if (!activeList) {
    return (
      <EmptyState
        title={dict.lists.title}
        description={dict.lists.description}
        ctaHref="/lists"
        ctaLabel={dict.nav.lists}
      />
    );
  }

  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("list_id", activeList.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <section className="shell-panel px-5 py-5 sm:px-8 sm:py-6">
        <SectionHeading eyebrow={dict.roulette.eyebrow} title={dict.roulette.title} description={dict.roulette.description} />
      </section>

      {restaurants?.length ? (
        <RouletteWheel restaurants={restaurants} locale={locale} />
      ) : (
        <EmptyState
          title={dict.roulette.emptyTitle}
          description={dict.roulette.emptyDescription}
          ctaHref="/add"
          ctaLabel={dict.common.addRestaurants}
        />
      )}
    </div>
  );
}
