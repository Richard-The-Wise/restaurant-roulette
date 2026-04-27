import { ImageResponse } from "next/og";

import { RouletteIconArtwork } from "@/lib/pwa-icon";

export const runtime = "nodejs";

export async function GET() {
  const size = 512;

  return new ImageResponse(<RouletteIconArtwork size={size} />, {
    width: size,
    height: size
  });
}
