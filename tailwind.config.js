-- Run this in Supabase SQL Editor

-- Add video_url column to athletes table
alter table athletes add column if not exists video_url text;

-- Create storage bucket for highlight videos
insert into storage.buckets (id, name, public)
values ('highlight-videos', 'highlight-videos', true)
on conflict do nothing;

-- Allow anyone to view videos
create policy "Videos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'highlight-videos' );

-- Allow authenticated users to upload videos
create policy "Athletes can upload their own videos"
  on storage.objects for insert
  with check ( bucket_id = 'highlight-videos' AND auth.role() = 'authenticated' );

-- Allow users to update/replace their own videos
create policy "Athletes can update their own videos"
  on storage.objects for update
  using ( bucket_id = 'highlight-videos' AND auth.role() = 'authenticated' );
