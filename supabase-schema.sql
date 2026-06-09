-- Magnet Link BMS — Supabase Schema
-- Run this in your Supabase project's SQL editor (Dashboard → SQL Editor)
-- Each table uses a single `data` JSONB column for maximum flexibility.

create table if not exists leads        (id text primary key, data jsonb);
create table if not exists clients      (id text primary key, data jsonb);
create table if not exists projects     (id text primary key, data jsonb);
create table if not exists invoices     (id text primary key, data jsonb);
create table if not exists expenses     (id text primary key, data jsonb);
create table if not exists salaries     (id text primary key, data jsonb);
create table if not exists attendance   (id text primary key, data jsonb);
create table if not exists off_days     (id text primary key, data jsonb);
create table if not exists deductions   (id text primary key, data jsonb);
create table if not exists bonuses      (id text primary key, data jsonb);
create table if not exists team_members (id text primary key, data jsonb);
create table if not exists team_clients (id text primary key, data jsonb);
create table if not exists custom_roles (id text primary key, data jsonb);
create table if not exists task_depts   (id text primary key, data jsonb);
create table if not exists task_buckets (id text primary key, data jsonb);
create table if not exists task_tasks   (id text primary key, data jsonb);
create table if not exists design_assets(id text primary key, data jsonb);
create table if not exists client_assets(id text primary key, data jsonb);
create table if not exists documents    (id text primary key, data jsonb);

-- Enable Row Level Security (permissive — all authenticated users can read/write)
alter table leads         enable row level security;
alter table clients       enable row level security;
alter table projects      enable row level security;
alter table invoices      enable row level security;
alter table expenses      enable row level security;
alter table salaries      enable row level security;
alter table attendance    enable row level security;
alter table off_days      enable row level security;
alter table deductions    enable row level security;
alter table bonuses       enable row level security;
alter table team_members  enable row level security;
alter table team_clients  enable row level security;
alter table custom_roles  enable row level security;
alter table task_depts    enable row level security;
alter table task_buckets  enable row level security;
alter table task_tasks    enable row level security;
alter table design_assets enable row level security;
alter table client_assets enable row level security;
alter table documents     enable row level security;

-- Allow all operations for the anon key (the BMS handles its own auth)
do $$
declare t text;
begin
  foreach t in array array[
    'leads','clients','projects','invoices','expenses','salaries',
    'attendance','off_days','deductions','bonuses',
    'team_members','team_clients','custom_roles',
    'task_depts','task_buckets','task_tasks',
    'design_assets','client_assets','documents'
  ]
  loop
    execute format('
      create policy if not exists "anon_all" on %I
        for all to anon using (true) with check (true);
    ', t);
  end loop;
end $$;
