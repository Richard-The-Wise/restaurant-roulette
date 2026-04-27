import { NextResponse } from "next/server";
import { z } from "zod";

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

  try {
    const detailsResponse = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "photos"
      },
      cache: "force-cache"
    });

    if (!detailsResponse.ok) {
      return fallbackSvg("Restaurant Roulette");
    }

    const details = (await detailsResponse.json()) as {
      photos?: Array<{ name?: string }>;
    };

    const photoName = details.photos?.[0]?.name;
    if (!photoName) {
      return fallbackSvg("Restaurant Roulette");
    }

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
      return fallbackSvg("Restaurant Roulette");
    }

    const media = (await mediaResponse.json()) as {
      photoUri?: string;
    };

    if (!media.photoUri) {
      return fallbackSvg("Restaurant Roulette");
    }

    return NextResponse.redirect(media.photoUri, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400"
      }
    });
  } catch {
    return fallbackSvg("Restaurant Roulette");
  }
}
