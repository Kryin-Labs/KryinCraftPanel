-- ==============================================================================
-- KryinCraftPanel: Database Schema & Row Level Security (RLS)
-- Environment: Supabase PostgreSQL (Targeting ROG Phone 5s Termux Server)
-- ==============================================================================

-- Enable pgcrypto for UUIDs and token hashing
create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE (Extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SERVERS TABLE
create table if not exists public.servers (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Kryin Paper Server',
  device_name text default 'ASUS ROG Phone 5s',
  android_version text default 'Android 13 (Termux)',
  minecraft_version text default '26.3',
  paper_build integer default 249,
  geyser_version text default '2.12.1-b1302',
  status text not null default 'offline' check (status in ('online', 'offline', 'starting', 'stopping')),
  pid integer,
  tps numeric(4,2) default 20.00,
  agent_token_hash text not null, -- SHA-256 hash of agent bearer token
  agent_connected boolean default false,
  last_heartbeat timestamp with time zone,
  uptime_seconds bigint default 0,
  max_players integer default 20,
  online_players integer default 0,
  local_ip text default '192.168.0.164',
  java_port integer default 25565,
  bedrock_port integer default 19132,
  public_tunnel_java text,
  public_tunnel_bedrock text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SERVER MEMBERS TABLE (Role-Based Access Control)
create table if not exists public.server_members (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'viewer' check (role in ('owner', 'admin', 'operator', 'viewer')),
  custom_permissions text[] default array[]::text[],
  invited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  joined_at timestamp with time zone,
  unique (server_id, user_id)
);

-- 4. INVITATIONS TABLE
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  invited_email text not null,
  role text not null check (role in ('admin', 'operator', 'viewer')),
  custom_permissions text[] default array[]::text[],
  token text unique not null,
  expires_at timestamp with time zone not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. HARDWARE METRICS TABLE (Timeseries batch data from ROG 5s)
create table if not exists public.server_metrics (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  total_ram_mb integer not null,
  used_ram_mb integer not null,
  available_ram_mb integer not null,
  java_heap_used_mb integer not null,
  java_heap_max_mb integer not null,
  cpu_usage_percent numeric(5,2) not null,
  cpu_temp_c numeric(4,1), -- null if unavailable on Android 13
  battery_percent integer not null,
  battery_temp_c numeric(4,1),
  is_charging boolean not null default false,
  power_source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on metrics timestamp & server_id for fast dashboard graph queries
create index if not exists idx_server_metrics_server_time on public.server_metrics(server_id, created_at desc);

-- 6. PLAYERS TABLE
create table if not exists public.server_players (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  uuid text not null,
  username text not null,
  is_online boolean default false,
  ping_ms integer default 0,
  health numeric(4,1) default 20.0,
  max_health numeric(4,1) default 20.0,
  food_level integer default 20,
  saturation numeric(4,1) default 5.0,
  xp_level integer default 0,
  xp_progress numeric(4,2) default 0.0,
  gamemode text default 'survival' check (gamemode in ('survival', 'creative', 'adventure', 'spectator')),
  is_op boolean default false,
  is_whitelisted boolean default false,
  is_banned boolean default false,
  coordinates jsonb default '{"x": 0, "y": 64, "z": 0, "world": "world", "dimension": "minecraft:overworld"}'::jsonb,
  inventory jsonb default '{}'::jsonb,
  statistics jsonb default '{}'::jsonb,
  ip_address text,
  last_seen text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (server_id, uuid)
);

create index if not exists idx_server_players_server_online on public.server_players(server_id, is_online);

-- 7. COMMANDS QUEUE TABLE
create table if not exists public.server_commands (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  requested_by uuid references public.profiles(id) on delete set null,
  command_type text not null check (command_type in ('START', 'STOP', 'RESTART', 'CONSOLE_CMD', 'PLAYER_ACTION', 'CONFIG_UPDATE')),
  payload jsonb default '{}'::jsonb,
  status text not null default 'PENDING' check (status in ('PENDING', 'FETCHED', 'EXECUTED', 'FAILED', 'EXPIRED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  executed_at timestamp with time zone,
  result jsonb
);

create index if not exists idx_server_commands_queue on public.server_commands(server_id, status, created_at asc);

-- 8. CONSOLE LOGS TABLE (Bounded server logs stream)
create table if not exists public.server_logs (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  timestamp text not null,
  level text not null default 'INFO' check (level in ('INFO', 'WARN', 'ERROR', 'DEBUG')),
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_server_logs_server_time on public.server_logs(server_id, created_at desc);

-- 9. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  user_email text not null,
  action text not null,
  target text,
  status text not null default 'success',
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_audit_logs_server_time on public.audit_logs(server_id, created_at desc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.servers enable row level security;
alter table public.server_members enable row level security;
alter table public.invitations enable row level security;
alter table public.server_metrics enable row level security;
alter table public.server_players enable row level security;
alter table public.server_commands enable row level security;
alter table public.server_logs enable row level security;
alter table public.audit_logs enable row level security;

-- Helper security function: Check user server membership
create or replace function public.is_server_member(s_id uuid, req_role text default null)
returns boolean as $$
begin
  return exists (
    select 1 from public.server_members sm
    where sm.server_id = s_id
      and sm.user_id = auth.uid()
      and (
        req_role is null or
        sm.role = 'owner' or
        (req_role = 'admin' and sm.role in ('owner', 'admin')) or
        (req_role = 'operator' and sm.role in ('owner', 'admin', 'operator')) or
        (req_role = 'viewer')
      )
  );
end;
$$ language plpgsql security definer;

-- Profiles Policies
create policy "Users can view profile" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Servers Policies
create policy "Members can view servers" on public.servers
  for select using (public.is_server_member(id));

create policy "Owners can update servers" on public.servers
  for update using (public.is_server_member(id, 'owner'));

-- Server Members Policies
create policy "Members can view other server members" on public.server_members
  for select using (public.is_server_member(server_id));

create policy "Admins and Owners can manage members" on public.server_members
  for all using (public.is_server_member(server_id, 'admin'));

-- Metrics & Logs Policies (Read-only to server members)
create policy "Members can view metrics" on public.server_metrics
  for select using (public.is_server_member(server_id));

create policy "Members can view logs" on public.server_logs
  for select using (public.is_server_member(server_id));

-- Players Policies
create policy "Members can view players" on public.server_players
  for select using (public.is_server_member(server_id));

-- Commands Policies
create policy "Operators and above can queue commands" on public.server_commands
  for insert with check (public.is_server_member(server_id, 'operator'));

create policy "Members can view commands" on public.server_commands
  for select using (public.is_server_member(server_id));

-- Audit Logs Policies
create policy "Members can view audit logs" on public.audit_logs
  for select using (public.is_server_member(server_id));

-- Auto-create profile trigger on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_server_id uuid;
begin
  -- 1. Create Profile
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- 2. If this is the first user and no servers exist, automatically provision the ROG Phone 5s server
  if not exists (select 1 from public.servers limit 1) then
    insert into public.servers (
      owner_id,
      name,
      device_name,
      android_version,
      minecraft_version,
      paper_build,
      geyser_version,
      status,
      max_players,
      local_ip,
      java_port,
      bedrock_port,
      agent_token_hash
    ) values (
      new.id,
      'Kryin Paper Server',
      'ASUS ROG Phone 5s',
      'Android 13 (Termux)',
      '26.3',
      249,
      '2.12.1-b1302',
      'offline',
      20,
      '192.168.0.164',
      25565,
      19132,
      encode(digest('kryin_agent_rog5s_token', 'sha256'), 'hex')
    )
    returning id into new_server_id;

    -- 3. Assign Owner role in server_members
    insert into public.server_members (
      server_id,
      user_id,
      role,
      custom_permissions,
      joined_at
    ) values (
      new_server_id,
      new.id,
      'owner',
      array['*'],
      timezone('utc'::text, now())
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
