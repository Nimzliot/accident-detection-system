create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  password_hash text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  status text not null default 'offline',
  last_seen timestamptz not null default now(),
  latitude numeric(10,6),
  longitude numeric(10,6),
  location_updated_at timestamptz
);

alter table public.devices
  add column if not exists latitude numeric(10,6);

alter table public.devices
  add column if not exists longitude numeric(10,6);

alter table public.devices
  add column if not exists location_updated_at timestamptz;

create table if not exists public.accidents (
  id bigint generated always as identity primary key,
  device_id text not null references public.devices(device_id) on delete cascade,
  acceleration numeric(10,2) not null,
  tilt_angle numeric(10,2) not null default 0,
  severity text not null check (severity in ('MINOR', 'MEDIUM', 'SEVERE')),
  latitude numeric(10,6) not null,
  longitude numeric(10,6) not null,
  speed numeric(10,2) not null default 0,
  satellites integer not null default 0,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.accidents
  add column if not exists tilt_angle numeric(10,2) not null default 0;

alter table public.accidents
  alter column tilt_angle set default 0;

alter table public.accidents
  add column if not exists latitude numeric(10,6) not null default 0;

alter table public.accidents
  add column if not exists longitude numeric(10,6) not null default 0;

alter table public.accidents
  add column if not exists speed numeric(10,2) not null default 0;

alter table public.accidents
  add column if not exists satellites integer not null default 0;

alter table public.accidents
  add column if not exists timestamp timestamptz not null default now();

alter table public.accidents
  alter column timestamp set default now();

alter table public.accidents
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_accidents_timestamp on public.accidents (timestamp desc);
create index if not exists idx_accidents_device_id on public.accidents (device_id);
create index if not exists idx_accidents_severity on public.accidents (severity);
create index if not exists idx_devices_last_seen on public.devices (last_seen desc);
create index if not exists idx_devices_location_updated_at on public.devices (location_updated_at desc);

create table if not exists public.alerts (
  id bigint generated always as identity primary key,
  accident_id bigint not null references public.accidents(id) on delete cascade,
  message text not null,
  sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_alerts_accident_id on public.alerts (accident_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'admin')
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();
