begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(21);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'loan_applications', 'loan applications table exists');
select has_table('public', 'loans', 'loans table exists');
select has_table('public', 'repayment_schedules', 'repayment schedules table exists');
select has_table('public', 'repayments', 'repayments table exists');

select col_type_is(
  'public',
  'loans',
  'principal_amount',
  'bigint',
  'money is stored as integer minor units'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.loan_applications'::regclass),
  'loan application RLS is enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.repayments'::regclass),
  'repayment RLS is enabled'
);

select ok(
  private.application_transition_allowed('draft', 'submitted'),
  'draft application can be submitted'
);
select ok(
  private.application_transition_allowed('under_review', 'approved'),
  'reviewed application can be approved'
);
select ok(
  not private.application_transition_allowed('submitted', 'approved'),
  'submitted application cannot skip review'
);
select ok(
  not private.application_transition_allowed('approved', 'draft'),
  'approved application cannot return to draft'
);
select ok(
  private.loan_transition_allowed('approved', 'disbursed'),
  'approved loan can be disbursed'
);
select ok(
  private.loan_transition_allowed('active', 'fully_repaid'),
  'active loan can become fully repaid'
);
select ok(
  private.loan_transition_allowed('fully_repaid', 'completed'),
  'fully repaid loan can be completed'
);
select ok(
  not private.loan_transition_allowed('approved', 'completed'),
  'approved loan cannot skip to completed'
);

select throws_ok(
  $$
    insert into public.loan_applications (
      borrower_id,
      requested_amount,
      purpose,
      repayment_duration_months
    )
    select id, -1, 'Invalid negative amount test', 6
    from public.profiles
    where user_id = '10000000-0000-4000-8000-000000000001'
  $$,
  '23514',
  null,
  'negative loan request is rejected'
);

insert into public.repayment_schedules (
  loan_id,
  installment_number,
  due_date,
  amount_due,
  amount_paid,
  outstanding_amount,
  status
)
values (
  '40000000-0000-4000-8000-000000000001',
  99,
  current_date - 1,
  10000,
  0,
  10000,
  'pending'
);

select is(
  (
    select effective_status::text
    from public.repayment_schedule_effective
    where loan_id = '40000000-0000-4000-8000-000000000001'
      and installment_number = 99
  ),
  'overdue',
  'past unpaid installment is effectively overdue'
);

select throws_ok(
  $$
    update public.repayments
    set amount = amount + 1
    where id = '60000000-0000-4000-8000-000000000001'
  $$,
  '55000',
  'repayments records are append-only',
  'repayment transaction cannot be overwritten'
);

select throws_ok(
  $$
    update public.loan_applications
    set status = 'draft'
    where id = '30000000-0000-4000-8000-000000000001'
  $$,
  '23514',
  'Invalid application status transition: approved -> draft',
  'invalid persisted application transition is rejected'
);

insert into public.loan_applications (
  id,
  borrower_id,
  application_number,
  requested_amount,
  purpose,
  repayment_duration_months
)
values (
  '30000000-0000-4000-8000-000000000098',
  '11000000-0000-4000-8000-000000000001',
  'APP-BORROWER-FK-98',
  100000,
  'Borrower consistency foreign key test fixture',
  1
);

select throws_ok(
  $$
    insert into public.loans (
      loan_application_id,
      borrower_id,
      principal_amount,
      total_repayable,
      repayment_duration_months,
      installment_amount,
      outstanding_balance
    )
    select
      '30000000-0000-4000-8000-000000000098',
      id,
      100000,
      100000,
      1,
      100000,
      100000
    from public.profiles
    where user_id = '10000000-0000-4000-8000-000000000002'
  $$,
  '23503',
  null,
  'loan borrower must match application borrower'
);

select * from finish();
rollback;
