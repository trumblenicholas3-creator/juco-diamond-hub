-- Run in Supabase SQL Editor

-- Add payment columns to athletes
alter table athletes add column if not exists photo_url text;
alter table athletes add column if not exists is_featured boolean default false;
alter table athletes add column if not exists spotlight_until timestamp with time zone;
alter table athletes add column if not exists stats_season text default '2024';

-- Add payment columns to coaches
alter table coaches add column if not exists is_premium boolean default false;
alter table coaches add column if not exists stripe_customer_id text;

-- Athlete photos storage bucket
insert into storage.buckets (id, name, public)
values ('athlete-photos', 'athlete-photos', true)
on conflict do nothing;

create policy "Athlete photos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'athlete-photos' );

create policy "Athletes can upload their photo"
  on storage.objects for insert
  with check ( bucket_id = 'athlete-photos' AND auth.role() = 'authenticated' );

create policy "Athletes can update their photo"
  on storage.objects for update
  using ( bucket_id = 'athlete-photos' AND auth.role() = 'authenticated' );
