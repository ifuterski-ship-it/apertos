# APERTOS

Premium combat sports storefront built with Next.js App Router and Tailwind CSS.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` if you want to prepare service credentials.

3. Start the dev server:

```bash
npm run dev
```

## Notes

- The cart is fully functional and persists in `localStorage`.
- Product data is local and image files are served from `public/products`.
- Supabase can be enabled with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Supabase admin order access uses `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_EMAILS`.
- Run `supabase/setup-orders.sql` in your Supabase SQL editor to create `public.orders` and the `reload_schema_cache()` helper.
- Stripe full checkout can be enabled with `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- Stripe shipping address collection can be limited with `STRIPE_SHIPPING_COUNTRIES`.
- Shippo label purchasing uses `SHIPPO_API_KEY` plus the `SHIPPO_FROM_*` sender address variables.
- Resend can be enabled with `RESEND_API_KEY`.
- Contact emails default to `CONTACT_EMAIL` and fall back to `ifuterski@icloud.com`.
- Sender identities can be separated with `RESEND_FROM_WELCOME`, `RESEND_FROM_ORDERS`, and `RESEND_FROM_SUPPORT`.
- The app is kept intentionally simple so it still runs locally without external services configured.

## Shipping label flow

1. Stripe checkout posts paid orders to `POST /api/stripe/webhook`.
2. The webhook writes/upserts the order into `public.orders` in Supabase.
3. `/admin` loads all orders from Supabase using the service role key.
4. `Generate Label` calls `POST /api/admin/orders/[sessionId]/label`, which:
   - reads the order shipping address/items,
   - asks Shippo for rates,
   - purchases the cheapest label,
   - saves label details back into the order payload in Supabase,
   - and returns `labelUrl` so the admin UI opens the PDF.
