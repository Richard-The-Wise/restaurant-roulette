import { cookies } from "next/headers";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { ListInvitation, ListMembership, RestaurantList } from "@/types/domain";

export const ACTIVE_LIST_COOKIE = "active_list_id";

export const ensurePersonalListForUser = cache(async (userId: string) => {
  const supabase = await createClient();

  const { data: existingPersonalList, error: existingPersonalListError } = await supabase
    .from("restaurant_lists")
    .select("id")
    .eq("created_by", userId)
    .eq("is_personal", true)
    .maybeSingle();

  if (existingPersonalListError) {
    throw new Error(existingPersonalListError.message);
  }

  let listId = existingPersonalList?.id;

  if (!listId) {
    const { data: insertedList, error } = await supabase
      .from("restaurant_lists")
      .insert({
        created_by: userId,
        name: "Mi lista personal",
        description: "Lista privada por defecto",
        is_personal: true
      })
      .select("id")
      .single();

    if (error) {
      const isDuplicate =
        error.code === "23505" ||
        error.message.toLowerCase().includes("restaurant_lists_personal_owner_uidx");

      if (!isDuplicate) {
        throw new Error(error.message ?? "No se pudo crear la lista personal.");
      }
    } else {
      listId = insertedList?.id;
    }
  }

  if (!listId) {
    const { data: personalList, error } = await supabase
      .from("restaurant_lists")
      .select("id")
      .eq("created_by", userId)
      .eq("is_personal", true)
      .single();

    if (error || !personalList) {
      throw new Error(error?.message ?? "No se pudo resolver la lista personal.");
    }

    listId = personalList.id;
  }

  const { error: membershipError } = await supabase.from("list_memberships").insert({
    list_id: listId,
    user_id: userId,
    role: "owner",
    status: "accepted"
  });

  if (membershipError) {
    const isDuplicate =
      membershipError.code === "23505" || membershipError.message.toLowerCase().includes("duplicate key value");

    if (!isDuplicate) {
      throw new Error(membershipError.message);
    }
  }
});

export async function getAccessibleListsForCurrentUser(): Promise<{
  lists: RestaurantList[];
  memberships: ListMembership[];
}> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { lists: [], memberships: [] };
  }

  await ensurePersonalListForUser(user.id);

  const { data: memberships, error: membershipsError } = await supabase
    .from("list_memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "accepted");

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  const listIds = memberships?.map((membership) => membership.list_id) ?? [];
  if (!listIds.length) {
    return { lists: [], memberships: memberships ?? [] };
  }

  const { data: lists, error: listsError } = await supabase
    .from("restaurant_lists")
    .select("*")
    .in("id", listIds)
    .order("created_at", { ascending: true });

  if (listsError) {
    throw new Error(listsError.message);
  }

  return { lists: lists ?? [], memberships: memberships ?? [] };
}

export async function getActiveListForCurrentUser() {
  const { lists, memberships } = await getAccessibleListsForCurrentUser();
  const cookieStore = await cookies();
  const requestedListId = cookieStore.get(ACTIVE_LIST_COOKIE)?.value;
  const activeList = lists.find((list) => list.id === requestedListId) ?? lists[0] ?? null;

  return {
    activeList,
    lists,
    memberships
  };
}

export async function getPendingInvitationsForCurrentUser(): Promise<ListInvitation[]> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return [];
  }

  const { data, error } = await supabase
    .from("list_invitations")
    .select("*")
    .eq("email", user.email.toLowerCase())
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
