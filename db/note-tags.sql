alter table public.notes
  add column if not exists tags text[] not null default '{}';
