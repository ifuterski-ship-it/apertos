-- Migrate inventory table to per-size tracking
-- Run this in the Supabase SQL editor

-- 1. Add size column
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS size text;

-- 2. Drop old unique constraint on product_id alone
ALTER TABLE public.inventory DROP CONSTRAINT IF EXISTS inventory_product_id_key;

-- 3. Add composite unique constraint on (product_id, size)
ALTER TABLE public.inventory
  ADD CONSTRAINT inventory_product_id_size_key UNIQUE (product_id, size);

-- 4. Remove old aggregate rows (no longer needed)
DELETE FROM public.inventory WHERE product_id IN ('rashguard', 'shorts');

-- 5. Insert per-size stock for rashguard
INSERT INTO public.inventory (product_id, size, stock) VALUES
  ('rashguard', 'S',   1),
  ('rashguard', 'M',   2),
  ('rashguard', 'L',   2),
  ('rashguard', 'XL',  2),
  ('rashguard', '2XL', 2);

-- 6. Insert per-size stock for shorts (same quantities)
INSERT INTO public.inventory (product_id, size, stock) VALUES
  ('shorts', 'S',   1),
  ('shorts', 'M',   2),
  ('shorts', 'L',   2),
  ('shorts', 'XL',  2),
  ('shorts', '2XL', 2);
