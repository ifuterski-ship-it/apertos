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
- Resend can be enabled with `RESEND_API_KEY`.
- The app is kept intentionally simple so it still runs locally without external services configured.
