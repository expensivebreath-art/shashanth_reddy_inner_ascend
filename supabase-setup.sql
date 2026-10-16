-- Ascend: one shared tracker record for all browsers, with no login.
-- Run once in Supabase SQL Editor for the project in supabase-config.js.
-- All visitors using this public site share the same data record (id = 1).
create table if not exists public.shared_tracker_state (
  id integer primary key check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.shared_tracker_state enable row level security;

drop policy if exists "Public can read shared tracker" on public.shared_tracker_state;
create policy "Public can read shared tracker"
  on public.shared_tracker_state for select to anon, authenticated
  using (id = 1);

drop policy if exists "Public can create shared tracker" on public.shared_tracker_state;
create policy "Public can create shared tracker"
  on public.shared_tracker_state for insert to anon, authenticated
  with check (id = 1);

drop policy if exists "Public can update shared tracker" on public.shared_tracker_state;
create policy "Public can update shared tracker"
  on public.shared_tracker_state for update to anon, authenticated
  using (id = 1)
  with check (id = 1);

grant select, insert, update on public.shared_tracker_state to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shared_tracker_state'
  ) then
    alter publication supabase_realtime add table public.shared_tracker_state;
  end if;
end $$;
