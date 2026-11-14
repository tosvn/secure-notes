drop function if exists public.check_login_rate_limit(text);
drop function if exists public.record_login_failure(text);
drop function if exists public.clear_login_rate_limit(text);
drop table if exists public.login_rate_limits;
