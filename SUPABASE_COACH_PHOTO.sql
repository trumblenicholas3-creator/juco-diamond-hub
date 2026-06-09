-- Run in Supabase SQL Editor

-- Add new columns to coaches
alter table coaches add column if not exists division text;
alter table coaches add column if not exists location text;
alter table coaches add column if not exists photo_url text;

-- Create storage bucket for coach photos
insert into storage.buckets (id, name, public)
values ('coach-photos', 'coach-photos', true)
on conflict do nothing;

-- Allow anyone to view coach photos
create policy "Coach photos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'coach-photos' );

-- Allow authenticated users to upload coach photos
create policy "Coaches can upload their photo"
  on storage.objects for insert
  with check ( bucket_id = 'coach-photos' AND auth.role() = 'authenticated' );

create policy "Coaches can update their photo"
  on storage.objects for update
  using ( bucket_id = 'coach-photos' AND auth.role() = 'authenticated' );
