-- SmartTrafic migrate v3 — commands, plates, technician checklist.
-- Safe to re-run.

alter table public.field_technicians
  add column if not exists checklist jsonb not null default '[]'::jsonb;

create table if not exists public.field_commands (
  id uuid primary key default gen_random_uuid(),
  intersection_id uuid references public.intersections (id) on delete cascade,
  intersection_code text not null,
  kind text not null,
  payload jsonb not null,
  signature text not null,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes')
);

create index if not exists field_commands_queue_idx
  on public.field_commands (intersection_code, status, created_at);

create table if not exists public.plate_events (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  intersection_id uuid references public.intersections (id) on delete set null,
  plate text not null,
  seen_at timestamptz not null default now()
);

create index if not exists plate_events_muni_idx
  on public.plate_events (municipality_id, seen_at desc);

alter table public.field_commands enable row level security;
alter table public.plate_events enable row level security;

drop policy if exists "cmd read" on public.field_commands;
create policy "cmd read" on public.field_commands
  for select using (public.is_superadmin());

drop policy if exists "cmd write" on public.field_commands;
create policy "cmd write" on public.field_commands
  for all using (public.is_superadmin());

drop policy if exists "plate read" on public.plate_events;
create policy "plate read" on public.plate_events
  for select using (
    public.is_superadmin()
    or municipality_id = public.current_municipality_id()
  );

drop policy if exists "plate write" on public.plate_events;
create policy "plate write" on public.plate_events
  for all using (public.is_superadmin());
