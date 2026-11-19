alter table public.server_commands
  add column delivery_attempts smallint not null default 1 check (delivery_attempts in (1, 2));

create function public.enqueue_panel_command(
  command_id uuid, target_server uuid, requester uuid,
  kind text, command_payload jsonb, retry_window boolean
)
returns table (id uuid, status text, expires_at timestamptz, created_at timestamptz, inserted boolean)
language plpgsql
set search_path = ''
as $$
declare
  job public.server_commands%rowtype;
  new_job boolean;
begin
  insert into public.server_commands as queued (
    id, server_id, requested_by, command_type, payload, expires_at, delivery_attempts
  ) values (
    command_id, target_server, requester, kind, command_payload,
    clock_timestamp() + interval '10 seconds', case when retry_window then 2 else 1 end
  )
  on conflict on constraint server_commands_pkey do nothing
  returning queued.* into job;

  new_job := found;
  if not new_job then
    select * into job from public.server_commands as queued where queued.id = command_id for update;
    if not found or job.server_id is distinct from target_server or job.requested_by is distinct from requester
       or job.command_type is distinct from kind or job.payload is distinct from command_payload then
      return;
    end if;

    -- Extend the same pending row. The agent's atomic claim and this row lock prevent a second execution.
    if retry_window and job.status = 'PENDING' and job.delivery_attempts = 1
       and job.created_at >= clock_timestamp() - interval '25 seconds' then
      update public.server_commands as queued
      set expires_at = clock_timestamp() + interval '10 seconds', delivery_attempts = 2
      where queued.id = command_id
      returning queued.* into job;
    end if;
  end if;

  return query select job.id, job.status, job.expires_at, job.created_at, new_job;
end;
$$;

revoke all on function public.enqueue_panel_command(uuid, uuid, uuid, text, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.enqueue_panel_command(uuid, uuid, uuid, text, jsonb, boolean) to service_role;
