-- Claim each command once even if an agent has overlapping requests.
create or replace function public.claim_device_commands(target_server uuid)
returns setof public.server_commands
language sql
set search_path = ''
as $$
  with pending as (
    select id
    from public.server_commands
    where server_id = target_server and status = 'PENDING' and expires_at > now()
    order by created_at, id
    limit 10
    for update skip locked
  ), claimed as (
    update public.server_commands as command
    set status = 'FETCHED'
    from pending
    where command.id = pending.id
    returning command.*
  )
  select * from claimed order by created_at, id;
$$;

revoke all on function public.claim_device_commands(uuid) from public, anon, authenticated;
grant execute on function public.claim_device_commands(uuid) to service_role;
