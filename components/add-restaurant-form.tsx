"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Sparkles, WandSparkles } from "lucide-react";

import { createRestaurantAction } from "@/app/(app)/add/actions";
import { updateRestaurantAction } from "@/app/(app)/catalog/actions";
import { ActionSubmitButton } from "@/components/action-submit-button";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { FormState, PlaceLookupResult, Restaurant } from "@/types/domain";

const initialState: FormState = { status: "idle" };

interface DraftState {
  google_place_id: string;
  google_maps_url: string;
  name: string;
  category: string;
  cuisine_type: string;
  opening_hours: string;
  rating: string;
  price_level: string;
  visit_count: string;
  last_visited: string;
  notes: string;
  tags: string;
  is_favorite: boolean;
}

const defaultDraft: DraftState = {
  google_place_id: "",
  google_maps_url: "",
  name: "",
  category: "",
  cuisine_type: "",
  opening_hours: "",
  rating: "",
  price_level: "",
  visit_count: "0",
  last_visited: "",
  notes: "",
  tags: "",
  is_favorite: false
};

function toDraft(place: PlaceLookupResult): DraftState {
  return {
    ...defaultDraft,
    google_place_id: place.googlePlaceId,
    google_maps_url: place.googleMapsUrl ?? "",
    name: place.name,
    category: place.category,
    cuisine_type: place.cuisineType ?? "",
    opening_hours: place.openingHours?.weekdayDescriptions.join("\n") ?? "",
    rating: place.rating ? String(place.rating) : "",
    price_level: place.priceLevel ? String(place.priceLevel) : "",
    visit_count: "0",
    last_visited: "",
    notes: "",
    tags: "",
    is_favorite: false
  };
}

function restaurantToDraft(restaurant: Restaurant): DraftState {
  return {
    google_place_id: restaurant.google_place_id ?? "",
    google_maps_url: restaurant.google_maps_url ?? "",
    name: restaurant.name,
    category: restaurant.category,
    cuisine_type: restaurant.cuisine_type ?? "",
    opening_hours:
      restaurant.opening_hours && typeof restaurant.opening_hours === "object" && !Array.isArray(restaurant.opening_hours)
        ? (((restaurant.opening_hours as { weekdayDescriptions?: string[] }).weekdayDescriptions ?? []).join("\n"))
        : "",
    rating: restaurant.rating ? String(restaurant.rating) : "",
    price_level: restaurant.price_level ? String(restaurant.price_level) : "",
    visit_count: String(restaurant.visit_count),
    last_visited: restaurant.last_visited ? restaurant.last_visited.slice(0, 10) : "",
    notes: restaurant.notes ?? "",
    tags: restaurant.tags.join(", "),
    is_favorite: restaurant.is_favorite
  };
}

interface AddRestaurantFormProps {
  locale: Locale;
  mode?: "create" | "edit";
  restaurant?: Restaurant;
}

