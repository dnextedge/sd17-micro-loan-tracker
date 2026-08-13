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
- Outstanding balance calculation
- Full and partial repayment allocation
- Overdue detection
- Negative/zero/overpayment rejection
- Application and loan status transitions
- Administrator authorization helper
- Authentication redirect allow-listing
- Required public environment validation

## Database coverage

The pgTAP suites under `supabase/tests` cover schema presence, integer-money
constraints, allow-listed status transitions, derived overdue state, immutable
repayments, borrower/application consistency, cross-borrower denial,
administrator visibility, administrator-only loan creation, idempotency,
interest totals, disbursement, exact schedule totals, history, and audit data.

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

Production QA remains pending until the migration and application deployment
are completed.
