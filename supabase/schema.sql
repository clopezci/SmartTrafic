-- SmartTrafic schema — Fase 1
-- Run in Supabase SQL editor as a single script.
-- Enables RLS, audit, multi-tenant, health, and telemetry.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum (
    'superadmin',
    'platform_ops',
    'municipality_admin',
    'technician',
    'viewer'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.plan_tier as enum ('esencial', 'adaptativo', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.intersection_geometry as enum ('t', 'plus', 'pedestrian');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.intersection_mode as enum (
    'normal', 'school', 'market', 'night', 'eco', 'emergency', 'failsafe'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.light_color as enum ('red', 'amber', 'green', 'flashing_amber', 'off');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.asset_owner as enum ('municipality', 'smarttrafic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.alert_severity as enum ('info', 'warning', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.device_kind as enum (
    'edge_brain', 'esp32_satellite', 'relay_board', 'modem_4g',
    'camera_ai', 'radar', 'solar_controller', 'ped_button', 'floor_led', 'acoustic'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Municipalities (tenants)
-- ---------------------------------------------------------------------------
create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  country text not null default 'CO',
  population integer,
  plan public.plan_tier not null default 'adaptativo',
  monthly_fee_cop integer not null default 1500000,
  contract_start date,
  contract_end date,
  timezone text not null default 'America/Bogota',
  lat double precision,
  lng double precision,
  active boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  role public.user_role not null default 'viewer',
  municipality_id uuid references public.municipalities (id) on delete set null,
  is_platform_admin boolean not null default false,
  phone text,
  telegram_chat_id text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_municipality_idx on public.profiles (municipality_id);

-- ---------------------------------------------------------------------------
-- Intersections
-- ---------------------------------------------------------------------------
create table if not exists public.intersections (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  code text not null,
  name text not null,
  geometry public.intersection_geometry not null default 'plus',
  lat double precision,
  lng double precision,
  approaches integer not null default 4,
  plan public.plan_tier not null default 'adaptativo',
  mode public.intersection_mode not null default 'normal',
  online boolean not null default false,
  health_score integer not null default 100,
  solar boolean not null default true,
  battery_pct numeric(5,2),
  firmware_version text,
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, code)
);

create index if not exists intersections_muni_idx on public.intersections (municipality_id);

-- ---------------------------------------------------------------------------
-- Approaches (one per inbound street)
-- ---------------------------------------------------------------------------
create table if not exists public.approaches (
  id uuid primary key default gen_random_uuid(),
  intersection_id uuid not null references public.intersections (id) on delete cascade,
  name text not null,
  heading_deg integer,
  has_pedestrian boolean not null default true,
  sensor_range_m integer not null default 300,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Devices (comodato vs municipality)
-- ---------------------------------------------------------------------------
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  intersection_id uuid references public.intersections (id) on delete set null,
  kind public.device_kind not null,
  serial text unique,
  owner public.asset_owner not null,
  label text not null,
  firmware_version text,
  last_seen_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Technicians assignment
-- ---------------------------------------------------------------------------
create table if not exists public.technician_assignments (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  technician_id uuid not null references public.profiles (id) on delete cascade,
  intersection_id uuid references public.intersections (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (technician_id, intersection_id)
);

-- ---------------------------------------------------------------------------
-- Live telemetry (hot path; keep lean)
-- ---------------------------------------------------------------------------
create table if not exists public.intersection_snapshots (
  id bigserial primary key,
  intersection_id uuid not null references public.intersections (id) on delete cascade,
  captured_at timestamptz not null default now(),
  mode public.intersection_mode not null,
  battery_pct numeric(5,2),
  payload jsonb not null
);

create index if not exists snapshots_ix_time
  on public.intersection_snapshots (intersection_id, captured_at desc);

-- ---------------------------------------------------------------------------
-- Alerts
-- ---------------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  intersection_id uuid references public.intersections (id) on delete set null,
  severity public.alert_severity not null,
  code text not null,
  title text not null,
  body text,
  acknowledged boolean not null default false,
  acknowledged_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists alerts_open_idx
  on public.alerts (municipality_id, acknowledged, created_at desc);

-- ---------------------------------------------------------------------------
-- Audit (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_events (
  id bigserial primary key,
  actor_id uuid references public.profiles (id),
  actor_email text,
  municipality_id uuid references public.municipalities (id),
  action text not null,
  entity text,
  entity_id text,
  ip inet,
  user_agent text,
  diff jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_time_idx on public.audit_events (created_at desc);

revoke update, delete on public.audit_events from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Health / Sentry-like
-- ---------------------------------------------------------------------------
create table if not exists public.health_events (
  id bigserial primary key,
  source text not null,
  level text not null,
  message text not null,
  fingerprint text,
  count integer not null default 1,
  municipality_id uuid references public.municipalities (id),
  intersection_id uuid references public.intersections (id),
  context jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.health_heartbeats (
  id bigserial primary key,
  component text not null,
  ok boolean not null,
  latency_ms integer,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- System settings (platform + per municipality)
-- ---------------------------------------------------------------------------
create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid references public.municipalities (id) on delete cascade,
  -- null municipality_id = global platform settings
  key text not null,
  value jsonb not null,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  unique (municipality_id, key)
);

create unique index if not exists system_settings_global_key
  on public.system_settings (key) where municipality_id is null;

-- ---------------------------------------------------------------------------
-- Algorithm / timing variables
-- ---------------------------------------------------------------------------
create table if not exists public.timing_profiles (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  intersection_id uuid references public.intersections (id) on delete cascade,
  name text not null,
  min_green_s integer not null default 8,
  max_green_s integer not null default 60,
  yellow_s integer not null default 3,
  all_red_s integer not null default 1,
  min_ped_s integer not null default 12,
  extension_s integer not null default 3,
  night_start time not null default '23:00',
  night_end time not null default '05:00',
  school_windows jsonb not null default '[{"start":"06:50","end":"07:40"},{"start":"12:20","end":"13:30"}]'::jsonb,
  sensor_bands_m integer[] not null default '{100,200,300}',
  weights jsonb not null default '{"m100":1,"m200":1.6,"m300":2.4,"wait":0.08,"moto":0.45,"bus":2.2,"truck":2.8,"ped":1.8}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Access grants (tester invites) — independent of auth.users
-- ---------------------------------------------------------------------------
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

-- Demo / owner password hashes until the email exists in auth.users
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

-- Technicians of record (no auth user required)
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

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.is_platform_admin = true or p.role = 'superadmin'
           or lower(p.email) = lower(current_setting('app.superadmin_email', true)))
  );
$$;

create or replace function public.current_municipality_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select municipality_id from public.profiles where id = auth.uid();
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists municipalities_updated on public.municipalities;
create trigger municipalities_updated before update on public.municipalities
for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists intersections_updated on public.intersections;
create trigger intersections_updated before update on public.intersections
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email text := 'clpezci@gmail.com';
begin
  insert into public.profiles (id, email, full_name, role, is_platform_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when lower(new.email) = admin_email then 'superadmin'::public.user_role else 'viewer'::public.user_role end,
    lower(new.email) = admin_email
  )
  on conflict (id) do update
    set email = excluded.email,
        is_platform_admin = excluded.is_platform_admin,
        role = case when lower(excluded.email) = admin_email then 'superadmin'::public.user_role else public.profiles.role end;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.municipalities enable row level security;
alter table public.profiles enable row level security;
alter table public.intersections enable row level security;
alter table public.approaches enable row level security;
alter table public.devices enable row level security;
alter table public.technician_assignments enable row level security;
alter table public.intersection_snapshots enable row level security;
alter table public.alerts enable row level security;
alter table public.audit_events enable row level security;
alter table public.health_events enable row level security;
alter table public.health_heartbeats enable row level security;
alter table public.system_settings enable row level security;
alter table public.timing_profiles enable row level security;
alter table public.access_grants enable row level security;
alter table public.credential_overrides enable row level security;
alter table public.display_names enable row level security;
alter table public.field_technicians enable row level security;
alter table public.kpi_daily enable row level security;

-- Profiles
drop policy if exists "profiles self or admin" on public.profiles;
create policy "profiles self or admin" on public.profiles
  for select using (
    id = auth.uid()
    or public.is_superadmin()
    or (municipality_id is not null and municipality_id = public.current_municipality_id())
  );

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles
  for update using (id = auth.uid() or public.is_superadmin());

-- Municipalities
drop policy if exists "muni read" on public.municipalities;
create policy "muni read" on public.municipalities
  for select using (public.is_superadmin() or id = public.current_municipality_id());

drop policy if exists "muni write admin" on public.municipalities;
create policy "muni write admin" on public.municipalities
  for all using (public.is_superadmin());

-- Generic tenant read/write for operational tables
drop policy if exists "ix read" on public.intersections;
create policy "ix read" on public.intersections
  for select using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "ix write" on public.intersections;
create policy "ix write" on public.intersections
  for all using (
    public.is_superadmin()
    or (
      municipality_id = public.current_municipality_id()
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.role in ('municipality_admin', 'technician')
      )
    )
  );

drop policy if exists "ap read" on public.approaches;
create policy "ap read" on public.approaches
  for select using (
    public.is_superadmin()
    or exists (
      select 1 from public.intersections i
      where i.id = approaches.intersection_id
        and i.municipality_id = public.current_municipality_id()
    )
  );

drop policy if exists "ap write" on public.approaches;
create policy "ap write" on public.approaches
  for all using (public.is_superadmin());

drop policy if exists "dev read" on public.devices;
create policy "dev read" on public.devices
  for select using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "dev write" on public.devices;
create policy "dev write" on public.devices
  for all using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "tech read" on public.technician_assignments;
create policy "tech read" on public.technician_assignments
  for select using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "tech write" on public.technician_assignments;
create policy "tech write" on public.technician_assignments
  for all using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "snap read" on public.intersection_snapshots;
create policy "snap read" on public.intersection_snapshots
  for select using (
    public.is_superadmin()
    or exists (
      select 1 from public.intersections i
      where i.id = intersection_snapshots.intersection_id
        and i.municipality_id = public.current_municipality_id()
    )
  );

drop policy if exists "snap insert" on public.intersection_snapshots;
create policy "snap insert" on public.intersection_snapshots
  for insert with check (true);

drop policy if exists "alerts read" on public.alerts;
create policy "alerts read" on public.alerts
  for select using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "alerts write" on public.alerts;
create policy "alerts write" on public.alerts
  for all using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "audit read admin" on public.audit_events;
create policy "audit read admin" on public.audit_events
  for select using (
    public.is_superadmin()
    or (
      municipality_id = public.current_municipality_id()
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('municipality_admin')
      )
    )
  );

drop policy if exists "audit insert" on public.audit_events;
create policy "audit insert" on public.audit_events
  for insert with check (true);

drop policy if exists "health read" on public.health_events;
create policy "health read" on public.health_events
  for select using (public.is_superadmin());

drop policy if exists "health write" on public.health_events;
create policy "health write" on public.health_events
  for all using (public.is_superadmin());

drop policy if exists "hb read" on public.health_heartbeats;
create policy "hb read" on public.health_heartbeats
  for select using (public.is_superadmin());

drop policy if exists "hb insert" on public.health_heartbeats;
create policy "hb insert" on public.health_heartbeats
  for insert with check (true);

drop policy if exists "settings read" on public.system_settings;
create policy "settings read" on public.system_settings
  for select using (
    public.is_superadmin()
    or (municipality_id is not null and municipality_id = public.current_municipality_id())
  );

drop policy if exists "settings write" on public.system_settings;
create policy "settings write" on public.system_settings
  for all using (
    public.is_superadmin()
    or (
      municipality_id = public.current_municipality_id()
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'municipality_admin'
      )
    )
  );

drop policy if exists "timing read" on public.timing_profiles;
create policy "timing read" on public.timing_profiles
  for select using (public.is_superadmin() or municipality_id = public.current_municipality_id());

drop policy if exists "timing write" on public.timing_profiles;
create policy "timing write" on public.timing_profiles
  for all using (public.is_superadmin() or municipality_id = public.current_municipality_id());

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

-- Realtime (ignore if already added)
do $$ begin
  alter publication supabase_realtime add table public.intersections;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.alerts;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.intersection_snapshots;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.health_events;
exception when duplicate_object then null; end $$;
