alter table public.notes
  add column if not exists is_pinned boolean not null default false;
