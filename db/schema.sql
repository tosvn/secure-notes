create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (btrim(title) <> ''),
  body text not null default '',
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_id_created_at_idx
  on public.notes (user_id, created_at desc);

alter table public.notes enable row level security;

grant select, insert, update, delete on table public.notes to authenticated;

create policy notes_select
  on public.notes
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy notes_insert
  on public.notes
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy notes_update
  on public.notes
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy notes_delete
  on public.notes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));