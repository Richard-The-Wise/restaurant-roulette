import type { Database } from "@/types/database";

export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
export type RestaurantList = Database["public"]["Tables"]["restaurant_lists"]["Row"];
export type ListMembership = Database["public"]["Tables"]["list_memberships"]["Row"];
export type ListInvitation = Database["public"]["Tables"]["list_invitations"]["Row"];

export interface OpeningHoursPayload {
  weekdayDescriptions: string[];
}

export interface PlaceLookupResult {
  googlePlaceId: string;
  googleMapsUrl: string | null;
  name: string;
  category: string;
  cuisineType: string | null;
  openingHours: OpeningHoursPayload | null;
  rating: number | null;
  priceLevel: number | null;
  photoName?: string | null;
  photoUrl?: string | null;
  lookupSource?: "local" | "cache" | "google";
}

export interface GooglePlaceCacheEntry {
  google_place_id: string;
  google_maps_url: string | null;
  name: string;
  category: string;
  cuisine_type: string | null;
  opening_hours: OpeningHoursPayload | null;
  rating: number | null;
  price_level: number | null;
  photo_name?: string | null;
  photo_url?: string | null;
  updated_at?: string;
}

export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export function isOpeningHoursPayload(value: unknown): value is OpeningHoursPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const descriptions = (value as OpeningHoursPayload).weekdayDescriptions;
  return Array.isArray(descriptions) && descriptions.every((item) => typeof item === "string");
}
