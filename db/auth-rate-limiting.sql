create table if not exists public.login_rate_limits (
  email_hash text primary key check (email_hash ~ '^[0-9a-f]{64}$'),
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  cooldown_until timestamptz,
  reset_required boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists login_rate_limits_updated_at_idx
  on public.login_rate_limits (updated_at);

alter table public.login_rate_limits enable row level security;

revoke all on table public.login_rate_limits from public, anon, authenticated;
grant all on table public.login_rate_limits to service_role;

create or replace function public.check_login_rate_limit(p_email_hash text)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  requires_password_reset boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_limit public.login_rate_limits%rowtype;
begin
  if p_email_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid email hash';
  end if;

  select *
    into v_limit
    from public.login_rate_limits
    where email_hash = p_email_hash;

  if not found then
    return query select true, 0, false;
  elsif v_limit.reset_required then
    return query select false, 0, true;
  elsif v_limit.cooldown_until > clock_timestamp() then
    return query
      select false,
        greatest(1, ceil(extract(epoch from (v_limit.cooldown_until - clock_timestamp())))::integer),
        false;
  else
    return query select true, 0, false;
  end if;
end;
$$;

create or replace function public.record_login_failure(p_email_hash text)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  requires_password_reset boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_failed_attempts integer;
  v_cooldown_until timestamptz;
  v_reset_required boolean;
begin
  if p_email_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid email hash';
  end if;

  delete from public.login_rate_limits
    where updated_at < clock_timestamp() - interval '90 days';

  insert into public.login_rate_limits (email_hash, failed_attempts)
    values (p_email_hash, 1)
    on conflict (email_hash) do update
      set failed_attempts = public.login_rate_limits.failed_attempts + 1,
          updated_at = clock_timestamp()
    returning failed_attempts into v_failed_attempts;

  if v_failed_attempts >= 6 then
    update public.login_rate_limits
      set reset_required = true,
          cooldown_until = null,
          updated_at = clock_timestamp()
      where email_hash = p_email_hash;
  elsif v_failed_attempts = 3 then
    update public.login_rate_limits
      set cooldown_until = clock_timestamp() + interval '10 seconds',
          updated_at = clock_timestamp()
      where email_hash = p_email_hash;
  end if;

  select cooldown_until, reset_required
    into v_cooldown_until, v_reset_required
    from public.login_rate_limits
    where email_hash = p_email_hash;

  if v_reset_required then
    return query select false, 0, true;
  elsif v_cooldown_until > clock_timestamp() then
    return query
      select false,
        greatest(1, ceil(extract(epoch from (v_cooldown_until - clock_timestamp())))::integer),
        false;
  else
    return query select true, 0, false;
  end if;
end;
$$;

create or replace function public.clear_login_rate_limit(p_email_hash text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_email_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid email hash';
  end if;

  delete from public.login_rate_limits where email_hash = p_email_hash;
end;
$$;

revoke all on function public.check_login_rate_limit(text) from public, anon, authenticated;
revoke all on function public.record_login_failure(text) from public, anon, authenticated;
revoke all on function public.clear_login_rate_limit(text) from public, anon, authenticated;

grant execute on function public.check_login_rate_limit(text) to service_role;
grant execute on function public.record_login_failure(text) to service_role;
grant execute on function public.clear_login_rate_limit(text) to service_role;

notify pgrst, 'reload schema';
