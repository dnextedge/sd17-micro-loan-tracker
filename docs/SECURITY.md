# Security

## Authentication and authorization

Supabase Auth supplies user identity and persistent sessions. Roles live in a protected `user_roles` table and are never trusted from client-controlled metadata. UI navigation is role-aware, but server/database authorization is mandatory.

The Next.js integration uses request-scoped Supabase SSR clients, HTTP-only
session cookies managed through `src/proxy.ts`, verified `getUser()` calls in
server code, and database role lookup for administrator routes. Authentication
callbacks accept only validated internal redirect paths. Password-reset
requests return the same response whether or not an email exists to reduce
account enumeration.

Password recovery uses Supabase's browser recovery event because Free-tier
projects using the default email provider cannot customize email templates.
The browser client consumes the one-time session fragment, persists the session
to cookies shared with the server client, and immediately removes the fragment
from browser history. The password mutation still re-verifies the user
server-side before calling Supabase; no authorization decision trusts only
browser state.

Supabase Auth uses the production Vercel URL as its Site URL. The redirect
allow-list contains exact production and local callback paths plus a
team-scoped Vercel preview wildcard; it does not allow arbitrary external
origins.

## RLS strategy

- RLS is enabled on every public application table.
- Anonymous users receive no application-record access.
- Borrowers access only records connected to their own profile.
- Borrowers receive read-only access to their loans, schedules, repayments, and history.
- Borrowers can create only their own draft applications; column grants exclude administrator notes and review timestamps.
- Sensitive updates are unavailable as broad table grants and instead use restricted functions.
- Administrators are identified by a database-verified helper with fixed `search_path` and minimal grants.
- Cross-borrower and borrower-to-admin denial is covered by pgTAP suites using authenticated JWT claims.

The `private` helper schema is not exposed through the Data API. Security-definer
helpers use an empty `search_path`, role assignment cannot be changed through
authenticated table grants, and signup metadata is never trusted for roles.

## Secrets

- `.env.local` and Vercel environment values are never committed.
- The Supabase anonymous/publishable key may be public only because RLS protects data.
- The service-role key is optional, server-only, and must never use `NEXT_PUBLIC_`.
- Tokens, credentials, or sensitive borrower information must not appear in logs or audit JSON.

## Financial integrity

Positive-amount constraints, exact minor-unit arithmetic, valid-transition functions, immutable repayment rows, row locks, and atomic transactions protect balances and lifecycle state.

## Data minimization

The MVP does not collect BVN, NIN, bank credentials, payment-card information, or unnecessary KYC data.
