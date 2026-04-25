import { AddRestaurantForm } from "@/components/add-restaurant-form";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { getDictionary } from "@/lib/i18n";
import { getActiveListForCurrentUser } from "@/lib/list-selection";
import { getLocaleFromCookies } from "@/lib/locale";

export default async function AddRestaurantPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
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

  return (
    <div className="space-y-6">
      <section className="shell-panel px-5 py-5 sm:px-8 sm:py-6">
        <SectionHeading eyebrow={dict.add.eyebrow} title={dict.add.title} description={dict.add.description} />
      </section>
      <AddRestaurantForm locale={locale} />
    </div>
  );
}
