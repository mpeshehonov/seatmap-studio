create extension if not exists pgcrypto;

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.halls (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seat_maps (
  id uuid primary key default gen_random_uuid(),
  hall_id uuid not null unique references public.halls(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  map_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  hall_id uuid references public.halls(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  starts_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seat_statuses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  hall_id uuid not null references public.halls(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  seat_id text not null,
  status text not null check (status in ('available', 'held', 'sold')),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (event_id, hall_id, seat_id)
);

create table public.event_seat_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  hall_id uuid not null references public.halls(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  seat_id text not null,
  category text not null check (category in ('standard', 'vip', 'accessible')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, seat_id)
);

create index venues_owner_id_idx on public.venues(owner_id);
create index halls_owner_id_idx on public.halls(owner_id);
create index halls_venue_id_idx on public.halls(venue_id);
create index seat_maps_owner_id_idx on public.seat_maps(owner_id);
create index events_hall_id_idx on public.events(hall_id);
create index events_owner_id_idx on public.events(owner_id);
create index seat_statuses_hall_id_idx on public.seat_statuses(hall_id);
create index seat_statuses_event_id_idx on public.seat_statuses(event_id);
create index seat_statuses_owner_id_idx on public.seat_statuses(owner_id);
create index event_seat_categories_event_id_idx on public.event_seat_categories(event_id);
create index event_seat_categories_hall_id_idx on public.event_seat_categories(hall_id);
create index event_seat_categories_owner_id_idx on public.event_seat_categories(owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger venues_set_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

create trigger halls_set_updated_at
before update on public.halls
for each row execute function public.set_updated_at();

create trigger seat_maps_set_updated_at
before update on public.seat_maps
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger seat_statuses_set_updated_at
before update on public.seat_statuses
for each row execute function public.set_updated_at();

create trigger event_seat_categories_set_updated_at
before update on public.event_seat_categories
for each row execute function public.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.halls enable row level security;
alter table public.seat_maps enable row level security;
alter table public.events enable row level security;
alter table public.seat_statuses enable row level security;
alter table public.event_seat_categories enable row level security;

create policy "Users can read own profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy "Users can upsert own profile"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()));

create policy "Users can read own venues"
on public.venues for select to authenticated
using (owner_id = (select auth.uid()));

create policy "Users can create own venues"
on public.venues for insert to authenticated
with check (owner_id = (select auth.uid()));

create policy "Users can update own venues"
on public.venues for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "Users can delete own venues"
on public.venues for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "Authenticated users can read accessible halls"
on public.halls for select to authenticated
using (owner_id = (select auth.uid()) or is_published = true);

create policy "Public can read published halls"
on public.halls for select to anon
using (is_published = true);

create policy "Users can create own halls"
on public.halls for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.venues
    where venues.id = halls.venue_id
      and venues.owner_id = (select auth.uid())
  )
);

create policy "Users can update own halls"
on public.halls for update to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.venues
    where venues.id = halls.venue_id
      and venues.owner_id = (select auth.uid())
  )
);

create policy "Users can delete own halls"
on public.halls for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "Authenticated users can read accessible seat maps"
on public.seat_maps for select to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.halls
    where halls.id = seat_maps.hall_id
      and halls.is_published = true
  )
);

create policy "Public can read published seat maps"
on public.seat_maps for select to anon
using (
  exists (
    select 1
    from public.halls
    where halls.id = seat_maps.hall_id
      and halls.is_published = true
  )
);

create policy "Users can create own seat maps"
on public.seat_maps for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.halls
    where halls.id = seat_maps.hall_id
      and halls.owner_id = (select auth.uid())
  )
);

create policy "Users can update own seat maps"
on public.seat_maps for update to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.halls
    where halls.id = seat_maps.hall_id
      and halls.owner_id = (select auth.uid())
  )
);

create policy "Users can delete own seat maps"
on public.seat_maps for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "Users can manage own events"
on public.events for all to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and (
    hall_id is null
    or exists (
      select 1
      from public.halls
      where halls.id = events.hall_id
        and halls.owner_id = (select auth.uid())
    )
  )
);

create policy "Authenticated users can read accessible seat statuses"
on public.seat_statuses for select to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.halls
    where halls.id = seat_statuses.hall_id
      and halls.is_published = true
  )
);

create policy "Public can read statuses for published halls"
on public.seat_statuses for select to anon
using (
  exists (
    select 1
    from public.halls
    where halls.id = seat_statuses.hall_id
      and halls.is_published = true
  )
);

create policy "Users can create own seat statuses"
on public.seat_statuses for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.halls
    where halls.id = seat_statuses.hall_id
      and halls.owner_id = (select auth.uid())
  )
  and (
    event_id is null
    or exists (
      select 1
      from public.events
      where events.id = seat_statuses.event_id
        and events.hall_id = seat_statuses.hall_id
        and events.owner_id = (select auth.uid())
    )
  )
);

create policy "Users can update own seat statuses"
on public.seat_statuses for update to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.halls
    where halls.id = seat_statuses.hall_id
      and halls.owner_id = (select auth.uid())
  )
  and (
    event_id is null
    or exists (
      select 1
      from public.events
      where events.id = seat_statuses.event_id
        and events.hall_id = seat_statuses.hall_id
        and events.owner_id = (select auth.uid())
    )
  )
);

create policy "Users can delete own seat statuses"
on public.seat_statuses for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "Users can read own event seat categories"
on public.event_seat_categories for select to authenticated
using (owner_id = (select auth.uid()));

create policy "Users can create own event seat categories"
on public.event_seat_categories for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.events
    where events.id = event_seat_categories.event_id
      and events.owner_id = (select auth.uid())
      and events.hall_id = event_seat_categories.hall_id
  )
  and exists (
    select 1
    from public.halls
    where halls.id = event_seat_categories.hall_id
      and halls.owner_id = (select auth.uid())
  )
);

create policy "Users can update own event seat categories"
on public.event_seat_categories for update to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.events
    where events.id = event_seat_categories.event_id
      and events.owner_id = (select auth.uid())
      and events.hall_id = event_seat_categories.hall_id
  )
  and exists (
    select 1
    from public.halls
    where halls.id = event_seat_categories.hall_id
      and halls.owner_id = (select auth.uid())
  )
);

create policy "Users can delete own event seat categories"
on public.event_seat_categories for delete to authenticated
using (owner_id = (select auth.uid()));
