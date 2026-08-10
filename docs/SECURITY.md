# Security

## Authentication and authorization

Supabase Auth supplies user identity and persistent sessions. Roles live in a protected `user_roles` table and are never trusted from client-controlled metadata. UI navigation is role-aware, but server/database authorization is mandatory.

## RLS strategy

- Enable RLS on every public application table.
- Anonymous users receive no application-record access.
- Borrowers access only records connected to their own profile.
- Borrowers receive read-only access to loans, schedules, repayments, and history.
- Sensitive updates are unavailable as broad table grants and instead use restricted functions.
- Administrators are identified by a database-verified helper with fixed `search_path` and minimal grants.
- Cross-borrower and borrower-to-admin denial is tested with real JWT contexts.

## Secrets

- `.env.local` and Vercel environment values are never committed.
- The Supabase anonymous/publishable key may be public only because RLS protects data.
- The service-role key is optional, server-only, and must never use `NEXT_PUBLIC_`.
- Tokens, credentials, or sensitive borrower information must not appear in logs or audit JSON.

## Financial integrity

Positive-amount constraints, exact minor-unit arithmetic, valid-transition functions, immutable repayment rows, row locks, and atomic transactions protect balances and lifecycle state.

## Data minimization

The MVP does not collect BVN, NIN, bank credentials, payment-card information, or unnecessary KYC data.
