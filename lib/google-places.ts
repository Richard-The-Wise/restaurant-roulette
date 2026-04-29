import { z } from "zod";

import type { Locale } from "@/lib/i18n";
import { normalizeWeekdayDescription, titleCase } from "@/lib/utils";
import { isOpeningHoursPayload, type GooglePlaceCacheEntry, type OpeningHoursPayload, type PlaceLookupResult, type Restaurant } from "@/types/domain";

const lookupSchema = z.object({
  input: z.string().min(2)
});

export const GOOGLE_PLACES_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14;

const PLACE_ID_PATTERN = /^(ChI|Ei|GhI|Iho|Eic)[A-Za-z0-9_-]+$/;

const typeCuisineMap: Record<Locale, Record<string, string>> = {
  es: {
    pizza_restaurant: "Pizza",
    sushi_restaurant: "Sushi",
    italian_restaurant: "Italiana",
    mexican_restaurant: "Mexicana",
    chinese_restaurant: "China",
    japanese_restaurant: "Japonesa",
    indian_restaurant: "India",
    thai_restaurant: "Tailandesa",
    korean_restaurant: "Coreana",
    mediterranean_restaurant: "Mediterranea",
    seafood_restaurant: "Mariscos",
    steak_house: "Cortes",
    hamburger_restaurant: "Hamburguesas",
    breakfast_restaurant: "Desayunos",
    brunch_restaurant: "Brunch",
    cafe: "Cafe",
    coffee_shop: "Cafe",
    bakery: "Panaderia"
  },
  en: {
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
  }
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

async function resolveGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value);
    const isGoogleMapsHost =
      url.hostname.includes("google.com") || url.hostname.includes("goo.gl") || url.hostname.includes("googleusercontent.com");

    if (!isGoogleMapsHost) {
      return value;
    }

    const response = await fetch(value, {
      method: "GET",
      redirect: "follow",
      cache: "no-store"
    });

    return response.url || value;
  } catch {
    return value;
  }
}

function cleanTextQuery(value: string) {
  return value
    .replace(/\+/g, " ")
    .replace(/\s*[-|]\s*Google Maps$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
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
      return { placeId: null, textQuery: cleanTextQuery(q) };
    }

    const placePathMatch = decodeURIComponent(url.pathname).match(/\/place\/([^/]+)/i);
    if (placePathMatch?.[1]) {
      return { placeId: null, textQuery: cleanTextQuery(placePathMatch[1]) };
    }

    const pathSegments = decodeURIComponent(url.pathname)
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);

    const lastMeaningfulSegment = [...pathSegments]
      .reverse()
      .find((segment) => !segment.startsWith("@") && !segment.startsWith("data=") && segment !== "maps");

    if (lastMeaningfulSegment) {
      return { placeId: null, textQuery: cleanTextQuery(lastMeaningfulSegment) };
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

async function searchPlaceId(textQuery: string, apiKey: string, locale: Locale) {
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
      languageCode: locale
    })
  });

  if (payload.places?.[0]?.id) {
    return payload.places[0].id;
  }

  const fallbackPayload = await googleFetch<{
    places?: Array<{ id: string }>;
  }>("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id"
    },
    body: JSON.stringify({
      textQuery: `${textQuery} restaurant`,
      languageCode: locale
    })
  });

  return fallbackPayload.places?.[0]?.id ?? null;
}

function deriveCuisine(types: string[] | undefined, fallback: string | null, locale: Locale) {
  const cuisineMap = typeCuisineMap[locale];
  const matched = types?.find((type) => cuisineMap[type]);
  if (matched) {
    return cuisineMap[matched];
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
} | null, locale: Locale): OpeningHoursPayload | null {
  const descriptions = raw?.weekdayDescriptions ?? raw?.weekday_text ?? [];
  if (!descriptions.length) {
    return null;
  }

  return {
    weekdayDescriptions: descriptions.map((line) => normalizeWeekdayDescription(line, locale))
  };
}

