begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(22);

insert into public.loan_applications (
  id,
  borrower_id,
  application_number,
  requested_amount,
  purpose,
  repayment_duration_months,
  preferred_start_date,
  status,
  submitted_at,
  reviewed_at,
  approved_at
)
select
  '30000000-0000-4000-8000-000000000097',
  id,
  'APP-LOAN-WORKFLOW-97',
  12000000,
  'Purchase additional demonstration business inventory',
  6,
  current_date + 30,
  'approved',
  now() - interval '2 days',
  now() - interval '1 day',
  now()
from public.profiles
where user_id = '10000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ select public.create_loan_from_application('30000000-0000-4000-8000-000000000097', 2.5) $$,
  '42501',
  'Administrator access is required',
  'borrower cannot create a loan'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ select public.create_loan_from_application('30000000-0000-4000-8000-000000000097', 2.5) $$,
  'administrator can create a loan from an approved application'
);
select is((select count(*)::integer from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 1, 'one loan is created');
select is((select principal_amount from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 12000000::bigint, 'principal matches the approved request');
select is((select interest_amount from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 300000::bigint, 'interest is calculated with numeric arithmetic');
select is((select total_repayable from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 12300000::bigint, 'total repayable includes interest');
select is((select installment_amount from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 2050000::bigint, 'monthly installment is calculated in kobo');
select is((select status::text from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 'approved', 'new loan begins approved');

select lives_ok(
  $$ select public.create_loan_from_application('30000000-0000-4000-8000-000000000097', 2.5) $$,
  'repeated loan creation is idempotent'
);
select is((select count(*)::integer from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 1, 'idempotency prevents duplicate loans');

select throws_ok(
  $$
    select public.disburse_loan(
      (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'),
      current_date - 1
    )
  $$,
  '23514',
  'First repayment date cannot be in the past',
  'past first repayment date is rejected'
);

select lives_ok(
  $$
    select public.disburse_loan(
      (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'),
      current_date + 30
    )
  $$,
  'administrator can disburse a loan and generate its schedule'
);
select is((select status::text from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 'disbursed', 'loan status becomes disbursed');
select is((select count(*)::integer from public.repayment_schedules where loan_id = (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097')), 6, 'one schedule row is generated per month');
select is((select sum(amount_due) from public.repayment_schedules where loan_id = (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097')), 12300000::numeric, 'schedule amounts sum to total repayable');
select is((select min(due_date) from public.repayment_schedules where loan_id = (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097')), current_date + 30, 'first installment uses the selected repayment date');
select is((select maturity_date from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), (current_date + 30 + interval '5 months')::date, 'maturity matches the final installment date');
select is((select count(*)::integer from public.loan_status_history where entity_id = (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097') and new_status = 'approved'), 1, 'initial approved status is recorded');
select is((select count(*)::integer from public.loan_status_history where entity_id = (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097') and new_status = 'disbursed'), 1, 'disbursement status is recorded');
select is((select count(*)::integer from public.audit_logs where entity_id = (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097') and action in ('loan.created', 'loan.disbursed')), 2, 'creation and disbursement are audited');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select is((select count(*)::integer from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097'), 1, 'borrower can read own loan');
select is((select count(*)::integer from public.repayment_schedules where loan_id = (select id from public.loans where loan_application_id = '30000000-0000-4000-8000-000000000097')), 6, 'borrower can read own repayment schedule');

select * from finish();
rollback;
