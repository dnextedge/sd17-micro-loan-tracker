# Database tests

Run these pgTAP suites after starting the local Supabase stack:

```bash
npm run db:reset
npm run db:test
```

- `000_schema.test.sql` covers the schema, integer-money constraints, lifecycle
  transitions, overdue derivation, immutable repayments, and borrower consistency.
- `010_rls.test.sql` exercises borrower ownership boundaries and administrator
  visibility using authenticated JWT claims.
- `020_loan_workflow.test.sql` covers administrator-only loan creation,
  idempotency, exact interest and installment totals, disbursement, schedule
  generation, history, audit records, and borrower visibility.
- `030_repayment_workflow.test.sql` covers administrator-only recording,
  negative and excessive payment rejection, partial and cross-installment
  allocation, aggregate balances, full repayment, immutable transaction
  preservation, audit data, and borrower visibility.

All fixtures are synthetic and every suite runs inside a rolled-back transaction.
