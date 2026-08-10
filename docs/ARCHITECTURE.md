# Architecture

## System context

```text
Browser
  │ HTTPS + Supabase session cookie
  ▼
Next.js App Router on Vercel
  │ authenticated Supabase client / restricted RPC
  ▼
Supabase Auth + PostgreSQL
  │ constraints, transactions, RLS, audit history
  ▼
LoanTrack NG records
```

## Application layers

- **Routes and layouts:** `src/app`, split into public, authentication, borrower, and administrator route groups.
- **Presentation:** reusable accessible components in `src/components`.
- **Features:** domain-specific forms, queries, and actions in `src/features`.
- **Server integration:** cookie-aware Supabase clients, validation, currency, and authorization helpers in `src/lib`.
- **Data:** version-controlled SQL in `supabase/migrations` and synthetic data in `supabase/seed.sql`.

## Next.js decisions

- Server Components perform authenticated reads without an internal HTTP round trip.
- Server Actions handle internal form mutations.
- Route Handlers are reserved for auth callbacks and genuine HTTP integrations.
- Node.js is the default runtime.
- Production builds use Next.js's supported webpack builder because Turbopack's CSS worker cannot bind its internal port in the managed Codex environment. Development can continue to use the default Next.js dev bundler.
- `proxy.ts` will refresh authentication cookies and provide early route redirects; it will not replace database authorization.

## Trust boundaries

Browser input is untrusted. Every mutation is validated in server code and again through database types, constraints, permissions, or transactional functions. Supabase RLS is the final record-access boundary.
