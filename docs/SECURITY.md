# Security

## Authentication and authorization

Supabase Auth supplies user identity and persistent sessions. Roles live in a protected `user_roles` table and are never trusted from client-controlled metadata. UI navigation is role-aware, but server/database authorization is mandatory.

The Next.js integration uses request-scoped Supabase SSR clients, HTTP-only
session cookies managed through `src/proxy.ts`, verified `getUser()` calls in
server code, and database role lookup for administrator routes. Authentication
callbacks accept only validated internal redirect paths. Password-reset
requests return the same response whether or not an email exists to reduce
account enumeration.

Password recovery deliberately uses Supabase's implicit browser flow while
ordinary SSR authentication remains PKCE-based. This avoids PKCE verifier loss
when a reset email opens outside the browser context that submitted the request.
Supabase returns the recovery session in a URL fragment, which browsers do not
send to Vercel or place in server access logs. The recovery client consumes the
fragment, immediately removes it from browser history, updates the password only
after Supabase emits `PASSWORD_RECOVERY`, and signs out after success.

Hosted custom email templates that support a server-side token-hash flow are
not available with Supabase's Free-tier default email provider. A custom SMTP
provider and token-hash confirmation route remain the preferred production
upgrade.

Supabase Auth uses the production Vercel URL as its Site URL. The redirect
allow-list contains scoped production and local callback paths plus a
team-scoped Vercel preview wildcard; it does not allow arbitrary external
origins.

## RLS strategy

- RLS is enabled on every public application table.
- Anonymous users receive no application-record access.
- Borrowers access only records connected to their own profile.
- Borrowers receive read-only access to their loans, schedules, repayments, and history.
- Borrowers can create only their own draft applications; column grants exclude administrator notes and review timestamps.
- Borrower profile updates use column-level grants, including only the structured name and minimal contact/work fields; RLS restricts the row to the authenticated owner.
- Sensitive updates are unavailable as broad table grants and instead use restricted functions.
- Loan application submission and review use security-definer functions with fixed empty search paths, explicit authentication/role checks, row locking, and allow-listed transitions.
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
