"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, MapPinned, Sparkles } from "lucide-react";

import { cn, formatPriceLevel, starsFromRating } from "@/lib/utils";
import { RestaurantPhoto } from "@/components/restaurant-photo";
import { getDictionary, getRouletteFilters, type Locale } from "@/lib/i18n";
import type { Restaurant, RestaurantList } from "@/types/domain";

const wheelColors = ["#13B38B", "#F6BF3E", "#E76F51", "#0F172A", "#30A7D7", "#0A8A6D"];
const SPIN_DURATION_MS = 4200;

type FilterMode = ReturnType<typeof getRouletteFilters>[number]["value"];

interface RouletteWheelProps {
  restaurants: Restaurant[];
  allRestaurants: Restaurant[];
  lists: RestaurantList[];
  activeListId: string;
  locale: Locale;
}

function getRoulettePool(
  restaurants: Restaurant[],
  filter: FilterMode,
  selectedCategory: string,
  manualRestaurantIds: string[]
) {
  if (filter === "unvisited") {
    return restaurants.filter((restaurant) => restaurant.visit_count === 0);
  }

  if (filter === "favorites") {
    return restaurants.filter((restaurant) => restaurant.is_favorite);
  }

  if (filter === "category") {
    return selectedCategory ? restaurants.filter((restaurant) => restaurant.category === selectedCategory) : [];
  }

  if (filter === "manual") {
    return restaurants.filter((restaurant) => manualRestaurantIds.includes(restaurant.id));
  }

  return restaurants;
}

