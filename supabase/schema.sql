-- Create extension if needed for uuid generation (on Supabase it's usually enabled)
-- create extension if not exists "uuid-ossp";

create table if not exists public.memories (
  id uuid primary key default uuid_generate_v4(),
  lat float8 not null,
  lng float8 not null,
  title text not null,
  description text not null,
  contributor text not null check (contributor in ('joy','socrates')),
  category text not null check (category in ('core','thought','bucket_list','trip','milestone','inside_joke','celebration','heartbreak_repair','anniversary','secret')),
  color text null,
  mood text null check (mood in ('soft','romantic','chaotic','longing','nostalgic')),
  emoji text null,
  date date not null,
  time time null,
  photo_url text null,
  is_bucket_list_completed boolean not null default false,
  secret_unlock_date date null,
  created_at timestamptz not null default now()
);

-- Basic RLS: allow public read/write for now (adjust later)
alter table public.memories enable row level security;
create policy "Allow public read" on public.memories for select using (true);
create policy "Allow public insert" on public.memories for insert with check (true);
create policy "Allow public update" on public.memories for update using (true);
create policy "Allow public delete" on public.memories for delete using (true);

-- Storage bucket: create 'memory-photos' in Supabase Storage UI.

