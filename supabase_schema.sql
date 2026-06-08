-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- Table: session_logs
create table session_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  session_date timestamp with time zone,
  week integer not null,
  day_id text not null,
  day_name text not null,
  duration integer not null,
  completed_sets integer not null,
  total_sets integer not null,
  log_text text,
  exercises_data jsonb
);

-- Table: protocols
create table protocols (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  week integer not null,
  protocol_data jsonb not null
);

-- Enable public read/write (anon key access)
alter table session_logs enable row level security;
alter table protocols enable row level security;

create policy "Allow all" on session_logs for all using (true) with check (true);
create policy "Allow all" on protocols for all using (true) with check (true);
