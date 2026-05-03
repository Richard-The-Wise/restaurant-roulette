"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDictionary } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";
import { parseTags } from "@/lib/utils";
import type { FormState, OpeningHoursPayload } from "@/types/domain";

function normalizeRestaurantText(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

async function restaurantExistsInList(
  listId: string,
  values: {
    google_place_id?: string | null;
    name: string;
    category: string;
    excludeId?: string;
  }
) {
  const supabase = await createClient();

  if (values.google_place_id) {
    let query = supabase
      .from("restaurants")
      .select("id")
      .eq("list_id", listId)
      .eq("google_place_id", values.google_place_id)
      .limit(5);

    if (values.excludeId) {
      query = query.neq("id", values.excludeId);
    }

    const { data } = await query;
    if (data?.length) {
      return true;
    }
  }

  let candidateQuery = supabase
    .from("restaurants")
    .select("id,name,category")
    .eq("list_id", listId)
    .ilike("name", values.name)
    .limit(10);

  if (values.excludeId) {
    candidateQuery = candidateQuery.neq("id", values.excludeId);
  }

  const { data: candidates } = await candidateQuery;
  const normalizedName = normalizeRestaurantText(values.name);
  const normalizedCategory = normalizeRestaurantText(values.category);

  return (candidates ?? []).some(
    (candidate) =>
      normalizeRestaurantText(candidate.name) === normalizedName &&
      normalizeRestaurantText(candidate.category) === normalizedCategory
  );
}

async function getUserScopedRestaurant(restaurantId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, list_id")
    .eq("id", restaurantId)
    .maybeSingle();

  if (error || !restaurant) {
    throw new Error(error?.message ?? "Restaurant not found");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("list_memberships")
    .select("id")
    .eq("list_id", restaurant.list_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    throw new Error(membershipError?.message ?? "Not authorized");
  }

  return { supabase, userId: user.id, restaurantId, listId: restaurant.list_id };
}

const restaurantSchema = z.object({
  restaurant_id: z.string().uuid(),
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

export async function toggleFavoriteAction(formData: FormData) {
  const restaurantId = String(formData.get("restaurant_id"));
  const favorite = String(formData.get("favorite")) === "true";

  const { supabase, listId } = await getUserScopedRestaurant(restaurantId);
  const { error } = await supabase
    .from("restaurants")
    .update({ is_favorite: !favorite, updated_at: new Date().toISOString() })
    .eq("id", restaurantId)
    .eq("list_id", listId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function logVisitAction(formData: FormData) {
  const restaurantId = String(formData.get("restaurant_id"));
  const currentCount = Number(formData.get("visit_count") ?? 0);

  const { supabase, listId } = await getUserScopedRestaurant(restaurantId);
  const { error } = await supabase
    .from("restaurants")
    .update({
      visit_count: currentCount + 1,
      last_visited: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", restaurantId)
    .eq("list_id", listId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/catalog");
  revalidatePath("/");
  revalidatePath("/roulette");
}

export async function deleteRestaurantAction(formData: FormData) {
  const restaurantId = String(formData.get("restaurant_id"));
  const { supabase, listId } = await getUserScopedRestaurant(restaurantId);

  const { error } = await supabase.from("restaurants").delete().eq("id", restaurantId).eq("list_id", listId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/catalog");
  revalidatePath("/");
  revalidatePath("/roulette");
}

export async function updateRestaurantAction(_: FormState, formData: FormData): Promise<FormState> {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);

  const parsed = restaurantSchema.safeParse({
    restaurant_id: formData.get("restaurant_id"),
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

  const { supabase, listId } = await getUserScopedRestaurant(parsed.data.restaurant_id);

  const duplicateExists = await restaurantExistsInList(listId, {
    google_place_id: parsed.data.google_place_id || null,
    name: parsed.data.name,
    category: parsed.data.category,
    excludeId: parsed.data.restaurant_id
  });

  if (duplicateExists) {
    return {
      status: "error",
      message: dict.formMessages.restaurantAlreadyExists
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

  const { error } = await supabase
    .from("restaurants")
    .update({
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
      tags: parseTags(parsed.data.tags ?? ""),
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.restaurant_id)
    .eq("list_id", listId);

  if (error) {
    return {
      status: "error",
      message: error.message
    };
  }

  revalidatePath("/catalog");
  revalidatePath("/");
  revalidatePath("/roulette");
  redirect("/catalog?updated=1");
}
