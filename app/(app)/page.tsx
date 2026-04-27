import Link from "next/link";
import { ArrowRight, Heart, RefreshCcw, Star, Tags } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n";
import { getActiveListForCurrentUser } from "@/lib/list-selection";
import { getLocaleFromCookies } from "@/lib/locale";
import { formatDate, formatPriceLevel, starsFromRating } from "@/lib/utils";
import { isOpeningHoursPayload } from "@/types/domain";

export default async function DashboardPage() {
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

  if (!restaurants?.length) {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow={dict.dashboard.emptyEyebrow}
          title={dict.dashboard.emptyTitle}
          description={dict.dashboard.emptyDescription}
        />
        <EmptyState
          title={dict.dashboard.emptyStateTitle}
          description={dict.dashboard.emptyStateDescription}
          ctaHref="/add"
          ctaLabel={dict.dashboard.emptyStateCta}
        />
      </div>
    );
  }

  const total = restaurants.length;
  const favorites = restaurants.filter((restaurant) => restaurant.is_favorite).length;
  const unvisited = restaurants.filter((restaurant) => restaurant.visit_count === 0).length;
  const averageRating =
    restaurants.filter((restaurant) => restaurant.rating).reduce((sum, restaurant) => sum + (restaurant.rating ?? 0), 0) /
    Math.max(1, restaurants.filter((restaurant) => restaurant.rating).length);

  const recentlyVisited = [...restaurants]
    .filter((restaurant) => restaurant.last_visited)
    .sort((a, b) => new Date(b.last_visited!).getTime() - new Date(a.last_visited!).getTime())
    .slice(0, 4);

  const topTags = restaurants
    .flatMap((restaurant) => restaurant.tags)
    .reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {});

  const topTagEntries = Object.entries(topTags).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="shell-panel overflow-hidden px-5 py-5 sm:px-8 sm:py-6">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <SectionHeading eyebrow={dict.dashboard.eyebrow} title={dict.dashboard.title} description={dict.dashboard.description} />
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{dict.dashboard.quickSnapshot}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {[
                [`${total}`, dict.dashboard.savedPlaces],
                [`${unvisited}`, dict.dashboard.unvisitedOptions],
                [`${favorites}`, dict.dashboard.favorites],
                [averageRating ? averageRating.toFixed(1) : "0.0", dict.dashboard.averageRating]
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{dict.dashboard.recentAdditions}</h2>
              <p className="mt-1 text-sm text-slate-500">{dict.dashboard.newestIdeas}</p>
            </div>
            <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-aurora-700">
              {dict.common.viewCatalog}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {restaurants.slice(0, 4).map((restaurant) => (
              <article key={restaurant.id} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{restaurant.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {restaurant.category}
                      {restaurant.cuisine_type ? ` - ${restaurant.cuisine_type}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{starsFromRating(restaurant.rating, locale)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{formatPriceLevel(restaurant.price_level, locale)}</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <p>
                    {dict.dashboard.visits}: {restaurant.visit_count}
                  </p>
                  <p>
                    {dict.dashboard.lastVisited}: {formatDate(restaurant.last_visited, locale)}
                  </p>
                </div>
                {isOpeningHoursPayload(restaurant.opening_hours) ? (
                  <p className="mt-4 text-sm text-slate-500">{restaurant.opening_hours.weekdayDescriptions[0]}</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-6 content-start">
          <section className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Tags className="h-4 w-4 text-aurora-600" />
              {dict.dashboard.popularTags}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {topTagEntries.length ? (
                topTagEntries.map(([tag, count]) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {tag} - {count}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">{dict.dashboard.addTagsHint}</p>
              )}
            </div>

            {topTagEntries.length ? (
              <p className="mt-4 text-sm text-slate-500">{dict.dashboard.addTagsHint}</p>
            ) : null}
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-saffron-100 p-3 text-saffron-500">
              <RefreshCcw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{dict.dashboard.recentVisits}</h2>
              <p className="text-sm text-slate-500">{dict.dashboard.recentVisitsDescription}</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {recentlyVisited.length ? (
              recentlyVisited.map((restaurant) => (
                <div key={restaurant.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{restaurant.name}</h3>
                      <p className="text-sm text-slate-500">{formatDate(restaurant.last_visited, locale)}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {restaurant.visit_count} {dict.dashboard.visits.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">{dict.dashboard.recentVisitsEmpty}</p>
            )}
          </div>
        </div>

        <div className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-coral-100 p-3 text-coral-500">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{dict.dashboard.favoritePicks}</h2>
              <p className="text-sm text-slate-500">{dict.dashboard.favoritePicksDescription}</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {restaurants
              .filter((restaurant) => restaurant.is_favorite)
              .slice(0, 4)
              .map((restaurant) => (
                <div key={restaurant.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{restaurant.name}</h3>
                      <p className="text-sm text-slate-500">
                        {restaurant.category}
                        {restaurant.cuisine_type ? ` - ${restaurant.cuisine_type}` : ""}
                      </p>
                    </div>
                    <Star className="h-4 w-4 fill-saffron-400 text-saffron-400" />
                  </div>
                </div>
              ))}
            {!restaurants.some((restaurant) => restaurant.is_favorite) ? (
              <p className="text-sm text-slate-500">{dict.dashboard.favoritePicksEmpty}</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
