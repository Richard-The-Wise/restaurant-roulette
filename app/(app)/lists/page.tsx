import { acceptInvitationAction, createListAction, inviteToListAction } from "@/app/(app)/lists/actions";
import { ActionSubmitButton } from "@/components/action-submit-button";
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

  return (
    <div className="space-y-6">
      <section className="shell-panel px-5 py-5 sm:px-8 sm:py-6">
        <SectionHeading eyebrow={dict.nav.lists} title={dict.lists.title} description={dict.lists.description} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="surface-panel px-5 py-5 sm:px-6 sm:py-6">
            <h2 className="text-xl font-semibold text-slate-950">{dict.lists.activeList}</h2>
            <div className="mt-5 grid gap-4">
              {lists.map((list) => {
                const membership = memberships.find((item) => item.list_id === list.id);
                const membersCount = allMemberships?.filter((item) => item.list_id === list.id).length ?? 0;

                return (
                  <article key={list.id} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-950">{list.name}</h3>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {list.is_personal ? dict.lists.personalBadge : dict.lists.groupBadge}
                          </span>
                          {activeList?.id === list.id ? (
                            <span className="rounded-full bg-aurora-50 px-3 py-1 text-xs font-medium text-aurora-700">
                              {dict.lists.activeList}
                            </span>
                          ) : null}
                        </div>
                        {list.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{list.description}</p> : null}
                        <p className="mt-2 text-sm text-slate-500">
                          {membersCount} {dict.lists.members} - {membership?.role === "owner" ? dict.lists.owner : dict.lists.member}
                        </p>
                      </div>
                      <a
                        href={`/api/active-list?listId=${list.id}&redirect=/lists`}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {dict.lists.switchList}
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

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
                      <form action={acceptInvitationAction}>
                        <input type="hidden" name="invitation_id" value={invitation.id} />
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
          <form action={createListAction} className="surface-panel space-y-4 px-5 py-5 sm:px-6 sm:py-6">
            <h2 className="text-xl font-semibold text-slate-950">{dict.lists.createTitle}</h2>
            <div>
              <label className="label" htmlFor="list-name">
                {dict.lists.createName}
              </label>
              <input id="list-name" name="name" className="field" />
            </div>
            <div>
              <label className="label" htmlFor="list-description">
                {dict.lists.createDescription}
              </label>
              <textarea id="list-description" name="description" className="field min-h-24 resize-y" />
            </div>
            <ActionSubmitButton>{dict.lists.createButton}</ActionSubmitButton>
          </form>

          <form action={inviteToListAction} className="surface-panel space-y-4 px-5 py-5 sm:px-6 sm:py-6">
            <h2 className="text-xl font-semibold text-slate-950">{dict.lists.inviteTitle}</h2>
            <div>
              <label className="label" htmlFor="invite-list">
                {dict.lists.inviteList}
              </label>
              <select id="invite-list" name="list_id" className="field" defaultValue={activeList?.id ?? lists[0]?.id}>
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
              <input id="invite-email" name="email" type="email" className="field" placeholder="friend@example.com" />
            </div>
            <ActionSubmitButton>{dict.lists.inviteButton}</ActionSubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
