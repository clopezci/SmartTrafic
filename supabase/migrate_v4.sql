-- Letreros de mensaje. El municipio pone el tablero físico.
-- SmartTrafic presta el controlador que publica el texto.

create table if not exists public.message_boards (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  code text not null,
  name text not null,
  place text not null default '',
  lat double precision,
  lng double precision,
  solar boolean not null default true,
  battery_pct numeric(5,2),
  online boolean not null default false,
  last_seen_at timestamptz,
  current_text text not null default '',
  current_kind text,
  created_at timestamptz not null default now(),
  unique (municipality_id, code)
);

create table if not exists public.board_messages (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.message_boards (id) on delete cascade,
  municipality_id uuid not null references public.municipalities (id) on delete cascade,
  kind text not null,
  body text not null,
  author_email text,
  status text not null default 'live',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists board_messages_live_idx
  on public.board_messages (board_id, status, created_at desc);

alter table public.message_boards enable row level security;
alter table public.board_messages enable row level security;

drop policy if exists "boards read" on public.message_boards;
create policy "boards read" on public.message_boards
  for select using (
    public.is_superadmin()
    or municipality_id = public.current_municipality_id()
  );

drop policy if exists "boards write" on public.message_boards;
create policy "boards write" on public.message_boards
  for all using (
    public.is_superadmin()
    or municipality_id = public.current_municipality_id()
  );

drop policy if exists "board msg read" on public.board_messages;
create policy "board msg read" on public.board_messages
  for select using (
    public.is_superadmin()
    or municipality_id = public.current_municipality_id()
  );

drop policy if exists "board msg write" on public.board_messages;
create policy "board msg write" on public.board_messages
  for all using (
    public.is_superadmin()
    or municipality_id = public.current_municipality_id()
  );
