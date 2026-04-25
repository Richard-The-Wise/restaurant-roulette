"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MapPinned, Sparkles } from "lucide-react";

import { cn, formatPriceLevel, starsFromRating } from "@/lib/utils";
import { getDictionary, getRouletteFilters, type Locale } from "@/lib/i18n";
import type { Restaurant } from "@/types/domain";

const wheelColors = ["#13B38B", "#F6BF3E", "#E76F51", "#0F172A", "#30A7D7", "#0A8A6D"];
const SPIN_DURATION_MS = 4200;

type FilterMode = ReturnType<typeof getRouletteFilters>[number]["value"];

interface RouletteWheelProps {
  restaurants: Restaurant[];
  locale: Locale;
}

function getRoulettePool(restaurants: Restaurant[], filter: FilterMode) {
  if (filter === "unvisited") {
    return restaurants.filter((restaurant) => restaurant.visit_count === 0);
  }

  if (filter === "frequent") {
    return [...restaurants]
      .filter((restaurant) => restaurant.visit_count > 0)
      .sort((a, b) => b.visit_count - a.visit_count)
      .slice(0, 6);
  }

  return restaurants;
}

export function RouletteWheel({ restaurants, locale }: RouletteWheelProps) {
  const dict = getDictionary(locale);
  const filters = getRouletteFilters(locale);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [rotation, setRotation] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const pool = useMemo(() => getRoulettePool(restaurants, filter), [filter, restaurants]);
  const selectedRestaurant = pool.find((restaurant) => restaurant.id === selectedId) ?? null;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  function handleFilterChange(nextFilter: FilterMode) {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setFilter(nextFilter);
    setSelectedId(null);
    setIsSpinning(false);
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_340px]">
      <section className="surface-panel overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
        <div className="relative z-10 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="pointer-events-none relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[520px] lg:max-w-[620px]">
            <div className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 flex-col items-center">
              <div className="h-7 w-7 rounded-full border-4 border-white bg-slate-950 shadow-soft dark:border-slate-950 dark:bg-white" />
              <div className="h-0 w-0 border-x-[18px] border-b-[32px] border-x-transparent border-b-slate-950 dark:border-b-white" />
            </div>

            <div
              className="relative mt-6 aspect-square w-full rounded-full border-[14px] border-white shadow-panel dark:border-slate-950"
              style={{
                background: gradient,
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.15, 0.7, 0.2, 1)` : "none"
              }}
            >
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-8 border-white bg-slate-950 text-center text-sm font-semibold text-white shadow-soft dark:border-slate-950 dark:bg-white dark:text-slate-950 sm:h-28 sm:w-28">
                {isSpinning ? "..." : "Spin"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative z-10 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{dict.roulette.currentPool}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{pool.length}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {filter === "all" ? dict.roulette.allPool : filter === "unvisited" ? dict.roulette.unvisitedPool : dict.roulette.frequentPool}
              </p>
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

      <aside className="grid gap-6">
        <section className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{dict.roulette.howItWorks}</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>{dict.roulette.how1}</p>
            <p>{dict.roulette.how2}</p>
            <p>{dict.roulette.how3}</p>
          </div>
        </section>

        <section className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{dict.roulette.bestUseCases}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {dict.roulette.useCases.map((item) => (
              <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
