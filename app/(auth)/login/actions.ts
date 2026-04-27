"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDictionary } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/types/domain";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function normalizeNextPath(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value : "/";
  if (!raw.startsWith("/")) {
    return "/";
  }

  return raw;
}

async function getBaseUrl() {
  const headerStore = await headers();
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");

  if (host) {
    return `${forwardedProto ?? "http"}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function signInAction(_: FormState, formData: FormData): Promise<FormState> {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: dict.authMessages.invalidCredentials
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: error.message
    };
  }

  redirect(normalizeNextPath(formData.get("next")));
}

export async function signUpAction(_: FormState, formData: FormData): Promise<FormState> {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: dict.authMessages.invalidCredentials
    };
  }

  const supabase = await createClient();
  const baseUrl = await getBaseUrl();
  const next = normalizeNextPath(formData.get("next"));
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error) {
    return {
      status: "error",
      message: error.message
    };
  }

  return {
    status: "success",
    message: dict.authMessages.createdAccount
  };
}
