"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

import { ACTIVE_LIST_COOKIE, getAccessibleListsForCurrentUser, getPendingInvitationsForCurrentUser } from "@/lib/list-selection";
import { createClient } from "@/lib/supabase/server";

const createListSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().or(z.literal(""))
});

const inviteSchema = z.object({
  list_id: z.string().uuid(),
  email: z.string().email()
});

const deleteListSchema = z.object({
  list_id: z.string().uuid()
});

const importRestaurantsSchema = z.object({
  target_list_id: z.string().uuid(),
  restaurant_ids: z.array(z.string().uuid()).min(1)
});

export async function createListAction(formData: FormData) {
  const parsed = createListSchema.parse({
    name: formData.get("name"),
    description: formData.get("description")
  });

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: list, error } = await supabase
    .from("restaurant_lists")
    .insert({
      created_by: user.id,
      name: parsed.name,
      description: parsed.description || null,
      is_personal: false
    })
    .select("*")
    .single();

  if (error || !list) {
    throw new Error(error?.message ?? "Unable to create list");
  }

  revalidatePath("/lists");
  redirect(`/api/active-list?listId=${list.id}&redirect=/lists`);
}

export async function inviteToListAction(formData: FormData) {
  const parsed = inviteSchema.parse({
    list_id: formData.get("list_id"),
    email: String(formData.get("email") ?? "").trim().toLowerCase()
  });

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("list_invitations").upsert({
    list_id: parsed.list_id,
    email: parsed.email,
    invited_by: user.id,
    status: "pending"
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/lists");
}

export async function acceptInvitationAction(formData: FormData) {
  const invitationId = String(formData.get("invitation_id"));
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error("Not authenticated");
  }

  const pendingInvitations = await getPendingInvitationsForCurrentUser();
  const invitation = pendingInvitations.find((item) => item.id === invitationId);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  const { error: membershipError } = await supabase.from("list_memberships").insert({
    list_id: invitation.list_id,
    user_id: user.id,
    role: "member",
    status: "accepted"
  });

  if (membershipError && !membershipError.message.includes("duplicate")) {
    throw new Error(membershipError.message);
  }

  const { error: invitationError } = await supabase
    .from("list_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  if (invitationError) {
    throw new Error(invitationError.message);
  }

  revalidatePath("/lists");
  redirect(`/api/active-list?listId=${invitation.list_id}&redirect=/lists`);
}

export async function deleteListAction(formData: FormData) {
  const parsed = deleteListSchema.parse({
    list_id: formData.get("list_id")
  });

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { lists, memberships } = await getAccessibleListsForCurrentUser();
  const list = lists.find((item) => item.id === parsed.list_id);
  const membership = memberships.find((item) => item.list_id === parsed.list_id);

  if (!list || membership?.role !== "owner") {
    throw new Error("List not found");
  }

  if (list.is_personal) {
    throw new Error("Personal list cannot be deleted");
  }

  const cookieStore = await cookies();
  const requestedListId = cookieStore.get(ACTIVE_LIST_COOKIE)?.value;

  const { error } = await supabase.from("restaurant_lists").delete().eq("id", parsed.list_id);

  if (error) {
    throw new Error(error.message);
  }

  if (requestedListId === parsed.list_id) {
    cookieStore.delete(ACTIVE_LIST_COOKIE);
  }

  revalidatePath("/lists");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/roulette");
  redirect("/lists");
}

export async function importRestaurantsToListAction(formData: FormData) {
  const parsed = importRestaurantsSchema.parse({
    target_list_id: formData.get("target_list_id"),
    restaurant_ids: formData.getAll("restaurant_ids")
  });

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { lists, memberships } = await getAccessibleListsForCurrentUser();
  const targetList = lists.find((list) => list.id === parsed.target_list_id);
  const targetMembership = memberships.find((membership) => membership.list_id === parsed.target_list_id);

  if (!targetList || !targetMembership) {
    throw new Error("Target list not found");
  }

  const { data: sourceRestaurants, error: sourceError } = await supabase
    .from("restaurants")
    .select("*")
    .in("id", parsed.restaurant_ids);

  if (sourceError) {
    throw new Error(sourceError.message);
  }

  if (!sourceRestaurants?.length) {
    throw new Error("No restaurants selected");
  }

  const payload = sourceRestaurants.map((restaurant) => ({
    user_id: user.id,
    list_id: parsed.target_list_id,
    google_place_id: restaurant.google_place_id,
    google_maps_url: restaurant.google_maps_url,
    name: restaurant.name,
    category: restaurant.category,
    cuisine_type: restaurant.cuisine_type,
    opening_hours: restaurant.opening_hours,
    rating: restaurant.rating,
    price_level: restaurant.price_level,
    visit_count: restaurant.visit_count,
    last_visited: restaurant.last_visited,
    notes: restaurant.notes,
    is_favorite: restaurant.is_favorite,
    tags: restaurant.tags
  }));

  const { error: insertError } = await supabase.from("restaurants").insert(payload);

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/lists");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/roulette");
}
