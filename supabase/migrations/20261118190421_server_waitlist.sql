create table if not exists public.server_waitlist (
  email text primary key check (email = lower(btrim(email)) and length(email) <= 254),
  created_at timestamptz not null default now()
);

alter table public.server_waitlist enable row level security;
revoke all on public.server_waitlist from public, anon, authenticated;
grant select, insert on public.server_waitlist to service_role;
