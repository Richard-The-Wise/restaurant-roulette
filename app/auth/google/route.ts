import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function normalizeNext(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  return value;
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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = normalizeNext(requestUrl.searchParams.get("next"));
  const baseUrl = await getBaseUrl();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error || !data.url) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to start Google sign-in." },
      { status: 400 }
    );
  }

  return NextResponse.redirect(data.url);
}
