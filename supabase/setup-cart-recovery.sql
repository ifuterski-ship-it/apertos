-- Run this in the Supabase SQL editor for the same project used by Vercel.
--
-- Adds abandoned-basket recovery support to checkout_carts. The recovery
-- sweep (GET /api/cart-recovery, triggered by the Vercel cron) finds carts
-- still 'open' after a delay, emails the customer to come back, and stamps
-- recovery_email_sent_at here so a basket is only asked about once.

alter table public.checkout_carts
  add column if not exists recovery_email_sent_at timestamptz;

create index if not exists checkout_carts_recovery_idx
  on public.checkout_carts (status, created_at)
  where status = 'open' and recovery_email_sent_at is null;

comment on column public.checkout_carts.recovery_email_sent_at is
  'Set when the abandoned-cart recovery email is sent, so each open cart is only emailed once.';