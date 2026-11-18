create or replace function public.is_server_member(s_id uuid, req_role text default null)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.servers s
    where s.id = s_id and s.owner_id = auth.uid()
  ) or exists (
    select 1 from public.server_members m
    where m.server_id = s_id and m.user_id = auth.uid()
      and m.role in ('admin', 'operator', 'viewer')
      and (
        req_role is null or req_role = 'viewer'
        or (req_role = 'operator' and m.role in ('admin', 'operator'))
        or (req_role = 'admin' and m.role = 'admin')
      )
  );
$$;

drop policy if exists "Admins and Owners can manage members" on public.server_members;
drop policy if exists "Operators and above can queue commands" on public.server_commands;
drop policy if exists "Members can view commands" on public.server_commands;
create policy "Administrators can view commands" on public.server_commands
  for select to authenticated using (public.is_server_member(server_id, 'admin'));
drop policy if exists "Owners can update servers" on public.servers;
drop policy if exists "Allow insert profile on signup" on public.profiles;
revoke insert on public.profiles from public, anon, authenticated;
drop policy if exists "Users can view profile" on public.profiles;
create policy "View own profile and server teammates" on public.profiles
  for select to authenticated using (
    id = (select auth.uid()) or exists (
      select 1 from public.server_members m
      where m.user_id = profiles.id and public.is_server_member(m.server_id, 'owner')
    )
  );

revoke select on public.servers from public, anon, authenticated;
grant select (
  id, owner_id, name, device_name, android_version, minecraft_version, paper_build,
  geyser_version, status, pid, tps, agent_connected, last_heartbeat, uptime_seconds,
  max_players, online_players, local_ip, java_port, bedrock_port, public_tunnel_java,
  public_tunnel_bedrock, created_at, updated_at
) on public.servers to authenticated;

grant select on public.invitations, public.server_members, public.profiles,
  public.server_players, public.server_logs, public.server_metrics to authenticated;

drop policy if exists "Owners can view invitations" on public.invitations;
create policy "Owners can view invitations" on public.invitations
  for select to authenticated using (public.is_server_member(server_id, 'owner'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id, coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end;
$$;

insert into public.profiles (id, email, display_name, avatar_url)
select id, coalesce(email, ''), coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), raw_user_meta_data->>'avatar_url'
from auth.users on conflict (id) do nothing;

create or replace function public.manage_server_access(
  target_server uuid, operation text, target_id uuid default null,
  invite_email text default null, access_role text default null
)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  -- Lock the server so membership changes and invite redemption serialize.
  perform 1 from public.servers where id = target_server and owner_id = auth.uid() for update;
  if not found then
    raise exception 'Only the server owner can manage access.' using errcode = '42501';
  end if;

  if operation in ('invite', 'role') and
    (access_role is null or access_role not in ('admin', 'operator', 'viewer')) then
    raise exception 'Invalid access role.';
  end if;

  case operation
    when 'invite' then
      invite_email := lower(trim(invite_email));
      if invite_email is null or length(invite_email) > 254 or invite_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
        raise exception 'Enter a valid email address.';
      end if;
      delete from public.invitations
      where server_id = target_server and lower(invited_email) = invite_email;
      insert into public.invitations (server_id, invited_email, role, token, expires_at, created_by)
      values (target_server, invite_email, access_role, gen_random_uuid()::text, now() + interval '7 days', auth.uid());
    when 'cancel' then
      delete from public.invitations where server_id = target_server and id = target_id;
    when 'role' then
      update public.server_members set role = access_role, custom_permissions = array[]::text[]
      where server_id = target_server and id = target_id and role <> 'owner' and user_id <> auth.uid();
    when 'remove' then
      delete from public.server_members
      where server_id = target_server and id = target_id and role <> 'owner' and user_id <> auth.uid();
    else
      raise exception 'Invalid access operation.';
  end case;
end;
$$;

create or replace function public.accept_server_invitation(invite_token text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  invite public.invitations%rowtype;
  server_owner uuid;
  verified_email text;
begin
  select lower(email) into verified_email from auth.users
  where id = auth.uid() and email_confirmed_at is not null;

  select s.owner_id into server_owner from public.servers s
  join public.invitations i on i.server_id = s.id
  where i.token = invite_token for update of s;

  select * into invite from public.invitations
  where token = invite_token and expires_at > now()
    and lower(invited_email) = verified_email;

  if not found or server_owner is null then
    raise exception 'This invitation is expired, revoked, or addressed to another email.';
  end if;

  if server_owner <> auth.uid() then
    insert into public.server_members (server_id, user_id, role, joined_at)
    values (invite.server_id, auth.uid(), invite.role, now())
    on conflict (server_id, user_id) do nothing;
  end if;

  delete from public.invitations where id = invite.id;
  return invite.server_id;
end;
$$;

revoke all on function public.manage_server_access(uuid, text, uuid, text, text) from public, anon;
revoke all on function public.accept_server_invitation(text) from public, anon;
grant execute on function public.manage_server_access(uuid, text, uuid, text, text) to authenticated;
grant execute on function public.accept_server_invitation(text) to authenticated;
