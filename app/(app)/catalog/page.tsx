import { CatalogView } from "@/components/catalog-view";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { getDictionary } from "@/lib/i18n";
import { getActiveListForCurrentUser } from "@/lib/list-selection";
import { getLocaleFromCookies } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogPage() {
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
        <SectionHeading eyebrow={dict.catalog.eyebrow} title={dict.catalog.title} description={dict.catalog.description} />
      </section>

      {restaurants?.length ? (
        <CatalogView restaurants={restaurants} locale={locale} />
      ) : (
        <EmptyState
          title={dict.catalog.emptyTitle}
          description={dict.catalog.emptyDescription}
          ctaHref="/add"
          ctaLabel={dict.common.addRestaurant}
        />
      )}
    </div>
  );
}
