import { NextResponse } from "next/server";
import { z } from "zod";

import { GOOGLE_PLACES_CACHE_TTL_MS, fetchGooglePlacePhotoUrl } from "@/lib/google-places";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const requestSchema = z.object({
  placeId: z.string().min(8),
  width: z.coerce.number().int().min(200).max(1600).optional(),
  height: z.coerce.number().int().min(200).max(1600).optional()
});

function fallbackSvg(label: string) {
  const text = label.slice(0, 32);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1f9d84" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <circle cx="970" cy="190" r="160" fill="rgba(255,255,255,0.08)" />
      <circle cx="220" cy="640" r="220" fill="rgba(255,255,255,0.06)" />
      <text x="96" y="670" fill="white" font-size="64" font-family="Arial, sans-serif" font-weight="700">${text}</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600"
    }
  });
}

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return fallbackSvg("Restaurant Roulette");
  }

  const url = new URL(request.url);
  const parsed = requestSchema.safeParse({
    placeId: url.searchParams.get("placeId"),
    width: url.searchParams.get("width") ?? undefined,
    height: url.searchParams.get("height") ?? undefined
  });

  if (!parsed.success) {
    return fallbackSvg("Restaurant Roulette");
  }

  const { placeId, width = 1200, height = 900 } = parsed.data;
  const supabase = await createClient();

  try {
    const { data: cachedPlace } = await supabase
      .from("google_places_cache")
      .select("google_place_id,name,category,photo_name,photo_url,updated_at")
      .eq("google_place_id", placeId)
      .maybeSingle();

    const isFreshCache =
      cachedPlace?.updated_at && new Date(cachedPlace.updated_at).getTime() > Date.now() - GOOGLE_PLACES_CACHE_TTL_MS;

    if (cachedPlace?.photo_url && isFreshCache) {
      return NextResponse.redirect(cachedPlace.photo_url, {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=1209600"
        }
      });
    }

    let photoName = cachedPlace?.photo_name ?? null;
    let placeName = cachedPlace?.name ?? "Restaurant Roulette";
    let category = cachedPlace?.category ?? "Restaurant";

    if (!photoName) {
      const detailsResponse = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "displayName,primaryTypeDisplayName,photos"
        },
        cache: "force-cache"
      });

      if (!detailsResponse.ok) {
        return fallbackSvg(placeName);
      }

      const details = (await detailsResponse.json()) as {
        displayName?: { text?: string };
        primaryTypeDisplayName?: { text?: string };
        photos?: Array<{ name?: string }>;
      };

      photoName = details.photos?.[0]?.name ?? null;
      placeName = details.displayName?.text ?? placeName;
      category = details.primaryTypeDisplayName?.text ?? category;
    }

    if (!photoName) {
      return fallbackSvg(placeName);
    }

    const photoUrl = await fetchGooglePlacePhotoUrl(photoName, apiKey, width, height);
    if (!photoUrl) {
      return fallbackSvg(placeName);
    }

    const cachePayload: Database["public"]["Tables"]["google_places_cache"]["Insert"] = {
      google_place_id: placeId,
      name: placeName,
      category,
      photo_name: photoName,
      photo_url: photoUrl
    };

    await supabase.from("google_places_cache").upsert(cachePayload);

    return NextResponse.redirect(photoUrl, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=1209600"
      }
    });
  } catch {
    return fallbackSvg("Restaurant Roulette");
  }
}
