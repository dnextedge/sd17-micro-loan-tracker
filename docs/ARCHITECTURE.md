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
- Loan creation and disbursement Server Actions remain thin: they re-authorize
  the administrator and delegate the financial transaction to restricted
  PostgreSQL RPCs.
- Repayment recording follows the same boundary: the Server Action validates
  form shape and converts naira input to integer kobo, while the restricted
  PostgreSQL RPC performs authorization, locking, allocation, aggregates,
  status changes, transaction history, and auditing atomically.
- Route Handlers are reserved for auth callbacks and genuine HTTP integrations.
- Node.js is the default runtime.
- Production builds use Next.js's supported webpack builder because Turbopack's CSS worker cannot bind its internal port in the managed Codex environment. Development can continue to use the default Next.js dev bundler.
- `src/proxy.ts` refreshes Supabase authentication cookies and redirects
  unauthenticated protected-route requests. Server layouts verify the user
  again, administrator pages query the protected `user_roles` table, and RLS
  remains the final authorization boundary.

Administrator and borrower navigation are role-specific. Administrator routes
use `/admin/applications`, `/admin/loans`, and `/admin/repayments`; borrower
reads use `/applications`, `/loans`, and `/repayments`, with PostgreSQL RLS
applying ownership at both list and detail levels.

## Trust boundaries

Browser input is untrusted. Every mutation is validated in server code and again through database types, constraints, permissions, or transactional functions. Supabase RLS is the final record-access boundary.
