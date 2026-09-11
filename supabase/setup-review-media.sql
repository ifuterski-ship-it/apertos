-- Run this in Supabase SQL editor to add photo/video support to reviews
-- Dashboard -> SQL Editor -> New query -> paste and run

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;