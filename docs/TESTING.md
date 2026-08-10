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

## Database coverage

The pgTAP suites under `supabase/tests` cover schema presence, integer-money
constraints, allow-listed status transitions, derived overdue state, immutable
repayments, borrower/application consistency, cross-borrower denial, and
administrator visibility.

They require the Docker-backed local Supabase runtime. An isolated PostgreSQL 17
replay may be used as a supplementary syntax and policy smoke test, but it does
not replace `npm run db:reset`, `npm run db:lint`, and `npm run db:test` against
Supabase.

## Planned application integration coverage

- Anonymous access denial
- Borrower A cannot access Borrower B
- Borrower cannot invoke administrator operations
- Administrator can perform approved operations
- Repayment transaction, allocation, balance, schedule, and history commit atomically

## Manual QA

Registration, login, reset, profile, application submission, admin review, approval, rejection, disbursement, schedule, repayment, overdue/full repayment, search/filter, responsive layouts, logout, Vercel environment, and incognito sessions must be checked before release.

Test results must be reported accurately; skipped or failing tests cannot be described as passing.
