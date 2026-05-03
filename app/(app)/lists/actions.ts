"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

import { ACTIVE_LIST_COOKIE, getAccessibleListsForCurrentUser, getPendingInvitationsForCurrentUser } from "@/lib/list-selection";
import { createAdminClient } from "@/lib/supabase/admin";
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

function buildListsRedirect(status: "success" | "error", message: string) {
  return `/lists?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`;
}

function humanizeListError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("list_invitations_list_id_email_key") ||
    (normalized.includes("duplicate key value") && normalized.includes("list_invitations"))
  ) {
    return "Esa persona ya tiene una invitacion pendiente para esta lista.";
  }

  return message;
}

function normalizeRestaurantText(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

async function doesAuthUserExistByEmail(email: string) {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data.users ?? []).some((user) => user.email?.toLowerCase() === email.toLowerCase());
}

export async function createListAction(formData: FormData) {
  const parsed = createListSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description")
  });

  if (!parsed.success) {
    redirect(buildListsRedirect("error", "Revisa el nombre y la descripcion de la lista."));
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildListsRedirect("error", "Tu sesion expiro. Inicia sesion nuevamente."));
  }

  const { data: list, error } = await supabase
    .from("restaurant_lists")
    .insert({
      created_by: user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      is_personal: false
    })
    .select("*")
    .single();

  if (error || !list) {
    redirect(buildListsRedirect("error", error?.message ?? "No se pudo crear la lista."));
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_LIST_COOKIE, list.id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  revalidatePath("/lists");
  redirect(buildListsRedirect("success", "Lista creada correctamente."));
}

export async function inviteToListAction(formData: FormData) {
  const parsed = inviteSchema.safeParse({
    list_id: formData.get("list_id"),
    email: String(formData.get("email") ?? "").trim().toLowerCase()
  });

  if (!parsed.success) {
    redirect(buildListsRedirect("error", "Revisa el correo y la lista seleccionada."));
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildListsRedirect("error", "Tu sesion expiro. Inicia sesion nuevamente."));
  }

  const inviteeExists = await doesAuthUserExistByEmail(parsed.data.email);

  if (!inviteeExists) {
    redirect(buildListsRedirect("error", "No existe una cuenta registrada con ese correo."));
  }

  const { error } = await supabase.from("list_invitations").upsert({
    list_id: parsed.data.list_id,
    email: parsed.data.email,
    invited_by: user.id,
    status: "pending"
  });

  if (error) {
    redirect(buildListsRedirect("error", humanizeListError(error.message)));
  }

  revalidatePath("/lists");
  redirect(buildListsRedirect("success", "Invitacion enviada correctamente."));
}

export async function acceptInvitationAction(formData: FormData) {
  const invitationId = String(formData.get("invitation_id"));
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(buildListsRedirect("error", "Tu sesion expiro. Inicia sesion nuevamente."));
  }

  const pendingInvitations = await getPendingInvitationsForCurrentUser();
  const invitation = pendingInvitations.find((item) => item.id === invitationId);

  if (!invitation) {
    redirect(buildListsRedirect("error", "No se encontro la invitacion."));
  }

  const { error: membershipError } = await supabase.from("list_memberships").insert({
    list_id: invitation.list_id,
    user_id: user.id,
    role: "member",
    status: "accepted"
  });

  if (membershipError && !membershipError.message.includes("duplicate")) {
    redirect(buildListsRedirect("error", membershipError.message));
  }

  const { error: invitationError } = await supabase
    .from("list_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  if (invitationError) {
    redirect(buildListsRedirect("error", invitationError.message));
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_LIST_COOKIE, invitation.list_id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  revalidatePath("/lists");
  redirect(buildListsRedirect("success", "Invitacion aceptada correctamente."));
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

  const { data: existingTargetRestaurants, error: existingTargetError } = await supabase
    .from("restaurants")
    .select("google_place_id,name,category")
    .eq("list_id", parsed.target_list_id);

  if (existingTargetError) {
    throw new Error(existingTargetError.message);
  }

  const existingGooglePlaceIds = new Set(
    (existingTargetRestaurants ?? [])
      .map((restaurant) => restaurant.google_place_id)
      .filter((value): value is string => Boolean(value))
  );

  const existingFallbackKeys = new Set(
    (existingTargetRestaurants ?? []).map((restaurant) =>
      `${normalizeRestaurantText(restaurant.name)}::${normalizeRestaurantText(restaurant.category)}`
    )
  );

  const seenGooglePlaceIds = new Set<string>();
  const seenFallbackKeys = new Set<string>();

  const payload = sourceRestaurants
    .filter((restaurant) => {
      if (restaurant.google_place_id) {
        if (existingGooglePlaceIds.has(restaurant.google_place_id) || seenGooglePlaceIds.has(restaurant.google_place_id)) {
          return false;
        }

        seenGooglePlaceIds.add(restaurant.google_place_id);
        return true;
      }

      const fallbackKey = `${normalizeRestaurantText(restaurant.name)}::${normalizeRestaurantText(restaurant.category)}`;
      if (existingFallbackKeys.has(fallbackKey) || seenFallbackKeys.has(fallbackKey)) {
        return false;
      }

      seenFallbackKeys.add(fallbackKey);
      return true;
    })
    .map((restaurant) => ({
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

  if (!payload.length) {
    revalidatePath("/lists");
    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/roulette");
    redirect(buildListsRedirect("success", "No habia restaurantes nuevos para importar."));
  }

  const { error: insertError } = await supabase.from("restaurants").insert(payload);

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/lists");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/roulette");
  redirect(
    buildListsRedirect(
      "success",
      payload.length === 1 ? "Se importo 1 restaurante correctamente." : `Se importaron ${payload.length} restaurantes correctamente.`
    )
  );
}
