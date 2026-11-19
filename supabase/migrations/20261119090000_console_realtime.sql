-- Deliver console inserts only to accounts allowed by the existing server_logs SELECT policy.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'server_logs'
  ) then
    alter publication supabase_realtime add table public.server_logs;
  end if;
end;
$$;
