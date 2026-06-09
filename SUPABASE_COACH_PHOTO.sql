-- Run this in Supabase SQL Editor

-- Add missing columns to coaches table
alter table coaches add column if not exists phone text;
alter table coaches add column if not exists reason text;
alter table coaches add column if not exists denied boolean default false;

-- Update coaches policy so unverified coaches can still read their own row
create policy "Coaches can read their own profile"
  on coaches for select
  using (auth.uid() = user_id);
