-- Run this in Supabase SQL editor for the same project used by Vercel.
--
-- WHY
-- The checkout route used to put the whole basket into Stripe session metadata
-- (metadata.items). Stripe rejects any metadata value longer than 500
-- characters, and a four-line basket serialises to ~533 characters, so
-- customers with four or more products could not complete checkout at all —
-- Stripe returned a 400 and the order was lost. The shipping address was a
-- second exposure at ~260 characters for a typical UK address, and longer
-- international addresses were closer to the limit still.
--
-- This table removes both limits: the cart is stored here as jsonb, and Stripe
-- metadata carries only a short cart_ref (a uuid, 36 characters).
--
-- SECURITY
-- RLS is enabled with NO policies, so the anon and authenticated keys cannot
-- read or write this table at all; only the service role bypasses RLS. This
-- table holds customer names, emails, phone numbers and addresses, so it must
-- not be reachable from a browser. Do not add a permissive policy here.

create table if not exists public.checkout_carts (
  id uuid primary key default gen_random_uuid(),
  -- Normalised basket plus the shipping address chosen before redirecting to
  -- Stripe. Shape mirrors OrderItemsPayload in lib/orders.ts:
  --   { items: [{ productId, name, quantity, size, colour?, price }], shippingAddress }
  -- `price` is in MAJOR units, as it is in lib/products.ts.
  cart jsonb not null,
  status text not null default 'open'
    check (status in ('open', 'completed', 'expired')),
  email text,
  -- Set once the Stripe session exists, so a cart can be reconciled with its
  -- session even if the webhook is retried or arrives out of order.
  stripe_checkout_session_id text unique,
  completed_at timestamptz,
  -- Abandoned carts are inert but should be swept. The webhook only trusts
  -- rows whose stripe_checkout_session_id matches the session it is handling.
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now()
);

create index if not exists checkout_carts_status_created_idx
  on public.checkout_carts (status, created_at desc);

create index if not exists checkout_carts_session_idx
  on public.checkout_carts (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

alter table public.checkout_carts enable row level security;

-- No policies by design: deny by default, service role only. See above.

comment on table public.checkout_carts is
  'Pre-Stripe basket storage. Replaces oversized Stripe session metadata. Contains customer PII: service-role access only.';
comment on column public.checkout_carts.cart is
  'JSON blob: { items: OrderItem[], shippingAddress: OrderShippingAddress | null }. Never used for pricing — the webhook takes money from Stripe amount_total/currency.';
comment on column public.checkout_carts.expires_at is
  'Abandoned carts become unusable after this. Housekeeping only; the webhook
   does not enforce it, because a customer may legitimately take longer than
   30 minutes inside Stripe-hosted checkout.';

-- Allows the app to request a PostgREST schema refresh after migrations.
create or replace function public.reload_schema_cache()
returns void
language sql
security definer
set search_path = public
as $$
  select pg_notify('pgrst', 'reload schema');
$$;

grant execute on function public.reload_schema_cache() to anon, authenticated, service_role;