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
- Stripe full checkout can be enabled with `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- Stripe shipping address collection can be limited with `STRIPE_SHIPPING_COUNTRIES`.
- Shippo label purchasing uses `SHIPPO_API_KEY` plus the `SHIPPO_FROM_*` sender address variables.
- Resend can be enabled with `RESEND_API_KEY`.
- Contact emails default to `CONTACT_EMAIL` and fall back to `ifuterski@icloud.com`.
- Sender identities can be separated with `RESEND_FROM_WELCOME`, `RESEND_FROM_ORDERS`, and `RESEND_FROM_SUPPORT`.
- The app is kept intentionally simple so it still runs locally without external services configured.
