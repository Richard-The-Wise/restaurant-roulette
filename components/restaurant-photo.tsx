"use client";

import { useMemo, useState } from "react";
import { MapPinned } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Restaurant } from "@/types/domain";

interface RestaurantPhotoProps {
  restaurant: Restaurant;
  alt: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
}

export function RestaurantPhoto({
  restaurant,
  alt,
  className,
  imageClassName,
  width = 1200,
  height = 900
}: RestaurantPhotoProps) {
  const [hasError, setHasError] = useState(false);
  const photoSrc = useMemo(() => {
    if (!restaurant.google_place_id) {
      return null;
    }

    const params = new URLSearchParams({
      placeId: restaurant.google_place_id,
      width: String(width),
      height: String(height)
    });

    return `/api/places/photo?${params.toString()}`;
  }, [height, restaurant.google_place_id, width]);

  if (!photoSrc || hasError) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1f9d84_100%)]",
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%)]" />
        <div className="relative flex h-full w-full flex-col justify-end p-4 text-white">
          <MapPinned className="mb-3 h-6 w-6 opacity-90" />
          <p className="line-clamp-2 text-sm font-semibold">{restaurant.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoSrc}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", imageClassName)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
