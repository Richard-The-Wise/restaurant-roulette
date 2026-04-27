import { NextResponse } from "next/server";
import { z } from "zod";

import { getDictionary } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/locale";
import { lookupRestaurantPlace } from "@/lib/google-places";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  input: z.string().min(2)
});

export async function POST(request: Request) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: dict.formMessages.unauthorized }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: dict.formMessages.placesKeyMissing }, { status: 500 });
  }

  try {
    const body = requestSchema.parse(await request.json());
    const place = await lookupRestaurantPlace(body.input, apiKey, locale);
    return NextResponse.json({ place });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : dict.formMessages.placeLookupFailed },
      { status: 400 }
    );
  }
}
