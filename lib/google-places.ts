import { z } from "zod";

import { titleCase } from "@/lib/utils";
import type { OpeningHoursPayload, PlaceLookupResult } from "@/types/domain";

const lookupSchema = z.object({
  input: z.string().min(2)
});

const PLACE_ID_PATTERN = /^(ChI|Ei|GhI|Iho|Eic)[A-Za-z0-9_-]+$/;

const typeCuisineMap: Record<string, string> = {
  pizza_restaurant: "Pizza",
  sushi_restaurant: "Sushi",
  italian_restaurant: "Italian",
  mexican_restaurant: "Mexican",
  chinese_restaurant: "Chinese",
  japanese_restaurant: "Japanese",
  indian_restaurant: "Indian",
  thai_restaurant: "Thai",
  korean_restaurant: "Korean",
  mediterranean_restaurant: "Mediterranean",
  seafood_restaurant: "Seafood",
  steak_house: "Steakhouse",
  hamburger_restaurant: "Burgers",
  breakfast_restaurant: "Breakfast",
  brunch_restaurant: "Brunch",
  cafe: "Cafe",
  coffee_shop: "Coffee",
  bakery: "Bakery"
};

function mapPriceLevel(value: unknown) {
  if (typeof value === "number") {
    return Math.max(1, Math.min(5, value));
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.toUpperCase();
  if (normalized.includes("FREE")) return 1;
  if (normalized.includes("INEXPENSIVE")) return 2;
  if (normalized.includes("MODERATE")) return 3;
  if (normalized.includes("VERY_EXPENSIVE")) return 5;
  if (normalized.includes("EXPENSIVE")) return 4;
  return null;
}

function extractQueryFromMapsUrl(value: string) {
  try {
    const url = new URL(value);
    const placeId = url.searchParams.get("query_place_id") || url.searchParams.get("place_id");
    if (placeId) {
      return { placeId, textQuery: null };
    }

    const q = url.searchParams.get("q") || url.searchParams.get("query");
    if (q?.includes("place_id:")) {
      const placeIdFromQuery = q.split("place_id:")[1]?.trim();
      if (placeIdFromQuery) {
        return { placeId: placeIdFromQuery, textQuery: null };
      }
    }

    if (q) {
      return { placeId: null, textQuery: q };
    }

    const placePathMatch = decodeURIComponent(url.pathname).match(/\/place\/([^/]+)/i);
    if (placePathMatch?.[1]) {
      return { placeId: null, textQuery: placePathMatch[1].replaceAll("+", " ") };
    }
  } catch {
    return null;
  }

  return null;
}

async function googleFetch<T>(input: RequestInfo, init: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places lookup failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

async function searchPlaceId(textQuery: string, apiKey: string) {
  const payload = await googleFetch<{
    places?: Array<{ id: string }>;
  }>("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id"
    },
    body: JSON.stringify({
      textQuery,
      includedType: "restaurant"
    })
  });

  return payload.places?.[0]?.id ?? null;
}

function deriveCuisine(types: string[] | undefined, fallback: string | null) {
  const matched = types?.find((type) => typeCuisineMap[type]);
  if (matched) {
    return typeCuisineMap[matched];
  }

  if (fallback) {
    return fallback;
  }

  const secondary = types?.find((type) => type.endsWith("_restaurant") || type === "cafe");
  return secondary ? titleCase(secondary.replace("_restaurant", "").replaceAll("_", " ")) : null;
}

function normalizeOpeningHours(raw: {
  weekdayDescriptions?: string[];
  weekday_text?: string[];
} | null): OpeningHoursPayload | null {
  const descriptions = raw?.weekdayDescriptions ?? raw?.weekday_text ?? [];
  if (!descriptions.length) {
    return null;
  }

  return {
    weekdayDescriptions: descriptions
  };
}

export async function lookupRestaurantPlace(rawInput: string, apiKey: string): Promise<PlaceLookupResult> {
  const { input } = lookupSchema.parse({ input: rawInput.trim() });

  const directMatch = PLACE_ID_PATTERN.test(input) ? { placeId: input, textQuery: null } : extractQueryFromMapsUrl(input);
  const textQuery = directMatch?.textQuery ?? input;

  const placeId = directMatch?.placeId ?? (await searchPlaceId(textQuery, apiKey));
  if (!placeId) {
    throw new Error("No matching Google Place could be found.");
  }

  const details = await googleFetch<{
    id: string;
    displayName?: { text?: string };
    primaryTypeDisplayName?: { text?: string };
    types?: string[];
    googleMapsUri?: string;
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    rating?: number;
    priceLevel?: string | number;
  }>(`https://places.googleapis.com/v1/places/${placeId}`, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "id,displayName,primaryTypeDisplayName,types,googleMapsUri,regularOpeningHours,rating,priceLevel"
    }
  });

  const category = details.primaryTypeDisplayName?.text ?? "Restaurant";
  const cuisineType = deriveCuisine(details.types, details.primaryTypeDisplayName?.text ?? null);

  return {
    googlePlaceId: details.id,
    googleMapsUrl: details.googleMapsUri ?? null,
    name: details.displayName?.text ?? textQuery,
    category,
    cuisineType,
    openingHours: normalizeOpeningHours(details.regularOpeningHours ?? null),
    rating: typeof details.rating === "number" ? Number(details.rating.toFixed(1)) : null,
    priceLevel: mapPriceLevel(details.priceLevel)
  };
}
