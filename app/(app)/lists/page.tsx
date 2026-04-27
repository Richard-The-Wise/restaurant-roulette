import { acceptInvitationAction, createListAction, inviteToListAction } from "@/app/(app)/lists/actions";
import { ActionSubmitButton } from "@/components/action-submit-button";
import { ListsOverview } from "@/components/lists-overview";
import { SectionHeading } from "@/components/section-heading";
import { getDictionary } from "@/lib/i18n";
import { getAccessibleListsForCurrentUser, getActiveListForCurrentUser, getPendingInvitationsForCurrentUser } from "@/lib/list-selection";
import { getLocaleFromCookies } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

export default async function ListsPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const { lists, memberships } = await getAccessibleListsForCurrentUser();
  const { activeList } = await getActiveListForCurrentUser();
  const pendingInvitations = await getPendingInvitationsForCurrentUser();
  const supabase = await createClient();
  const { data: allMemberships } = lists.length
    ? await supabase.from("list_memberships").select("list_id").in("list_id", lists.map((list) => list.id))
    : { data: [] };
  const { data: restaurants } = lists.length
    ? await supabase.from("restaurants").select("id,list_id,name,category,cuisine_type").in("list_id", lists.map((list) => list.id))
    : { data: [] };
  const membersCountByList = Object.fromEntries(
    lists.map((list) => [list.id, allMemberships?.filter((item) => item.list_id === list.id).length ?? 0])
  );

  return (
    <div className="space-y-6">
      <section className="shell-panel px-5 py-5 sm:px-8 sm:py-6">
        <SectionHeading eyebrow={dict.nav.lists} title={dict.lists.title} description={dict.lists.description} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ListsOverview
            locale={locale}
            lists={lists}
            memberships={memberships}
            activeListId={activeList?.id ?? null}
            membersCountByList={membersCountByList}
            restaurants={restaurants ?? []}
          />

          <div className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
            <h2 className="text-xl font-semibold text-slate-950">{dict.lists.pendingTitle}</h2>
            <div className="mt-5 space-y-4">
              {pendingInvitations.length ? (
                pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{invitation.email}</p>
                        <p className="text-sm text-slate-500">{invitation.list_id}</p>
                      </div>
                      <form action={acceptInvitationAction} autoComplete="off" suppressHydrationWarning>
                        <input type="hidden" name="invitation_id" value={invitation.id} suppressHydrationWarning />
                        <ActionSubmitButton className="bg-aurora-600 hover:bg-aurora-700">
                          {dict.lists.acceptButton}
                        </ActionSubmitButton>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">{dict.lists.emptyPending}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <form action={createListAction} className="surface-panel space-y-4 px-5 py-5 sm:px-6 sm:py-6" autoComplete="off" suppressHydrationWarning>
            <h2 className="text-xl font-semibold text-slate-950">{dict.lists.createTitle}</h2>
            <div>
              <label className="label" htmlFor="list-name">
                {dict.lists.createName}
              </label>
              <input id="list-name" name="name" className="field" autoComplete="off" suppressHydrationWarning />
            </div>
            <div>
              <label className="label" htmlFor="list-description">
                {dict.lists.createDescription}
              </label>
              <textarea id="list-description" name="description" className="field min-h-24 resize-y" autoComplete="off" suppressHydrationWarning />
            </div>
            <ActionSubmitButton>{dict.lists.createButton}</ActionSubmitButton>
          </form>

          <form action={inviteToListAction} className="surface-panel space-y-4 px-5 py-5 sm:px-6 sm:py-6" autoComplete="off" suppressHydrationWarning>
            <h2 className="text-xl font-semibold text-slate-950">{dict.lists.inviteTitle}</h2>
            <div>
              <label className="label" htmlFor="invite-list">
                {dict.lists.inviteList}
              </label>
              <select
                id="invite-list"
                name="list_id"
                className="field"
                defaultValue={activeList?.id ?? lists[0]?.id}
                autoComplete="off"
                suppressHydrationWarning
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="invite-email">
                {dict.lists.inviteEmail}
              </label>
              <input
                id="invite-email"
                name="email"
                type="email"
                className="field"
                placeholder="friend@example.com"
                autoComplete="off"
                suppressHydrationWarning
              />
            </div>
            <ActionSubmitButton>{dict.lists.inviteButton}</ActionSubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
