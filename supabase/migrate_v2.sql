-- Run this ONCE in Supabase SQL Editor if you already applied schema.sql + seed.sql.
-- Safe to re-run. Service role (the API) bypasses RLS; these tables are what the
-- tablero uses to persist settings, invites, names, passwords, technicians and KPIs.

do $$
declare c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'system_settings'
      and con.contype = 'u'
      and pg_get_constraintdef(con.oid) ~* 'municipality_id'
      and pg_get_constraintdef(con.oid) !~* '\mkey\M'
  loop
    execute format('alter table public.system_settings drop constraint %I', c.conname);
  end loop;
end $$;

do $$ begin
  alter table public.system_settings
    add constraint system_settings_muni_key unique (municipality_id, key);
exception when duplicate_object then null; end $$;

create table if not exists public.access_grants (
  email text primary key,
  full_name text,
  role public.user_role not null default 'viewer',
  is_platform_admin boolean not null default false,
  expires_at timestamptz,
  password_issued text,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.credential_overrides (
  email text primary key,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.display_names (
  email text primary key,
  full_name text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.field_technicians (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  status text not null default 'disponible',
  assigned_codes text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (municipality_id, email)
);

create table if not exists public.kpi_daily (
  day date not null,
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  wait_drop_pct numeric(5,2),
  fuel_saved_gal numeric(8,2),
  co2_tons numeric(8,3),
  motos integer,
  trucks_3axle integer,
  uptime_pct numeric(5,2),
  payload jsonb not null default '{}'::jsonb,
  primary key (municipality_id, day)
);

alter table public.access_grants enable row level security;
alter table public.credential_overrides enable row level security;
alter table public.display_names enable row level security;
alter table public.field_technicians enable row level security;
alter table public.kpi_daily enable row level security;

drop policy if exists "grants admin" on public.access_grants;
create policy "grants admin" on public.access_grants
  for all using (public.is_superadmin());

drop policy if exists "creds admin" on public.credential_overrides;
create policy "creds admin" on public.credential_overrides
  for all using (public.is_superadmin());

drop policy if exists "names admin" on public.display_names;
create policy "names admin" on public.display_names
  for all using (public.is_superadmin());

drop policy if exists "names self" on public.display_names;
create policy "names self" on public.display_names
  for select using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists "techs read" on public.field_technicians;
create policy "techs read" on public.field_technicians
  for select using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "techs write" on public.field_technicians;
create policy "techs write" on public.field_technicians
  for all using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "kpi read" on public.kpi_daily;
create policy "kpi read" on public.kpi_daily
  for select using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "kpi write" on public.kpi_daily;
create policy "kpi write" on public.kpi_daily
  for all using (public.is_superadmin());