export function RouletteWheel({ restaurants, allRestaurants, lists, activeListId, locale }: RouletteWheelProps) {
  const dict = getDictionary(locale);
  const filters = getRouletteFilters(locale);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [rotation, setRotation] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [manualListId, setManualListId] = useState(activeListId);
  const [manualRestaurantIds, setManualRestaurantIds] = useState<string[]>([]);
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const manualPickerRef = useRef<HTMLDialogElement | null>(null);

  const categories = useMemo(() => Array.from(new Set(restaurants.map((restaurant) => restaurant.category))).sort(), [restaurants]);
  const restaurantsByList = useMemo(
    () =>
      allRestaurants.reduce<Record<string, Restaurant[]>>((acc, restaurant) => {
        acc[restaurant.list_id] = [...(acc[restaurant.list_id] ?? []), restaurant];
        return acc;
      }, {}),
    [allRestaurants]
  );

  const manualListRestaurants = restaurantsByList[manualListId] ?? [];
  const manualPool = allRestaurants.filter((restaurant) => manualRestaurantIds.includes(restaurant.id));
  const poolSource = filter === "manual" ? allRestaurants : restaurants;
  const pool = useMemo(
    () => getRoulettePool(poolSource, filter, selectedCategory, manualRestaurantIds),
    [filter, manualRestaurantIds, poolSource, selectedCategory]
  );
  const selectedRestaurant = pool.find((restaurant) => restaurant.id === selectedId) ?? null;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const dialog = manualPickerRef.current;
    if (!dialog) {
      return;
    }

    if (isManualPickerOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [isManualPickerOpen]);

  const gradient = useMemo(() => {
    if (!pool.length) {
      return "conic-gradient(from -90deg, #cbd5e1 0deg, #e2e8f0 360deg)";
    }

    const angle = 360 / pool.length;
    const stops = pool.map((_, index) => {
      const start = index * angle;
      const end = (index + 1) * angle;
      const color = wheelColors[index % wheelColors.length];
      return `${color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(from -90deg, ${stops.join(", ")})`;
  }, [pool]);

  const currentPoolDescription =
    filter === "all"
      ? dict.roulette.allPool
      : filter === "unvisited"
        ? dict.roulette.unvisitedPool
        : filter === "favorites"
          ? dict.roulette.favoritesPool
          : filter === "category"
            ? selectedCategory
              ? dict.roulette.categoryPool.replace("{category}", selectedCategory)
              : dict.roulette.categoryPoolEmpty
            : manualPool.length
              ? dict.roulette.manualPool.replace("{count}", String(manualPool.length))
              : dict.roulette.manualPoolEmpty;

  function resetSpinState() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setSelectedId(null);
    setIsSpinning(false);
  }

  function handleFilterChange(nextFilter: FilterMode) {
    resetSpinState();
    setFilter(nextFilter);

    if (nextFilter === "category" && !selectedCategory) {
      setSelectedCategory(categories[0] ?? "");
    }

    if (nextFilter === "manual") {
      setIsManualPickerOpen(true);
    }
  }

  function handleManualListChange(nextListId: string) {
    setManualListId(nextListId);
  }

  function toggleManualRestaurant(restaurantId: string) {
    setManualRestaurantIds((current) =>
      current.includes(restaurantId) ? current.filter((id) => id !== restaurantId) : [...current, restaurantId]
    );
  }

  function applyManualSelection() {
    setFilter("manual");
    setSelectedId(null);
    setIsManualPickerOpen(false);
  }

  function spin() {
    if (!pool.length || isSpinning) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    const angle = 360 / pool.length;
    const winnerIndex = Math.floor(Math.random() * pool.length);
    const winner = pool[winnerIndex];
    const segmentCenter = winnerIndex * angle + angle / 2;
    const normalizedOffset = (0 - segmentCenter + 360) % 360;
    const nextRotation = rotation + 360 * 8 + normalizedOffset;

    setIsSpinning(true);
    setSelectedId(null);
    setRotation(nextRotation);

    timeoutRef.current = window.setTimeout(() => {
      setSelectedId(winner.id);
      setIsSpinning(false);
      timeoutRef.current = null;
    }, SPIN_DURATION_MS);
  }

  return (
    <div className="grid gap-6">
      <section className="surface-panel overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
        <div className="relative z-10 mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{dict.roulette.spinTitle}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{dict.roulette.spinDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFilterChange(option.value)}
                  className={cn(
                    "touch-manipulation relative z-10 rounded-full px-4 py-2 text-sm",
                    filter === option.value
                      ? "bg-ink font-semibold text-white dark:bg-aurora-600"
                      : "border border-slate-200 bg-white font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {filter === "category" ? (
              <label className="block min-w-[220px]">
                <span className="label">{dict.roulette.categoryLabel}</span>
                <select
                  className="field"
                  value={selectedCategory}
                  onChange={(event) => {
                    resetSpinState();
                    setSelectedCategory(event.target.value);
                  }}
                >
                  <option value="">{dict.roulette.categoryPlaceholder}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {filter === "manual" ? (
              <button
                type="button"
                onClick={() => setIsManualPickerOpen(true)}
                className="touch-manipulation inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {dict.roulette.manualPickerButton}
                {manualPool.length ? (
                  <span className="ml-2 rounded-full bg-aurora-100 px-2 py-0.5 text-xs font-semibold text-aurora-700 dark:bg-aurora-500/15 dark:text-aurora-200">
                    {manualPool.length}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="relative mx-auto w-full max-w-[340px] overflow-visible sm:max-w-[520px] lg:max-w-[620px]">
            <div className="pointer-events-none absolute left-1/2 top-0 z-40 -translate-x-1/2">
              <svg
                aria-hidden="true"
                viewBox="0 0 36 32"
                className="block h-8 w-9 drop-shadow-[0_10px_18px_rgba(15,23,42,0.22)]"
              >
                <path d="M18 32L0 0H36L18 32Z" fill="#ef4444" />
              </svg>
            </div>

            <div className="relative mt-8 aspect-square w-full">
              <div
                className="pointer-events-none absolute inset-0 rounded-full border-[14px] border-white shadow-panel dark:border-slate-950"
                style={{
                  background: gradient,
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.15, 0.7, 0.2, 1)` : "none"
                }}
              />
              <button
                type="button"
                onClick={spin}
                disabled={!pool.length || isSpinning}
                className="touch-manipulation absolute left-1/2 top-1/2 z-30 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-8 border-white bg-slate-950 text-center text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed dark:border-slate-950 dark:bg-white dark:text-slate-950 sm:h-28 sm:w-28"
              >
                {isSpinning ? "..." : "Spin"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative z-10 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{dict.roulette.currentPool}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{pool.length}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{currentPoolDescription}</p>
            </div>

            <button
              type="button"
              onClick={spin}
              disabled={!pool.length || isSpinning}
              className="touch-manipulation relative z-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-aurora-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-aurora-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {isSpinning ? dict.roulette.spinning : dict.roulette.spinButton}
            </button>

            <div className="relative z-10 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{dict.roulette.selectedRestaurant}</p>
              {selectedRestaurant ? (
                <div className="mt-4 space-y-4">
                  <RestaurantPhoto
                    restaurant={selectedRestaurant}
                    alt={selectedRestaurant.name}
                    className="aspect-[16/10] w-full rounded-3xl"
                  />
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{selectedRestaurant.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      {selectedRestaurant.category}
                      {selectedRestaurant.cuisine_type ? ` - ${selectedRestaurant.cuisine_type}` : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      {dict.add.rating}
                      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{starsFromRating(selectedRestaurant.rating, locale)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      {dict.add.priceLevel}
                      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{formatPriceLevel(selectedRestaurant.price_level, locale)}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {dict.roulette.visitsSoFar}: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedRestaurant.visit_count}</span>
                  </p>
                  {selectedRestaurant.google_maps_url ? (
                    <a
                      href={selectedRestaurant.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-aurora-600"
                    >
                      <MapPinned className="h-4 w-4" />
                      {dict.roulette.openInMaps}
                    </a>
                  ) : null}
                  {selectedRestaurant.notes ? (
                    <p className="rounded-2xl bg-aurora-50 px-4 py-3 text-sm leading-6 text-aurora-700">{selectedRestaurant.notes}</p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                  <p>{dict.roulette.selectedPlaceholder}</p>
                  <div className="inline-flex items-center gap-2 text-aurora-700">
                    <ArrowRight className="h-4 w-4" />
                    {dict.roulette.selectedHint}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <dialog
        ref={manualPickerRef}
        suppressHydrationWarning
        className={cn(
          "fixed inset-0 m-0 h-full w-full max-w-none border-0 bg-transparent p-0 text-left backdrop:bg-slate-950/35",
          isManualPickerOpen ? "flex items-end justify-center sm:items-center" : "hidden"
        )}
        onClose={() => setIsManualPickerOpen(false)}
        onCancel={() => setIsManualPickerOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsManualPickerOpen(false);
          }
        }}
      >
        <div className="w-full max-w-2xl rounded-t-[28px] border border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl dark:border-slate-700 dark:bg-slate-950 sm:rounded-[28px] sm:p-6">
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{dict.roulette.manualPickerTitle}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{dict.roulette.manualPickerDescription}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              {dict.roulette.manualSelectionCount.replace("{count}", String(manualPool.length))}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
            <label className="block">
              <span className="label">{dict.roulette.listLabel}</span>
              <select
                suppressHydrationWarning
                autoComplete="off"
                className="field"
                value={manualListId}
                onChange={(event) => handleManualListChange(event.target.value)}
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="label">{dict.roulette.restaurantLabel}</span>
              <div className="max-h-[42svh] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2 dark:border-slate-700">
                {manualListRestaurants.length ? (
                  manualListRestaurants.map((restaurant) => {
                    const checked = manualRestaurantIds.includes(restaurant.id);
                    return (
                      <label
                        key={restaurant.id}
                        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <input
                          type="checkbox"
                          suppressHydrationWarning
                          autoComplete="off"
                          checked={checked}
                          onChange={() => toggleManualRestaurant(restaurant.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-aurora-600 focus:ring-aurora-500"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{restaurant.name}</p>
                            {checked ? <Check className="h-4 w-4 text-aurora-600" /> : null}
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                            {restaurant.category}
                            {restaurant.cuisine_type ? ` - ${restaurant.cuisine_type}` : ""}
                          </p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-300">{dict.roulette.manualPickerEmpty}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsManualPickerOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              {dict.roulette.manualPickerCancel}
            </button>
            <button
              type="button"
              onClick={applyManualSelection}
              className="inline-flex items-center justify-center rounded-2xl bg-aurora-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-aurora-700"
            >
              {dict.roulette.manualPickerApply}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
