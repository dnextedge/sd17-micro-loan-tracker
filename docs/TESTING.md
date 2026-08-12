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

## Planned unit coverage

- Loan total and exact interest calculations
- Repayment schedule generation and final-installment rounding
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
repayments, borrower/application consistency, cross-borrower denial, and
administrator visibility.

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
- Borrower access to `/admin` was denied server-side and redirected safely.
- Registration/profile pages rendered meaningful content with no Next.js error overlay.
- Vercel Preview deployment `dpl_GdKwo4G16J7C9rdhyfuwiuQTPsMi` reached
  `READY`; `/login` returned 200 and anonymous `/dashboard` returned the
  expected 307 redirect.

Not yet verified:

- The initial owner-inbox reset test exposed that Supabase's default recovery
  template returned a browser-only session fragment. The application correctly
  rejected the resulting unauthenticated update. Because hosted custom templates
  are unavailable with the Free-tier default email provider, a browser recovery
  bridge now consumes the one-time fragment into shared cookies before the
  server-authorized password mutation. The corrected flow must be retested.
- Production/incognito authentication must be checked after the reviewed branch
  is merged and deployed to the production alias.
