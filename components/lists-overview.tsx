"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightLeft, Check, Trash2 } from "lucide-react";

import { deleteListAction, importRestaurantsToListAction } from "@/app/(app)/lists/actions";
import { ActionSubmitButton } from "@/components/action-submit-button";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ListMembership, Restaurant, RestaurantList } from "@/types/domain";

interface ListsOverviewProps {
  locale: Locale;
  lists: RestaurantList[];
  memberships: ListMembership[];
  activeListId: string | null;
  membersCountByList: Record<string, number>;
  restaurants: Pick<Restaurant, "id" | "list_id" | "name" | "category" | "cuisine_type">[];
}

export function ListsOverview({
  locale,
  lists,
  memberships,
  activeListId,
  membersCountByList,
  restaurants
}: ListsOverviewProps) {
  const dict = getDictionary(locale);
  const [importTargetListId, setImportTargetListId] = useState<string | null>(null);
  const [sourceListId, setSourceListId] = useState<string>("");
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<string[]>([]);
  const importDialogRef = useRef<HTMLDialogElement | null>(null);

  const restaurantsByList = useMemo(
    () =>
      restaurants.reduce<Record<string, Pick<Restaurant, "id" | "list_id" | "name" | "category" | "cuisine_type">[]>>((acc, restaurant) => {
        acc[restaurant.list_id] = [...(acc[restaurant.list_id] ?? []), restaurant];
        return acc;
      }, {}),
    [restaurants]
  );

  const importTargetList = lists.find((list) => list.id === importTargetListId) ?? null;
  const sourceOptions = lists.filter((list) => list.id !== importTargetListId);
  const sourceRestaurants = sourceListId ? restaurantsByList[sourceListId] ?? [] : [];

  useEffect(() => {
    const dialog = importDialogRef.current;
    if (!dialog) {
      return;
    }

    if (importTargetListId) {
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [importTargetListId]);

  function openImportDialog(targetListId: string) {
    const firstSource = lists.find((list) => list.id !== targetListId)?.id ?? "";
    setImportTargetListId(targetListId);
    setSourceListId(firstSource);
    setSelectedRestaurantIds([]);
  }

  function toggleRestaurant(restaurantId: string) {
    setSelectedRestaurantIds((current) =>
      current.includes(restaurantId) ? current.filter((id) => id !== restaurantId) : [...current, restaurantId]
    );
  }

  function handleSourceListChange(nextSourceListId: string) {
    setSourceListId(nextSourceListId);
    setSelectedRestaurantIds([]);
  }

  return (
    <>
      <div className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{dict.lists.activeList}</h2>
        <div className="mt-5 grid gap-4">
          {lists.map((list) => {
            const membership = memberships.find((item) => item.list_id === list.id);
            const membersCount = membersCountByList[list.id] ?? 0;
            const isOwner = membership?.role === "owner";

            return (
              <article key={list.id} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{list.name}</h3>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                          {list.is_personal ? dict.lists.personalBadge : dict.lists.groupBadge}
                        </span>
                        {activeListId === list.id ? (
                          <span className="rounded-full bg-aurora-50 px-3 py-1 text-xs font-medium text-aurora-700 dark:bg-aurora-500/15 dark:text-aurora-200">
                            {dict.lists.activeList}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {membership ? (
                        <button
                          type="button"
                          onClick={() => openImportDialog(list.id)}
                          aria-label={dict.lists.importTitle}
                          title={dict.lists.importTitle}
                          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900"
                        >
                          <ArrowRightLeft className="h-[1.1rem] w-[1.1rem]" />
                        </button>
                      ) : null}

                      {isOwner && !list.is_personal ? (
                        <form action={deleteListAction} autoComplete="off" suppressHydrationWarning>
                          <input type="hidden" name="list_id" value={list.id} suppressHydrationWarning />
                          <ActionSubmitButton
                            ariaLabel={dict.lists.deleteList}
                            title={dict.lists.deleteList}
                            className="h-12 w-12 shrink-0 rounded-2xl bg-coral-500 px-0 shadow-sm hover:bg-coral-500"
                          >
                            <Trash2 className="h-[1.1rem] w-[1.1rem]" />
                          </ActionSubmitButton>
                        </form>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    {list.description ? <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{list.description}</p> : null}
                    <p className={list.description ? "mt-2 text-sm text-slate-500 dark:text-slate-400" : "text-sm text-slate-500 dark:text-slate-400"}>
                      {membersCount} {dict.lists.members} - {isOwner ? dict.lists.owner : dict.lists.member}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <dialog
        ref={importDialogRef}
        suppressHydrationWarning
        className={importTargetList ? "fixed inset-0 m-0 h-full w-full max-w-none border-0 bg-transparent p-0 text-left backdrop:bg-slate-950/35" : "hidden"}
        onClose={() => setImportTargetListId(null)}
        onCancel={() => setImportTargetListId(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setImportTargetListId(null);
          }
        }}
      >
        {importTargetList ? (
          <div className="flex min-h-full items-end justify-center sm:items-center">
            <div className="w-full max-w-2xl rounded-t-[28px] border border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl dark:border-slate-700 dark:bg-slate-950 sm:rounded-[28px] sm:p-6">
              <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{dict.lists.importTitle}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  {dict.lists.importDescription} <span className="font-semibold">{importTargetList.name}</span>
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {dict.lists.importSelectedCount.replace("{count}", String(selectedRestaurantIds.length))}
                </p>
              </div>

              <form
                action={importRestaurantsToListAction}
                autoComplete="off"
                suppressHydrationWarning
                onSubmit={() => setImportTargetListId(null)}
                className="space-y-4"
              >
                <input type="hidden" name="target_list_id" value={importTargetList.id} suppressHydrationWarning />

                <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <label className="block">
                    <span className="label">{dict.lists.importSourceList}</span>
                    <select
                      className="field"
                      value={sourceListId}
                      onChange={(event) => handleSourceListChange(event.target.value)}
                      autoComplete="off"
                      suppressHydrationWarning
                    >
                      {sourceOptions.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <span className="label">{dict.lists.importRestaurants}</span>
                    <div className="max-h-[42svh] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2 dark:border-slate-700">
                      {sourceRestaurants.length ? (
                        sourceRestaurants.map((restaurant) => {
                          const checked = selectedRestaurantIds.includes(restaurant.id);
                          return (
                            <label
                              key={restaurant.id}
                              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-900"
                            >
                              <input
                                type="checkbox"
                                name="restaurant_ids"
                                value={restaurant.id}
                                checked={checked}
                                onChange={() => toggleRestaurant(restaurant.id)}
                                autoComplete="off"
                                suppressHydrationWarning
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
                        <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-300">{dict.lists.importEmpty}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setImportTargetListId(null)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    {dict.roulette.manualPickerCancel}
                  </button>
                  <ActionSubmitButton className="bg-aurora-600 hover:bg-aurora-700" disabled={!selectedRestaurantIds.length}>
                    {dict.lists.importButton}
                  </ActionSubmitButton>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
