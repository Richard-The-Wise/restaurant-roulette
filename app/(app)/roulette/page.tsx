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
  const { activeList, lists } = await getActiveListForCurrentUser();

  if (!activeList || !lists.length) {
    return (
      <EmptyState
        title={dict.lists.title}
        description={dict.lists.description}
        ctaHref="/lists"
        ctaLabel={dict.nav.lists}
      />
    );
  }

  const listIds = lists.map((list) => list.id);

  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*")
    .in("list_id", listIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const activeListRestaurants = restaurants?.filter((restaurant) => restaurant.list_id === activeList.id) ?? [];

  return (
    <div className="space-y-6">
      <section className="shell-panel px-5 py-5 sm:px-8 sm:py-6">
        <SectionHeading eyebrow={dict.roulette.eyebrow} title={dict.roulette.title} description={dict.roulette.description} />
      </section>

      {activeListRestaurants.length ? (
        <RouletteWheel
          restaurants={activeListRestaurants}
          allRestaurants={restaurants ?? []}
          lists={lists}
          activeListId={activeList.id}
          locale={locale}
        />
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
