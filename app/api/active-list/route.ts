import { NextResponse } from "next/server";

import { ACTIVE_LIST_COOKIE } from "@/lib/list-selection";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const listId = url.searchParams.get("listId") || "";
  const redirectTo = url.searchParams.get("redirect") || "/";

  const response = NextResponse.redirect(new URL(redirectTo, url.origin));
  response.cookies.set(ACTIVE_LIST_COOKIE, listId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
