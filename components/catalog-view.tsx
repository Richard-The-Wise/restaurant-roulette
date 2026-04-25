"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Pencil, Search, Shuffle, Sparkles, Star, Utensils } from "lucide-react";

import { logVisitAction, toggleFavoriteAction } from "@/app/(app)/catalog/actions";
import { ActionSubmitButton } from "@/components/action-submit-button";
import { getDictionary, getSortOptions, type Locale } from "@/lib/i18n";
import { cn, formatDate, formatOpeningHours, formatPriceLevel, starsFromRating } from "@/lib/utils";
import type { Restaurant } from "@/types/domain";
import { isOpeningHoursPayload } from "@/types/domain";

type SortValue = ReturnType<typeof getSortOptions>[number]["value"];

interface CatalogViewProps {
  restaurants: Restaurant[];
  locale: Locale;
}

export function CatalogView({ restaurants, locale }: CatalogViewProps) {
  const dict = getDictionary(locale);
  const sortOptions = getSortOptions(locale);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cuisine, setCuisine] = useState("all");
  const [rating, setRating] = useState("all");
  const [priceLevel, setPriceLevel] = useState("all");
  const [favoriteFilter, setFavoriteFilter] = useState("all");
  const [visitFilter, setVisitFilter] = useState("all");
  const [sort, setSort] = useState<SortValue>("recent");

  const categories = Array.from(new Set(restaurants.map((restaurant) => restaurant.category))).sort();
  const cuisines = Array.from(new Set(restaurants.map((restaurant) => restaurant.cuisine_type).filter(Boolean) as string[])).sort();

  const filtered = restaurants
    .filter((restaurant) => {
      const matchesQuery =
        query.length === 0 ||
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = category === "all" || restaurant.category === category;
      const matchesCuisine = cuisine === "all" || restaurant.cuisine_type === cuisine;
      const matchesRating = rating === "all" || (restaurant.rating ?? 0) >= Number(rating);
      const matchesPrice = priceLevel === "all" || restaurant.price_level === Number(priceLevel);
      const matchesFavorite = favoriteFilter === "all" || (favoriteFilter === "favorite" && restaurant.is_favorite);
      const matchesVisit =
        visitFilter === "all" ||
        (visitFilter === "unvisited" && restaurant.visit_count === 0) ||
        (visitFilter === "visited" && restaurant.visit_count > 0);
      return matchesQuery && matchesCategory && matchesCuisine && matchesRating && matchesPrice && matchesFavorite && matchesVisit;
    })
    .sort((a, b) => {
      if (sort === "visited") return b.visit_count - a.visit_count;
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6">
      <section className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_repeat(6,minmax(0,1fr))]">
          <label className="block">
            <span className="label">{dict.catalog.search}</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="field pl-11"
                placeholder={dict.catalog.searchPlaceholder}
              />
            </div>
          </label>

          <label className="block">
            <span className="label">{dict.add.category}</span>
            <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">{dict.catalog.allCategories}</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label">{dict.add.cuisine}</span>
            <select className="field" value={cuisine} onChange={(event) => setCuisine(event.target.value)}>
              <option value="all">{dict.catalog.allCuisineTypes}</option>
              {cuisines.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label">{dict.catalog.minimumRating}</span>
            <select className="field" value={rating} onChange={(event) => setRating(event.target.value)}>
              <option value="all">{dict.catalog.anyRating}</option>
              <option value="4.5">4.5+</option>
              <option value="4">4.0+</option>
              <option value="3.5">3.5+</option>
            </select>
          </label>

          <label className="block">
            <span className="label">{dict.add.priceLevel}</span>
            <select className="field" value={priceLevel} onChange={(event) => setPriceLevel(event.target.value)}>
              <option value="all">{dict.catalog.allPriceLevels}</option>
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={String(level)}>
                  {"$".repeat(level)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label">{dict.catalog.favoritesFilter}</span>
            <select className="field" value={favoriteFilter} onChange={(event) => setFavoriteFilter(event.target.value)}>
              <option value="all">{dict.catalog.allFavorites}</option>
              <option value="favorite">{dict.catalog.favoritesOnly}</option>
            </select>
          </label>

          <label className="block">
            <span className="label">{dict.catalog.visitFilter}</span>
            <select className="field" value={visitFilter} onChange={(event) => setVisitFilter(event.target.value)}>
              <option value="all">{dict.catalog.allVisits}</option>
              <option value="unvisited">{dict.catalog.unvisitedOnly}</option>
              <option value="visited">{dict.catalog.visitedOnly}</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="block sm:min-w-[220px]">
            <span className="label">{dict.catalog.sortBy}</span>
            <select className="field" value={sort} onChange={(event) => setSort(event.target.value as SortValue)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-slate-500">
            {dict.catalog.showing} <span className="font-semibold text-slate-900">{filtered.length}</span> {dict.catalog.of}{" "}
            <span className="font-semibold text-slate-900">{restaurants.length}</span> {dict.catalog.restaurants}
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        {filtered.map((restaurant) => (
          <article key={restaurant.id} className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-950">{restaurant.name}</h2>
                  {restaurant.is_favorite ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-coral-100 px-3 py-1 text-xs font-medium text-coral-500">
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      {dict.catalog.favorite}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                  <span>{restaurant.category}</span>
                  {restaurant.cuisine_type ? <span>- {restaurant.cuisine_type}</span> : null}
                  <span>- {starsFromRating(restaurant.rating, locale)}</span>
                  <span>- {formatPriceLevel(restaurant.price_level, locale)}</span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                <Link
                  href={`/catalog/${restaurant.id}/edit`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                >
                  <Pencil className="h-4 w-4" />
                  {dict.catalog.edit}
                </Link>

                <form action={toggleFavoriteAction} className="w-full sm:w-auto">
                  <input type="hidden" name="restaurant_id" value={restaurant.id} />
                  <input type="hidden" name="favorite" value={String(restaurant.is_favorite)} />
                  <ActionSubmitButton
                    className={cn(
                      "w-full bg-white px-4 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 sm:w-auto",
                      restaurant.is_favorite && "bg-coral-500 text-white ring-coral-500 hover:bg-coral-500"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", restaurant.is_favorite && "fill-current")} />
                    {restaurant.is_favorite ? dict.catalog.favorited : dict.catalog.favorite}
                  </ActionSubmitButton>
                </form>

                <form action={logVisitAction} className="w-full sm:w-auto">
                  <input type="hidden" name="restaurant_id" value={restaurant.id} />
                  <input type="hidden" name="visit_count" value={restaurant.visit_count} />
                  <ActionSubmitButton className="w-full bg-aurora-600 hover:bg-aurora-700 sm:w-auto">
                    <Utensils className="h-4 w-4" />
                    {dict.catalog.logVisit}
                  </ActionSubmitButton>
                </form>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: dict.dashboard.visits, value: String(restaurant.visit_count), icon: <Shuffle className="h-4 w-4 text-aurora-600" /> },
                    { label: dict.add.rating, value: starsFromRating(restaurant.rating, locale), icon: <Star className="h-4 w-4 text-saffron-500" /> },
                    { label: dict.dashboard.lastVisited, value: formatDate(restaurant.last_visited, locale), icon: <Sparkles className="h-4 w-4 text-slate-500" /> },
                    { label: dict.catalog.added, value: formatDate(restaurant.created_at, locale), icon: <Search className="h-4 w-4 text-slate-500" /> }
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="mb-3 flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{item.label}</span>
                        {item.icon}
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                {restaurant.notes ? (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{dict.catalog.notes}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{restaurant.notes}</p>
                  </div>
                ) : null}

                {restaurant.tags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {restaurant.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-aurora-50 px-3 py-1.5 text-xs font-medium text-aurora-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{dict.add.openingHours}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {formatOpeningHours(isOpeningHoursPayload(restaurant.opening_hours) ? restaurant.opening_hours : null, locale).map(
                    (line) => (
                      <li key={line}>{line}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