export function AddRestaurantForm({ locale, mode = "create", restaurant }: AddRestaurantFormProps) {
  const dict = getDictionary(locale);
  const action = mode === "edit" ? updateRestaurantAction : createRestaurantAction;
  const [lookupInput, setLookupInput] = useState("");
  const [draft, setDraft] = useState<DraftState>(restaurant ? restaurantToDraft(restaurant) : defaultDraft);
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [state, formAction] = useActionState(action, initialState);

  async function handleLookup() {
    setLookupLoading(true);
    setLookupError("");

    try {
      const response = await fetch("/api/places/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: lookupInput })
      });

      const data = (await response.json()) as { error?: string; place?: PlaceLookupResult };
      if (!response.ok || !data.place) {
        throw new Error(data.error ?? dict.formMessages.placeLookupFailed);
      }
      const place = data.place;

      setDraft((current) => ({
        ...current,
        ...toDraft(place)
      }));
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : dict.formMessages.placeLookupFailed);
    } finally {
      setLookupLoading(false);
    }
  }

  function updateField<K extends keyof DraftState>(field: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form action={formAction} className="surface-panel space-y-6 px-5 py-5 sm:px-6 sm:py-6" autoComplete="off" suppressHydrationWarning>
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <WandSparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{dict.add.prefillTitle}</h2>
              <p className="text-sm text-slate-300">{dict.add.prefillDescription}</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={lookupInput}
              onChange={(event) => setLookupInput(event.target.value)}
              className="field border-white/10 bg-white/95 text-slate-900"
              placeholder="https://maps.google.com/... or ChIJ..."
              autoComplete="off"
              suppressHydrationWarning
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={lookupLoading || lookupInput.trim().length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-aurora-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-aurora-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {lookupLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {dict.add.prefillButton}
            </button>
          </div>
          {lookupError ? <p className="text-sm text-red-200">{lookupError}</p> : null}
        </div>

        <input type="hidden" name="google_place_id" value={draft.google_place_id} readOnly suppressHydrationWarning />
        <input type="hidden" name="google_maps_url" value={draft.google_maps_url} readOnly suppressHydrationWarning />
        {mode === "edit" && restaurant ? <input type="hidden" name="restaurant_id" value={restaurant.id} readOnly suppressHydrationWarning /> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">
              {dict.add.name}
            </label>
            <input
              id="name"
              name="name"
              className="field"
              value={draft.name}
              onChange={(event) => updateField("name", event.target.value)}
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="label" htmlFor="category">
              {dict.add.category}
            </label>
            <input
              id="category"
              name="category"
              className="field"
              value={draft.category}
              onChange={(event) => updateField("category", event.target.value)}
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="label" htmlFor="cuisine_type">
              {dict.add.cuisine}
            </label>
            <input
              id="cuisine_type"
              name="cuisine_type"
              className="field"
              value={draft.cuisine_type}
              onChange={(event) => updateField("cuisine_type", event.target.value)}
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="label" htmlFor="price_level">
              {dict.add.priceLevel}
            </label>
            <select
              id="price_level"
              name="price_level"
              className="field"
              value={draft.price_level}
              onChange={(event) => updateField("price_level", event.target.value)}
              autoComplete="off"
              suppressHydrationWarning
            >
              <option value="">{dict.add.selectPriceLevel}</option>
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={String(level)}>
                  {"$".repeat(level)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="rating">
              {dict.add.rating}
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              className="field"
              value={draft.rating}
              onChange={(event) => updateField("rating", event.target.value)}
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="label" htmlFor="visit_count">
              {dict.add.visitCount}
            </label>
            <input
              id="visit_count"
              name="visit_count"
              type="number"
              min="0"
              className="field"
              value={draft.visit_count}
              onChange={(event) => updateField("visit_count", event.target.value)}
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="label" htmlFor="last_visited">
              {dict.add.lastVisited}
            </label>
            <input
              id="last_visited"
              name="last_visited"
              type="date"
              className="field"
              value={draft.last_visited}
              onChange={(event) => updateField("last_visited", event.target.value)}
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="label" htmlFor="tags">
              {dict.add.tags}
            </label>
            <input
              id="tags"
              name="tags"
              className="field"
              placeholder={dict.add.tagsPlaceholder}
              value={draft.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="opening_hours">
            {dict.add.openingHours}
          </label>
          <textarea
            id="opening_hours"
            name="opening_hours"
            className="field min-h-36 resize-y"
            value={draft.opening_hours}
            onChange={(event) => updateField("opening_hours", event.target.value)}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>

        <div>
          <label className="label" htmlFor="notes">
            {dict.add.notes}
          </label>
          <textarea
            id="notes"
            name="notes"
            className="field min-h-28 resize-y"
            placeholder={dict.add.notesPlaceholder}
            value={draft.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            name="is_favorite"
            type="checkbox"
            checked={draft.is_favorite}
            onChange={(event) => updateField("is_favorite", event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-aurora-600 focus:ring-aurora-500"
            autoComplete="off"
            suppressHydrationWarning
          />
          {dict.add.favorite}
        </label>

        {state.status === "error" && state.message ? (
          <p className="rounded-2xl bg-coral-100 px-4 py-3 text-sm text-coral-500">{state.message}</p>
        ) : null}

        <ActionSubmitButton>{mode === "edit" ? dict.common.updateRestaurant : dict.common.saveRestaurant}</ActionSubmitButton>
      </form>

      <aside className="grid gap-6">
        <section className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
          <h2 className="text-lg font-semibold text-slate-950">{dict.add.sidebarStoredTitle}</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>{dict.add.sidebarStored1}</p>
            <p>{dict.add.sidebarStored2}</p>
            <p>{dict.add.sidebarStored3}</p>
          </div>
        </section>

        <section className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
          <h2 className="text-lg font-semibold text-slate-950">{dict.add.sidebarFlowTitle}</h2>
          <div className="mt-4 space-y-4">
            {dict.add.flow.map((item, index) => (
              <div key={item} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
