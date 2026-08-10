# Database Design

## Money representation

Money is stored as PostgreSQL `BIGINT` minor units (kobo). For example, ₦120,000 is stored as `12000000`. JavaScript floating-point arithmetic is forbidden for financial calculations.

Interest rates use an exact PostgreSQL `NUMERIC` value. Schedule generation rounds deterministically and assigns any remainder to the final installment so installments sum exactly to total repayable.

## Planned tables

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

UUID primary keys, `timestamptz`, foreign keys, checks, unique human-readable numbers, and query-specific indexes will be used consistently.

## Transaction rules

Application transitions, approval, disbursement, schedule generation, repayment allocation, and loan completion will use allow-listed PostgreSQL functions. Repayment allocation locks the loan, inserts a transaction, allocates the oldest outstanding installments, recalculates aggregates, and records history in one transaction.

## Migration workflow

1. Create a timestamped migration.
2. Review SQL, permissions, RLS, and rollback implications.
3. Run `npm run db:reset` against local Supabase.
4. Run database and application tests.
5. Regenerate TypeScript database types.
6. Commit migration and generated types together.
