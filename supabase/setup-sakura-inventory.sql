-- Set up Sakura Dragon inventory (separate from OG APERTOS pools)
-- Run this in the Supabase SQL editor.
-- The inventory table already has: product_id (text), size (text), stock (integer)
-- with a composite unique constraint on (product_id, size) from migrate-inventory-per-size.sql.

-- Add Sakura Dragon base products with per-size stock.
-- Sizes available: XS, S, M, L, XL (no 2XL).
-- Stock (user-supplied, Sakura Dragon only):
--   XS: rashguard 1, shorts 0
--   S:  rashguard 0, shorts 1
--   M:  rashguard 0 (sold out), shorts 2
--   L:  rashguard 0 (sold out), shorts 0 (sold out — L set unavailable)
--   XL: rashguard 0 (sold out), shorts 1

-- Sakura rashguard stock
INSERT INTO public.inventory (product_id, size, stock) VALUES
  ('sakura-rashguard', 'XS', 1),
  ('sakura-rashguard', 'S',  0),
  ('sakura-rashguard', 'M',  0),
  ('sakura-rashguard', 'L',  0),
  ('sakura-rashguard', 'XL', 0)
ON CONFLICT (product_id, size) DO UPDATE SET stock = EXCLUDED.stock, updated_at = now();

-- Sakura shorts stock
INSERT INTO public.inventory (product_id, size, stock) VALUES
  ('sakura-shorts', 'XS', 0),
  ('sakura-shorts', 'S',  1),
  ('sakura-shorts', 'M',  2),
  ('sakura-shorts', 'L',  0),
  ('sakura-shorts', 'XL', 1)
ON CONFLICT (product_id, size) DO UPDATE SET stock = EXCLUDED.stock, updated_at = now();
