# Testing Strategy

## Automated gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run db:test
npm run build
```

## Unit coverage

- Loan total and exact integer interest calculations — implemented
- Repayment schedule amount generation and final-installment rounding — implemented
- Outstanding balance calculation — implemented
- Full and partial repayment allocation — implemented
- Overdue detection — implemented in PostgreSQL
- Negative/zero/overpayment rejection — implemented
- Application and loan status transitions
- Administrator authorization helper
- Authentication redirect allow-listing
- Required public environment validation

## Database coverage

The pgTAP suites under `supabase/tests` cover schema presence, integer-money
constraints, allow-listed status transitions, derived overdue state, immutable
repayments, borrower/application consistency, cross-borrower denial,
administrator visibility, administrator-only loan creation and repayment
recording, idempotency, interest totals, disbursement, exact schedule totals,
partial/cross-installment/full repayment allocation, aggregate balances,
history, and audit data.

They require the Docker-backed local Supabase runtime. An isolated PostgreSQL 17
replay may be used as a supplementary syntax and policy smoke test, but it does
not replace `npm run db:reset`, `npm run db:lint`, and `npm run db:test` against
Supabase.

GitHub CI runs those Supabase database gates on every pull request to `develop`
or `main` and also verifies that the committed TypeScript database types match
the replayed schema.

## Planned application integration coverage

- Anonymous access denial
- Borrower A cannot access Borrower B
- Borrower cannot invoke administrator operations
- Administrator can perform approved operations
- Repayment transaction, allocation, balance, schedule, and history commit atomically

## Manual QA

Registration, login, reset, profile, application submission, admin review, approval, rejection, disbursement, schedule, repayment, overdue/full repayment, search/filter, responsive layouts, logout, Vercel environment, and incognito sessions must be checked before release.

Test results must be reported accurately; skipped or failing tests cannot be described as passing.

## Phase 3 verification — 12 August 2026

Environment: local Next.js 16.3.0 server using the hosted `LoanTrack NG`
Supabase project (`qrtenbcdiqdgehzonejb`). Test records were clearly labeled as
E2E demonstration data.

Passed:

- Registration created an authenticated borrower account.
- The signup trigger created the borrower profile and borrower role.
- Session cookies persisted across protected dashboard/profile navigation.
- Login and logout completed successfully.
- Anonymous dashboard access redirected to login.
- Borrower profile values were saved and persisted through the server action.
- Dashboard changed from profile-required to profile-complete state.
- Loan application submission validates integer-kobo amounts, profile completion, duration, dates, and purpose text in server/database code.
- Application review is restricted to database-verified administrators and uses allow-listed status transitions with immutable history/audit records.
- Borrower access to `/admin` was denied server-side and redirected safely.
- Registration/profile pages rendered meaningful content with no Next.js error overlay.
- Vercel Preview deployment `dpl_GdKwo4G16J7C9rdhyfuwiuQTPsMi` reached
  `READY`; `/login` returned 200 and anonymous `/dashboard` returned the
  expected 307 redirect.

Not yet verified:

- Password recovery passed an owner-inbox production test on 2026-08-12. The
  fresh link emitted Supabase's browser recovery event, the password update
  completed, the recovery session signed out, and the application returned to
  sign-in with a success message. Earlier PKCE verifier failures are retained in
  this record because they motivated the browser-only recovery design.
- Production/incognito authentication must be checked after the reviewed branch
  is merged and deployed to the production alias.

## Phase 4 automated verification — 13 August 2026

Passed locally:

- Clean Supabase migration replay and seed.
- Database lint with no schema findings.
- 53 pgTAP assertions across schema, RLS, application, loan creation,
  disbursement, schedule, history, and audit behavior.
- 22 Vitest assertions, including zero/percentage interest and exact final
  installment rounding.
- TypeScript strict check and ESLint.
- Authenticated browser smoke test with synthetic accounts: administrator
  post-login routing, role-specific navigation, approved loan creation,
  disbursement, six-installment schedule rendering, lifecycle history, and
  borrower RLS visibility.
- No Next.js error overlay appeared during the browser workflow.

The Phase 4 migration and application were subsequently deployed to production.

## Phase 5 automated verification — 13 August 2026

Passed locally before deployment:

- Clean Supabase migration replay and database lint with no findings.
- 76 pgTAP assertions across schema, RLS, application, loan, schedule, and
  repayment behavior.
- 26 Vitest assertions, including oldest-first partial allocation, allocation
  across installments, exact full repayment, and invalid amount rejection.
- TypeScript strict check and ESLint.
- The repayment Server Action and React views re-authorize administrators,
  minimize client-side code, and parallelize independent server reads.
- Authenticated browser QA against the local synthetic seed: the administrator
  recorded ₦20,000, the outstanding balance fell from ₦80,000 to ₦60,000,
  installment 3 became paid, and the immutable transaction remained visible.
- The borrower dashboard and repayment history reflected ₦60,000 repaid and
  ₦60,000 outstanding, while direct borrower navigation to the administrator
  repayment route was denied server-side.
- No browser console errors or Next.js error overlay appeared during the
  administrator/borrower workflow.

Hosted rollout passed:

- Migration `20260813120000` is recorded in the linked production Supabase
  migration history.
- Vercel production deployment `dpl_4YtR21nTjtwdpmQhiFvYSRMexBXz` reached
  `READY` and owns the public production aliases.
- Production `/login` returned HTTP 200 and anonymous `/dashboard` returned the
  expected 307 sign-in redirect.
- Vercel reported no runtime error logs for the new deployment, and both GitHub
  CI jobs passed for commit `2064561`.

Authenticated production/private-browser QA remains a release gate because no
production password was stored in the repository or automation environment.
