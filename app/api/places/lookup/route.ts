import { NextResponse } from "next/server";
import { z } from "zod";

import { getDictionary } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/locale";
import {
  GOOGLE_PLACES_CACHE_TTL_MS,
  fetchGooglePlaceDetails,
  fetchGooglePlacePhotoUrl,
  mapCachedPlaceToLookupResult,
  mapRestaurantToLookupResult,
  resolvePlaceLookupInput
} from "@/lib/google-places";
import { createClient } from "@/lib/supabase/server";
import type { GooglePlaceCacheEntry } from "@/types/domain";
import type { Database, Json } from "@/types/database";

const requestSchema = z.object({
  input: z.string().min(2)
});

export async function POST(request: Request) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: dict.formMessages.unauthorized }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: dict.formMessages.placesKeyMissing }, { status: 500 });
  }

  try {
    const body = requestSchema.parse(await request.json());
    const { placeId, textQuery } = await resolvePlaceLookupInput(body.input, apiKey, locale);

    const { data: existingRestaurant } = await supabase
      .from("restaurants")
      .select("google_place_id,google_maps_url,name,category,cuisine_type,opening_hours,rating,price_level")
      .eq("google_place_id", placeId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const reusedRestaurantPlace = existingRestaurant ? mapRestaurantToLookupResult(existingRestaurant) : null;
    if (reusedRestaurantPlace) {
      return NextResponse.json({ place: { ...reusedRestaurantPlace, lookupSource: "local" } });
    }

    const { data: cachedPlace } = await supabase
      .from("google_places_cache")
      .select("*")
      .eq("google_place_id", placeId)
      .maybeSingle();

    const isFreshCache =
      cachedPlace?.updated_at && new Date(cachedPlace.updated_at).getTime() > Date.now() - GOOGLE_PLACES_CACHE_TTL_MS;

    if (cachedPlace && isFreshCache) {
      return NextResponse.json({
        place: { ...mapCachedPlaceToLookupResult(cachedPlace as GooglePlaceCacheEntry), lookupSource: "cache" }
      });
    }

    const place = await fetchGooglePlaceDetails(placeId, textQuery, apiKey, locale);
    const photoUrl = place.photoName ? await fetchGooglePlacePhotoUrl(place.photoName, apiKey) : null;
    const cachePayload: Database["public"]["Tables"]["google_places_cache"]["Insert"] = {
      google_place_id: place.googlePlaceId,
      google_maps_url: place.googleMapsUrl,
      name: place.name,
      category: place.category,
      cuisine_type: place.cuisineType,
      opening_hours: (place.openingHours as Json | null) ?? null,
      rating: place.rating,
      price_level: place.priceLevel,
      photo_name: place.photoName ?? null,
      photo_url: photoUrl
    };

    await supabase.from("google_places_cache").upsert(cachePayload);

    return NextResponse.json({ place: { ...place, photoUrl, lookupSource: "google" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : dict.formMessages.placeLookupFailed },
      { status: 400 }
    );
  }
}
