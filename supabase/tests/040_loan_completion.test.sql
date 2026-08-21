begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(9);

insert into public.loan_applications (
  id, borrower_id, application_number, requested_amount, purpose,
  repayment_duration_months, status, submitted_at, reviewed_at, approved_at
)
select '30000000-0000-4000-8000-000000000097', id, 'APP-COMPLETE-97',
  2000000, 'Loan completion test fixture', 1, 'approved', now(), now(), now()
from public.profiles where user_id = '10000000-0000-4000-8000-000000000001';

insert into public.loans (
  id, loan_application_id, borrower_id, loan_number, principal_amount,
  total_repayable, repayment_duration_months, installment_amount,
  amount_repaid, outstanding_balance, start_date, maturity_date,
  disbursed_at, status
)
select '40000000-0000-4000-8000-000000000097', id, borrower_id,
  'LOAN-COMPLETE-97', 2000000, 2000000, 1, 2000000, 2000000, 0,
  current_date - 30, current_date, now() - interval '30 days', 'fully_repaid'
from public.loan_applications where id = '30000000-0000-4000-8000-000000000097';

insert into public.repayment_schedules (
  loan_id, installment_number, due_date, amount_due, amount_paid,
  outstanding_amount, status, paid_at
) values (
  '40000000-0000-4000-8000-000000000097', 1, current_date,
  2000000, 2000000, 0, 'paid', now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ select public.complete_loan('40000000-0000-4000-8000-000000000097', null) $$,
  '42501', 'Administrator access is required', 'borrower cannot complete a loan'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ select public.complete_loan('40000000-0000-4000-8000-000000000001', null) $$,
  '23514', 'Only a fully repaid loan can be completed', 'active loan cannot be completed'
);
select lives_ok(
  $$ select public.complete_loan('40000000-0000-4000-8000-000000000097', 'Final records verified') $$,
  'administrator can complete a fully repaid loan'
);
select is(
  (select status::text from public.loans where id = '40000000-0000-4000-8000-000000000097'),
  'completed', 'loan status becomes completed'
);
select is(
  (select count(*)::integer from public.loan_status_history where entity_type = 'loan' and entity_id = '40000000-0000-4000-8000-000000000097' and new_status = 'completed'),
  1, 'completion creates status history'
);
select is(
  (select count(*)::integer from public.audit_logs where action = 'loan.completed' and entity_id = '40000000-0000-4000-8000-000000000097'),
  1, 'completion creates an audit record'
);
select lives_ok(
  $$ select public.complete_loan('40000000-0000-4000-8000-000000000097', null) $$,
  'repeated completion is idempotent'
);
select is(
  (select count(*)::integer from public.audit_logs where action = 'loan.completed' and entity_id = '40000000-0000-4000-8000-000000000097'),
  1, 'idempotent completion does not duplicate audit records'
);
select is(
  (select count(*)::integer from public.loan_status_history where entity_type = 'loan' and entity_id = '40000000-0000-4000-8000-000000000097' and new_status = 'completed'),
  1, 'idempotent completion does not duplicate history'
);

select * from finish();
rollback;