export async function resolvePlaceLookupInput(rawInput: string, apiKey: string, locale: Locale) {
  const { input } = lookupSchema.parse({ input: rawInput.trim() });
  const resolvedInput = input.startsWith("http") ? await resolveGoogleMapsUrl(input) : input;

  const directMatch = PLACE_ID_PATTERN.test(resolvedInput)
    ? { placeId: resolvedInput, textQuery: null }
    : extractQueryFromMapsUrl(resolvedInput);
  const textQuery = cleanTextQuery(directMatch?.textQuery ?? resolvedInput);

  const placeId = directMatch?.placeId ?? (await searchPlaceId(textQuery, apiKey, locale));
  if (!placeId) {
    throw new Error("No matching Google Place could be found.");
  }

  return { placeId, textQuery };
}

export async function fetchGooglePlaceDetails(placeId: string, textQuery: string, apiKey: string, locale: Locale): Promise<PlaceLookupResult> {
  const detailsUrl = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
  detailsUrl.searchParams.set("languageCode", locale);

  const details = await googleFetch<{
    id: string;
    displayName?: { text?: string };
    primaryTypeDisplayName?: { text?: string };
    types?: string[];
    googleMapsUri?: string;
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    rating?: number;
    priceLevel?: string | number;
    photos?: Array<{ name?: string }>;
  }>(detailsUrl.toString(), {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,primaryTypeDisplayName,types,googleMapsUri,regularOpeningHours,rating,priceLevel,photos"
    }
  });

  const category = details.primaryTypeDisplayName?.text ?? (locale === "es" ? "Restaurante" : "Restaurant");
  const cuisineType = deriveCuisine(details.types, details.primaryTypeDisplayName?.text ?? null, locale);
  const photoName = details.photos?.[0]?.name ?? null;

  return {
    googlePlaceId: details.id,
    googleMapsUrl: details.googleMapsUri ?? null,
    name: details.displayName?.text ?? textQuery,
    category,
    cuisineType,
    openingHours: normalizeOpeningHours(details.regularOpeningHours ?? null, locale),
    rating: typeof details.rating === "number" ? Number(details.rating.toFixed(1)) : null,
    priceLevel: mapPriceLevel(details.priceLevel),
    photoName,
    photoUrl: null
  };
}

export async function lookupRestaurantPlace(rawInput: string, apiKey: string, locale: Locale): Promise<PlaceLookupResult> {
  const { placeId, textQuery } = await resolvePlaceLookupInput(rawInput, apiKey, locale);
  return fetchGooglePlaceDetails(placeId, textQuery, apiKey, locale);
}

export function mapCachedPlaceToLookupResult(entry: GooglePlaceCacheEntry): PlaceLookupResult {
  return {
    googlePlaceId: entry.google_place_id,
    googleMapsUrl: entry.google_maps_url,
    name: entry.name,
    category: entry.category,
    cuisineType: entry.cuisine_type,
    openingHours: entry.opening_hours,
    rating: entry.rating,
    priceLevel: entry.price_level,
    photoName: entry.photo_name ?? null,
    photoUrl: entry.photo_url ?? null
  };
}

export function mapRestaurantToLookupResult(restaurant: Pick<
  Restaurant,
  "google_place_id" | "google_maps_url" | "name" | "category" | "cuisine_type" | "opening_hours" | "rating" | "price_level"
>): PlaceLookupResult | null {
  if (!restaurant.google_place_id) {
    return null;
  }

  return {
    googlePlaceId: restaurant.google_place_id,
    googleMapsUrl: restaurant.google_maps_url,
    name: restaurant.name,
    category: restaurant.category,
    cuisineType: restaurant.cuisine_type,
    openingHours: isOpeningHoursPayload(restaurant.opening_hours) ? restaurant.opening_hours : null,
    rating: restaurant.rating,
    priceLevel: restaurant.price_level,
    photoName: null,
    photoUrl: null
  };
}

export async function fetchGooglePlacePhotoUrl(
  photoName: string,
  apiKey: string,
  width = 1200,
  height = 900
) {
  const mediaUrl = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  mediaUrl.searchParams.set("maxWidthPx", String(width));
  mediaUrl.searchParams.set("maxHeightPx", String(height));
  mediaUrl.searchParams.set("skipHttpRedirect", "true");

  const mediaResponse = await fetch(mediaUrl.toString(), {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey
    },
    cache: "force-cache"
  });

  if (!mediaResponse.ok) {
    return null;
  }

  const media = (await mediaResponse.json()) as {
    photoUri?: string;
  };

  return media.photoUri ?? null;
}
