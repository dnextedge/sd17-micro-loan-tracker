# Database Design

## Money representation

Money is stored as PostgreSQL `BIGINT` minor units (kobo). For example, ₦120,000 is stored as `12000000`. JavaScript floating-point arithmetic is forbidden for financial calculations.

Interest rates use an exact PostgreSQL `NUMERIC` value. Schedule generation rounds deterministically and assigns any remainder to the final installment so installments sum exactly to total repayable.

## Core tables

| Table                 | Responsibility                                            |
| --------------------- | --------------------------------------------------------- |
| `profiles`            | Minimal borrower identity/profile linked to Supabase Auth |
| `user_roles`          | Protected borrower/admin assignment                       |
| `loan_applications`   | Requests and review lifecycle                             |
| `loans`               | Approved/disbursed loan financial state                   |
| `repayment_schedules` | Installment due, paid, outstanding, and status            |
| `repayments`          | Immutable payment transactions                            |
| `loan_status_history` | Append-only application and loan transitions              |
| `notifications`       | In-app user notices                                       |
| `audit_logs`          | Important mutation audit metadata                         |

UUID primary keys, `timestamptz`, foreign keys, checks, unique human-readable
numbers, and query-specific indexes are defined in
`supabase/migrations/20260810160000_initial_schema.sql`.

Application and loan states use PostgreSQL enums and allow-listed transition
functions. A composite foreign key prevents a loan from being attached to an
application belonging to another borrower. The
`repayment_schedule_effective` security-invoker view derives overdue status
when an unpaid installment is past its due date.

## Transaction rules

Application and loan transitions are allow-listed in PostgreSQL. Repayment
rows, lifecycle history, and audit rows are append-only. Approval,
disbursement, schedule generation, and repayment allocation functions will be
added with their application workflows; allocation will lock the loan, insert
a transaction, allocate oldest outstanding installments, recalculate
aggregates, and record history in one transaction.

## Demonstration data

`supabase/seed.sql` contains synthetic, clearly labelled local demonstration
records for Emem James and an administrator. The sample loan stores ₦120,000 as
`12000000` kobo, ₦40,000 repaid as `4000000`, and ₦80,000 outstanding as
`8000000`. It contains six ₦20,000 installments and two immutable repayment
transactions.

## Migration workflow

1. Create a timestamped migration.
2. Review SQL, permissions, RLS, and rollback implications.
3. Run `npm run db:reset` against local Supabase.
4. Run database and application tests.
5. Regenerate `src/types/database.types.ts` with the Supabase CLI.
6. Commit migration and generated types together.

CI regenerates the public-schema types after replaying migrations and fails if
the committed file has drifted from PostgreSQL.
