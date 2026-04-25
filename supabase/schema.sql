create extension if not exists "pgcrypto";

create table if not exists public.restaurant_lists (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_personal boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.list_memberships (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.restaurant_lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  status text not null default 'accepted' check (status in ('accepted')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (list_id, user_id)
);

create table if not exists public.list_invitations (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.restaurant_lists(id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (list_id, email)
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid not null references public.restaurant_lists(id) on delete cascade,
  google_place_id text,
  google_maps_url text,
  name text not null,
  category text not null,
  cuisine_type text,
  opening_hours jsonb,
  rating numeric(2, 1),
  price_level integer check (price_level between 1 and 5),
  visit_count integer not null default 0,
  last_visited timestamptz,
  notes text,
  is_favorite boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists restaurants_user_id_idx on public.restaurants(user_id);
create index if not exists restaurants_list_id_idx on public.restaurants(list_id);
create index if not exists restaurants_created_at_idx on public.restaurants(created_at desc);
create index if not exists restaurants_category_idx on public.restaurants(category);
create index if not exists restaurants_cuisine_type_idx on public.restaurants(cuisine_type);
create index if not exists restaurants_tags_gin_idx on public.restaurants using gin(tags);
create index if not exists restaurant_lists_created_by_idx on public.restaurant_lists(created_by);
create unique index if not exists restaurant_lists_personal_owner_uidx
  on public.restaurant_lists(created_by)
  where is_personal = true;
create index if not exists list_memberships_list_id_idx on public.list_memberships(list_id);
create index if not exists list_memberships_user_id_idx on public.list_memberships(user_id);
create index if not exists list_invitations_email_idx on public.list_invitations(email);

create or replace function public.handle_restaurants_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists restaurants_set_updated_at on public.restaurants;
create trigger restaurants_set_updated_at
before update on public.restaurants
for each row
execute function public.handle_restaurants_updated_at();

create or replace function public.handle_restaurant_lists_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_restaurant_list()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.list_memberships (list_id, user_id, role, status)
  values (new.id, new.created_by, 'owner', 'accepted')
  on conflict (list_id, user_id) do update
  set role = 'owner',
      status = 'accepted';

  return new;
end;
$$;

create or replace function public.is_list_member(target_list_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.list_memberships
    where list_id = target_list_id
      and user_id = target_user_id
  );
$$;

create or replace function public.is_list_owner(target_list_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.list_memberships
    where list_id = target_list_id
      and user_id = target_user_id
      and role = 'owner'
  );
$$;

drop trigger if exists restaurant_lists_set_updated_at on public.restaurant_lists;
create trigger restaurant_lists_set_updated_at
before update on public.restaurant_lists
for each row
execute function public.handle_restaurant_lists_updated_at();

drop trigger if exists restaurant_lists_create_owner_membership on public.restaurant_lists;
create trigger restaurant_lists_create_owner_membership
after insert on public.restaurant_lists
for each row
execute function public.handle_new_restaurant_list();

alter table public.restaurant_lists enable row level security;
alter table public.list_memberships enable row level security;
alter table public.list_invitations enable row level security;
alter table public.restaurants enable row level security;

drop policy if exists "Users can view accessible lists" on public.restaurant_lists;
create policy "Users can view accessible lists"
on public.restaurant_lists
for select
using (created_by = auth.uid() or public.is_list_member(id, auth.uid()));

drop policy if exists "Users can create lists" on public.restaurant_lists;
create policy "Users can create lists"
on public.restaurant_lists
for insert
with check (created_by = auth.uid());

drop policy if exists "Owners can update lists" on public.restaurant_lists;
create policy "Owners can update lists"
on public.restaurant_lists
for update
using (created_by = auth.uid() or public.is_list_owner(id, auth.uid()))
with check (created_by = auth.uid() or public.is_list_owner(id, auth.uid()));

drop policy if exists "Users can view memberships for accessible lists" on public.list_memberships;
create policy "Users can view memberships for accessible lists"
on public.list_memberships
for select
using (public.is_list_member(list_id, auth.uid()));

drop policy if exists "Owners can insert memberships" on public.list_memberships;
create policy "Owners can insert memberships"
on public.list_memberships
for insert
with check (
  public.is_list_owner(list_id, auth.uid())
  or exists (
    select 1
    from public.restaurant_lists
    where restaurant_lists.id = list_memberships.list_id
      and restaurant_lists.created_by = auth.uid()
  )
);

drop policy if exists "Users can view invitations for their lists or email" on public.list_invitations;
create policy "Users can view invitations for their lists or email"
on public.list_invitations
for select
using (
  public.is_list_member(list_id, auth.uid())
  or lower(list_invitations.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Owners can create invitations" on public.list_invitations;
create policy "Owners can create invitations"
on public.list_invitations
for insert
with check (
  invited_by = auth.uid()
  and public.is_list_owner(list_id, auth.uid())
);

drop policy if exists "Owners can update invitations" on public.list_invitations;
create policy "Owners can update invitations"
on public.list_invitations
for update
using (
  public.is_list_owner(list_id, auth.uid())
  or lower(list_invitations.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  public.is_list_owner(list_id, auth.uid())
  or lower(list_invitations.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Users can accept memberships from invitations" on public.list_memberships;
create policy "Users can accept memberships from invitations"
on public.list_memberships
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.list_invitations
    where list_invitations.list_id = list_memberships.list_id
      and lower(list_invitations.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and list_invitations.status = 'pending'
  )
);

drop policy if exists "Users can view restaurants in their lists" on public.restaurants;
create policy "Users can view restaurants in their lists"
on public.restaurants
for select
using (public.is_list_member(list_id, auth.uid()));

drop policy if exists "Users can insert restaurants in their lists" on public.restaurants;
create policy "Users can insert restaurants in their lists"
on public.restaurants
for insert
with check (
  user_id = auth.uid()
  and public.is_list_member(list_id, auth.uid())
);

drop policy if exists "Users can update restaurants in their lists" on public.restaurants;
create policy "Users can update restaurants in their lists"
on public.restaurants
for update
using (public.is_list_member(list_id, auth.uid()))
with check (public.is_list_member(list_id, auth.uid()));

drop policy if exists "Users can delete restaurants in their lists" on public.restaurants;
create policy "Users can delete restaurants in their lists"
on public.restaurants
for delete
using (public.is_list_member(list_id, auth.uid()));
