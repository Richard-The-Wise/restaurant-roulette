"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDictionary } from "@/lib/i18n";
import { getActiveListForCurrentUser } from "@/lib/list-selection";
import { getLocaleFromCookies } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";
import { parseTags } from "@/lib/utils";
import type { FormState, OpeningHoursPayload } from "@/types/domain";

const restaurantSchema = z.object({
  google_place_id: z.string().optional().nullable(),
  google_maps_url: z.string().url().optional().or(z.literal("")).nullable(),
  name: z.string().min(2),
  category: z.string().min(2),
  cuisine_type: z.string().optional().or(z.literal("")),
  opening_hours: z.string().optional().or(z.literal("")),
  rating: z.string().optional().or(z.literal("")),
  price_level: z.coerce.number().min(1).max(5).nullable(),
  visit_count: z.coerce.number().int().min(0),
  last_visited: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  is_favorite: z.union([z.literal("on"), z.null()]).optional(),
  tags: z.string().optional().or(z.literal(""))
});

export async function createRestaurantAction(_: FormState, formData: FormData): Promise<FormState> {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);

  const parsed = restaurantSchema.safeParse({
    google_place_id: formData.get("google_place_id"),
    google_maps_url: formData.get("google_maps_url"),
    name: formData.get("name"),
    category: formData.get("category"),
    cuisine_type: formData.get("cuisine_type"),
    opening_hours: formData.get("opening_hours"),
    rating: formData.get("rating"),
    price_level: formData.get("price_level") ? Number(formData.get("price_level")) : null,
    visit_count: formData.get("visit_count") ?? 0,
    last_visited: formData.get("last_visited"),
    notes: formData.get("notes"),
    is_favorite: formData.get("is_favorite"),
    tags: formData.get("tags")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: dict.formMessages.reviewForm
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { activeList } = await getActiveListForCurrentUser();

  if (!user || !activeList) {
    return {
      status: "error",
      message: dict.formMessages.sessionExpired
    };
  }

  const openingHours = parsed.data.opening_hours
    ? ({
        weekdayDescriptions: parsed.data.opening_hours
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      } satisfies OpeningHoursPayload)
    : null;

  const { error } = await supabase.from("restaurants").insert({
    user_id: user.id,
    list_id: activeList.id,
    google_place_id: parsed.data.google_place_id || null,
    google_maps_url: parsed.data.google_maps_url || null,
    name: parsed.data.name,
    category: parsed.data.category,
    cuisine_type: parsed.data.cuisine_type || null,
    opening_hours: openingHours,
    rating: parsed.data.rating ? Number(parsed.data.rating) : null,
    price_level: parsed.data.price_level,
    visit_count: parsed.data.visit_count,
    last_visited: parsed.data.last_visited || null,
    notes: parsed.data.notes || null,
    is_favorite: Boolean(parsed.data.is_favorite),
    tags: parseTags(parsed.data.tags ?? "")
  });

  if (error) {
    return {
      status: "error",
      message: error.message
    };
  }

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/roulette");
  redirect("/catalog?created=1");
}
