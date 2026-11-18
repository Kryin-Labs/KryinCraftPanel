alter table public.profiles add column if not exists username text
  check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$');
create unique index if not exists profiles_panel_username_idx on public.profiles (username) where username is not null;

revoke update on public.profiles from public, anon, authenticated;
revoke update (username) on public.profiles from public, anon, authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

alter table public.server_members add column if not exists permission_overrides text[];

create or replace function public.claim_panel_username(candidate text)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  normalized text := lower(btrim(candidate));
  saved text;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if normalized is null or normalized !~ '^[a-z0-9][a-z0-9_-]{2,29}$' then
    raise exception 'Use 3–30 letters, numbers, hyphens or underscores, starting with a letter or number.';
  end if;
  update public.profiles set username = normalized where id = auth.uid() and username is null
  returning username into saved;
  if saved is null then
    select username into saved from public.profiles where id = auth.uid();
  end if;
  if saved is null then raise exception 'Profile is unavailable.'; end if;
  return saved;
exception when unique_violation then
  raise exception 'That username is already taken.';
end;
$$;

create or replace function public.panel_permissions()
returns text[] language sql immutable set search_path = ''
as $$
  select array['start', 'stop_restart', 'console', 'logs', 'players', 'settings', 'files']::text[];
$$;

create or replace function public.server_permissions(target_server uuid)
returns text[] language sql stable security definer set search_path = ''
as $$
  select case
    when s.owner_id = auth.uid() then public.panel_permissions()
    when m.permission_overrides is not null then m.permission_overrides
    when m.role = 'admin' then public.panel_permissions()
    when m.role = 'operator' then array['start', 'stop_restart', 'logs', 'players']::text[]
    when m.role = 'viewer' then array['logs', 'players']::text[]
    else array[]::text[]
  end
  from public.servers s left join public.server_members m
    on m.server_id = s.id and m.user_id = auth.uid()
  where s.id = target_server;
$$;

create or replace function public.has_server_permission(target_server uuid, permission text)
returns boolean language sql stable set search_path = ''
as $$
  select coalesce(permission = any(public.server_permissions(target_server)), false);
$$;

create or replace function public.find_server_share_user(target_server uuid, candidate text)
returns table(username text, display_name text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_server_member(target_server, 'owner') then raise insufficient_privilege; end if;
  return query select p.username, p.display_name from public.profiles p
  where p.username = lower(btrim(candidate)) and p.id <> auth.uid();
end;
$$;

create or replace function public.share_server_with_user(target_server uuid, candidate text, permissions text[])
returns void language plpgsql security definer set search_path = ''
as $$
declare
  recipient uuid;
begin
  perform 1 from public.servers where id = target_server and owner_id = auth.uid() for update;
  if not found then raise insufficient_privilege; end if;
  if permissions is null or not permissions <@ public.panel_permissions() then
    raise exception 'Invalid permissions.';
  end if;
  select p.id into recipient from public.profiles p where p.username = lower(btrim(candidate));
  if recipient is null or recipient = auth.uid() then raise exception 'Choose another existing username.'; end if;
  insert into public.server_members (server_id, user_id, role, joined_at, permission_overrides)
  values (target_server, recipient, 'viewer', now(), permissions)
  on conflict (server_id, user_id) do update
    set role = 'viewer', permission_overrides = excluded.permission_overrides;
end;
$$;

-- Preserve legacy email invitations and role editing, including restoring a role's defaults.
create or replace function public.reset_panel_role_permissions()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.role is distinct from old.role and new.permission_overrides is not distinct from old.permission_overrides then
    new.permission_overrides := null;
  end if;
  return new;
end;
$$;
drop trigger if exists reset_panel_role_permissions on public.server_members;
create trigger reset_panel_role_permissions before update on public.server_members
  for each row execute function public.reset_panel_role_permissions();

drop policy if exists "Members can view logs" on public.server_logs;
create policy "Members with log access can view logs" on public.server_logs
  for select to authenticated using (
    public.has_server_permission(server_id, 'logs') or public.has_server_permission(server_id, 'console')
  );
drop policy if exists "Members can view players" on public.server_players;
create policy "Members with player access can view players" on public.server_players
  for select to authenticated using (
    public.has_server_permission(server_id, 'players')
  );
drop policy if exists "Administrators can view commands" on public.server_commands;
create policy "Owners can view commands" on public.server_commands
  for select to authenticated using (public.is_server_member(server_id, 'owner'));

revoke all on function public.claim_panel_username(text), public.find_server_share_user(uuid,text),
  public.share_server_with_user(uuid,text,text[]), public.server_permissions(uuid),
  public.has_server_permission(uuid,text) from public, anon;
grant execute on function public.claim_panel_username(text), public.find_server_share_user(uuid,text),
  public.share_server_with_user(uuid,text,text[]), public.server_permissions(uuid),
  public.has_server_permission(uuid,text) to authenticated;
