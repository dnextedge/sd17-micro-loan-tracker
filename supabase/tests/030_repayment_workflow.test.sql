begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(23);

insert into public.loan_applications (
  id, borrower_id, application_number, requested_amount, purpose,
  repayment_duration_months, status, submitted_at, reviewed_at, approved_at
)
select '30000000-0000-4000-8000-000000000096', id, 'APP-REPAYMENT-96',
  6000000, 'Repayment allocation test fixture purchase', 3, 'approved',
  now() - interval '5 days', now() - interval '4 days', now() - interval '3 days'
from public.profiles where user_id = '10000000-0000-4000-8000-000000000001';

insert into public.loans (
  id, loan_application_id, borrower_id, loan_number, principal_amount,
  total_repayable, repayment_duration_months, installment_amount,
  outstanding_balance, start_date, maturity_date, disbursed_at, status
)
select '40000000-0000-4000-8000-000000000096', id, borrower_id,
  'LOAN-REPAYMENT-96', 6000000, 6000000, 3, 2000000, 6000000,
  current_date - 2, current_date + 60, now() - interval '2 days', 'disbursed'
from public.loan_applications where id = '30000000-0000-4000-8000-000000000096';

insert into public.repayment_schedules (
  loan_id, installment_number, due_date, amount_due, outstanding_amount
)
values
  ('40000000-0000-4000-8000-000000000096', 1, current_date + 10, 2000000, 2000000),
  ('40000000-0000-4000-8000-000000000096', 2, current_date + 40, 2000000, 2000000),
  ('40000000-0000-4000-8000-000000000096', 3, current_date + 70, 2000000, 2000000);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ select public.record_repayment('40000000-0000-4000-8000-000000000096', 500000, 'cash', current_date, null, null) $$,
  '42501', 'Administrator access is required', 'borrower cannot record repayment'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ select public.record_repayment('40000000-0000-4000-8000-000000000096', -1, 'cash', current_date, null, null) $$,
  '23514', 'Repayment amount must be greater than zero', 'negative repayment is rejected'
);
select throws_ok(
  $$ select public.record_repayment('40000000-0000-4000-8000-000000000096', 6000001, 'cash', current_date, null, null) $$,
  '23514', 'Repayment cannot exceed the outstanding balance', 'overpayment is rejected'
);

select lives_ok(
  $$ select public.record_repayment('40000000-0000-4000-8000-000000000096', 500000, 'cash', current_date, 'PAY-TEST-PARTIAL', 'Partial payment') $$,
  'partial repayment is recorded'
);
select is((select count(*)::integer from public.repayments where loan_id = '40000000-0000-4000-8000-000000000096'), 1, 'one immutable transaction is created');
select is((select amount_paid from public.repayment_schedules where loan_id = '40000000-0000-4000-8000-000000000096' and installment_number = 1), 500000::bigint, 'partial amount allocates to oldest installment');
select is((select status::text from public.repayment_schedules where loan_id = '40000000-0000-4000-8000-000000000096' and installment_number = 1), 'partially_paid', 'partial schedule status is set');
select is((select amount_repaid from public.loans where id = '40000000-0000-4000-8000-000000000096'), 500000::bigint, 'loan amount repaid increases');
select is((select outstanding_balance from public.loans where id = '40000000-0000-4000-8000-000000000096'), 5500000::bigint, 'loan outstanding decreases');
select is((select status::text from public.loans where id = '40000000-0000-4000-8000-000000000096'), 'active', 'first repayment activates disbursed loan');

select lives_ok(
  $$ select public.record_repayment('40000000-0000-4000-8000-000000000096', 3500000, 'bank_transfer', current_date, 'PAY-TEST-SPAN', 'Spanning payment') $$,
  'payment can span multiple installments'
);
select is((select status::text from public.repayment_schedules where loan_id = '40000000-0000-4000-8000-000000000096' and installment_number = 1), 'paid', 'first installment becomes paid');
select is((select status::text from public.repayment_schedules where loan_id = '40000000-0000-4000-8000-000000000096' and installment_number = 2), 'paid', 'second installment becomes paid');
select is((select amount_paid from public.repayment_schedules where loan_id = '40000000-0000-4000-8000-000000000096' and installment_number = 3), 0::bigint, 'later installment remains untouched');
select is((select outstanding_balance from public.loans where id = '40000000-0000-4000-8000-000000000096'), 2000000::bigint, 'spanning payment recalculates balance');

select lives_ok(
  $$ select public.record_repayment('40000000-0000-4000-8000-000000000096', 2000000, 'other', current_date, null, 'Final payment') $$,
  'final repayment is recorded'
);
select is((select outstanding_balance from public.loans where id = '40000000-0000-4000-8000-000000000096'), 0::bigint, 'final balance is zero');
select is((select amount_repaid from public.loans where id = '40000000-0000-4000-8000-000000000096'), 6000000::bigint, 'total repaid matches total repayable');
select is((select status::text from public.loans where id = '40000000-0000-4000-8000-000000000096'), 'fully_repaid', 'loan becomes fully repaid');
select is((select count(*)::integer from public.repayment_schedules where loan_id = '40000000-0000-4000-8000-000000000096' and status = 'paid'), 3, 'all installments are paid');
select is((select count(*)::integer from public.repayments where loan_id = '40000000-0000-4000-8000-000000000096'), 3, 'transaction history preserves every payment');
select is((select count(*)::integer from public.audit_logs where action = 'repayment.recorded' and new_data ->> 'loan_id' = '40000000-0000-4000-8000-000000000096'), 3, 'every payment is audited');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select is((select count(*)::integer from public.repayments where loan_id = '40000000-0000-4000-8000-000000000096'), 3, 'borrower can read own repayment history');

select * from finish();
rollback;
