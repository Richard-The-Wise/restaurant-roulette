import { notFound } from "next/navigation";

import { AddRestaurantForm } from "@/components/add-restaurant-form";
import { SectionHeading } from "@/components/section-heading";
import { getDictionary } from "@/lib/i18n";
import { getActiveListForCurrentUser } from "@/lib/list-selection";
import { getLocaleFromCookies } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

export default async function EditRestaurantPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const { activeList } = await getActiveListForCurrentUser();

  if (!activeList) {
    notFound();
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .eq("list_id", activeList.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="shell-panel px-5 py-5 sm:px-8 sm:py-6">
        <SectionHeading eyebrow={dict.add.editEyebrow} title={dict.add.editTitle} description={dict.add.editDescription} />
      </section>
      <AddRestaurantForm locale={locale} mode="edit" restaurant={restaurant} />
    </div>
  );
}
