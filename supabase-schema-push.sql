-- Magnet Link BMS — Web Push additions
-- Run this in your Supabase project's SQL editor (Dashboard → SQL Editor)
-- Same convention as supabase-schema.sql: single `data` JSONB column.

create table if not exists push_subscriptions (id text primary key, data jsonb);
create table if not exists notifications      (id text primary key, data jsonb);

alter table push_subscriptions enable row level security;
alter table notifications      enable row level security;

do $$
declare t text;
begin
  foreach t in array array['push_subscriptions','notifications']
  loop
    execute format('drop policy if exists "anon_all" on %I;', t);
    execute format('
      create policy "anon_all" on %I
        for all to anon using (true) with check (true);
    ', t);
  end loop;
end $$;
