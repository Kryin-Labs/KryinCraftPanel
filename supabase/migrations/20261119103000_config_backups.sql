create table public.server_backup_settings (
  server_id uuid primary key references public.servers(id) on delete cascade,
  backup_key_hash text unique,
  last_agent_seen timestamptz,
  startup_enabled boolean not null default false,
  drive_owner uuid references public.profiles(id) on delete set null,
  drive_connection uuid,
  drive_refresh text
);

create table public.server_config_backups (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  source text not null check (source in ('manual', 'startup')),
  startup_key text,
  status text not null default 'queued' check (status in ('queued', 'collecting', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  claim_id uuid,
  claim_until timestamptz,
  archive text,
  file_count integer,
  omitted_count integer,
  drive_connection uuid,
  drive_status text not null default 'local' check (drive_status in ('local', 'pending', 'saved', 'failed')),
  drive_file_id text,
  drive_attempts integer not null default 0,
  drive_next_attempt timestamptz not null default now(),
  unique (server_id, startup_key)
);

create index server_config_backups_recent_idx on public.server_config_backups (server_id, created_at desc);
create unique index server_config_backups_active_manual_idx on public.server_config_backups (server_id)
  where source = 'manual' and status in ('queued', 'collecting');
create unique index server_config_backups_active_startup_idx on public.server_config_backups (server_id)
  where source = 'startup' and status in ('queued', 'collecting');

alter table public.server_backup_settings enable row level security;
alter table public.server_config_backups enable row level security;
revoke all on public.server_backup_settings, public.server_config_backups from public, anon, authenticated;
grant select, insert, update, delete on public.server_backup_settings, public.server_config_backups to service_role;

create function public.claim_server_config_backup(target_server uuid, observed_startup text, expected_hash text)
returns table (backup_id uuid, lease_id uuid)
language plpgsql
set search_path = ''
as $$
declare
  settings public.server_backup_settings%rowtype;
begin
  select * into settings from public.server_backup_settings
  where server_id = target_server and backup_key_hash = expected_hash for update;
  if not found then return; end if;

  -- Refresh device presence without rewriting the row on every poll.
  if settings.last_agent_seen is null or settings.last_agent_seen < now() - interval '15 seconds' then
    update public.server_backup_settings set last_agent_seen = now() where server_id = target_server;
  end if;

  update public.server_config_backups
  set status = 'failed', completed_at = now()
  where server_id = target_server and status in ('queued', 'collecting')
    and created_at < now() - interval '5 minutes';

  if observed_startup is not null and settings.startup_enabled and settings.drive_refresh is not null
     and exists (select from public.servers where id = target_server and owner_id = settings.drive_owner) then
    insert into public.server_config_backups(server_id, source, startup_key)
    values (target_server, 'startup', observed_startup)
    on conflict do nothing;
  end if;

  return query
  with next_backup as (
    select id from public.server_config_backups
    where server_id = target_server
      and (source = 'manual' or (settings.startup_enabled and settings.drive_refresh is not null))
      and (status = 'queued' or (status = 'collecting' and claim_until < now()))
    order by created_at, id
    limit 1 for update skip locked
  )
  update public.server_config_backups as backup
  set status = 'collecting', claim_until = now() + interval '35 seconds', claim_id = gen_random_uuid()
  from next_backup
  where backup.id = next_backup.id
  returning backup.id, backup.claim_id;
end;
$$;

revoke all on function public.claim_server_config_backup(uuid, text, text) from public, anon, authenticated;
grant execute on function public.claim_server_config_backup(uuid, text, text) to service_role;

create function public.complete_server_config_backup(
  target_server uuid, target_backup uuid, target_lease uuid, target_hash text,
  archive_data text, included_files integer, omitted_files integer
) returns boolean
language plpgsql
set search_path = ''
as $$
declare
  current_connection uuid;
begin
  select case when settings.drive_owner = server.owner_id and settings.drive_refresh is not null
    then settings.drive_connection end into current_connection
  from public.server_backup_settings as settings
  join public.servers as server on server.id = settings.server_id
  where settings.server_id = target_server and settings.backup_key_hash = target_hash
  for update of settings;
  if not found then return false; end if;

  update public.server_config_backups
  set status = case when archive_data is null then 'failed' else 'ready' end,
    archive = archive_data, file_count = included_files, omitted_count = omitted_files,
    completed_at = now(), claim_id = null, claim_until = null,
    drive_connection = case when archive_data is not null then current_connection end,
    drive_status = case when archive_data is not null and current_connection is not null then 'pending' else 'local' end
  where id = target_backup and server_id = target_server and status = 'collecting'
    and claim_id = target_lease and claim_until >= now();
  if not found then return false; end if;
  if archive_data is not null then
    -- Keep recent ZIP downloads and retain startup keys for deduplication.
    update public.server_config_backups set archive = null
    where server_id = target_server and archive is not null and drive_status <> 'pending'
      and id not in (
        select id from public.server_config_backups
        where server_id = target_server and status = 'ready' and archive is not null
        order by created_at desc, id desc limit 20
      );
  end if;
  return true;
end;
$$;

revoke all on function public.complete_server_config_backup(uuid, uuid, uuid, text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.complete_server_config_backup(uuid, uuid, uuid, text, text, integer, integer) to service_role;

create function public.disconnect_server_backup_drive(target_server uuid, target_owner uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.server_backup_settings
  set drive_refresh = null, drive_owner = null, drive_connection = null, startup_enabled = false
  where server_id = target_server and drive_owner = target_owner;
  if found then
    update public.server_config_backups set drive_status = 'local'
    where server_id = target_server and drive_status = 'pending';
  end if;
end;
$$;

revoke all on function public.disconnect_server_backup_drive(uuid, uuid) from public, anon, authenticated;
grant execute on function public.disconnect_server_backup_drive(uuid, uuid) to service_role;
