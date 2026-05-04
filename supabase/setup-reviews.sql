-- Run this in Supabase SQL editor to create the reviews table
-- Dashboard → SQL Editor → New query → paste and run

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  TEXT          NOT NULL,
  reviewer_name TEXT        NOT NULL,
  rating      INTEGER       NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT          NOT NULL,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews (product_id);

-- Allow public read access
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

-- Allow inserts from anon (server validates via admin client)
CREATE POLICY "Service role can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);
