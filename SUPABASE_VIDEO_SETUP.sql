-- Run this entire file in your Supabase SQL editor
-- Go to: supabase.com → your project → SQL Editor → New Query → paste this → Run

-- Athletes table
create table athletes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  position text,
  second_position text,
  bats text,
  throws text,
  height text,
  weight text,
  school text,
  city text,
  state text,
  conference text,
  grad_year text,
  gpa numeric(3,2),
  recruiting_status text default 'Available',
  hudl_url text,
  youtube_url text,
  instagram text,
  twitter text,
  bio text,
  stats jsonb,
  achievements text[],
  created_at timestamp with time zone default now()
);

-- Coaches table
create table coaches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  school text,
  title text,
  verified boolean default false,
  created_at timestamp with time zone default now()
);

-- Saved prospects (coach bookmarks)
create table saved_prospects (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references auth.users(id) on delete cascade,
  athlete_id uuid references athletes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(coach_id, athlete_id)
);

-- Enable Row Level Security
alter table athletes enable row level security;
alter table coaches enable row level security;
alter table saved_prospects enable row level security;

-- Athletes: anyone can read, only owner can write
create policy "Athletes are publicly readable"
  on athletes for select using (true);

create policy "Athletes can insert their own profile"
  on athletes for insert with check (auth.uid() = user_id);

create policy "Athletes can update their own profile"
  on athletes for update using (auth.uid() = user_id);

-- Coaches: anyone can read, only owner can write
create policy "Coaches are publicly readable"
  on coaches for select using (true);

create policy "Coaches can insert their own profile"
  on coaches for insert with check (auth.uid() = user_id);

create policy "Coaches can update their own profile"
  on coaches for update using (auth.uid() = user_id);

-- Saved prospects: coaches can only see/edit their own
create policy "Coaches can manage their saved prospects"
  on saved_prospects for all using (auth.uid() = coach_id);
