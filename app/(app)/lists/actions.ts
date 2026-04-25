"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getPendingInvitationsForCurrentUser } from "@/lib/list-selection";
import { createClient } from "@/lib/supabase/server";

const createListSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().or(z.literal(""))
});

const inviteSchema = z.object({
  list_id: z.string().uuid(),
  email: z.string().email()
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
