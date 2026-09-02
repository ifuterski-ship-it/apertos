-- Set up Sakura Dragon inventory (separate from OG APERTOS pools)
-- Run this in the Supabase SQL editor.
-- The inventory table already has: product_id (text), size (text), stock (integer)
-- with a composite unique constraint on (product_id, size) from migrate-inventory-per-size.sql.

-- Add Sakura Dragon base products with per-size stock.
-- Sizes available: XS, S, M, L, XL (no 2XL).
-- Stock (user-supplied, Sakura Dragon only):
--   XS: sold out (0)
--   S:  rashguard 0, shorts 1
--   M:  rashguard 2, shorts 2
--   L:  rashguard 1, shorts 1
--   XL: rashguard 1, shorts 1

-- Sakura rashguard stock
INSERT INTO public.inventory (product_id, size, stock) VALUES
  ('sakura-rashguard', 'XS', 0),
  ('sakura-rashguard', 'S',  0),
  ('sakura-rashguard', 'M',  2),
  ('sakura-rashguard', 'L',  1),
  ('sakura-rashguard', 'XL', 1)
ON CONFLICT (product_id, size) DO UPDATE SET stock = EXCLUDED.stock, updated_at = now();

-- Sakura shorts stock
INSERT INTO public.inventory (product_id, size, stock) VALUES
  ('sakura-shorts', 'XS', 0),
  ('sakura-shorts', 'S',  1),
  ('sakura-shorts', 'M',  2),
  ('sakura-shorts', 'L',  1),
  ('sakura-shorts', 'XL', 1)
ON CONFLICT (product_id, size) DO UPDATE SET stock = EXCLUDED.stock, updated_at = now();
