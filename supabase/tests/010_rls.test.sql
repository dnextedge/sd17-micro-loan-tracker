begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(10);

insert into public.loan_applications (
  id,
  borrower_id,
  application_number,
  requested_amount,
  purpose,
  repayment_duration_months,
  status
)
select
  '30000000-0000-4000-8000-000000000099',
  id,
  'APP-RLS-000099',
  5000000,
  'Cross-borrower row-level security test fixture',
  3,
  'draft'
from public.profiles
where user_id = '10000000-0000-4000-8000-000000000002';

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::integer from public.loan_applications where id = '30000000-0000-4000-8000-000000000001'),
  1,
  'borrower can read own application'
);
select is(
  (select count(*)::integer from public.loan_applications where id = '30000000-0000-4000-8000-000000000099'),
  0,
  'borrower cannot read another profile application'
);
select is(
  (select count(*)::integer from public.profiles),
  1,
  'borrower can read only own profile'
);
select throws_ok(
  $$
    insert into public.loan_applications (
      borrower_id,
      requested_amount,
      purpose,
      repayment_duration_months,
      borrower_notes
    )
    select id, 2500000, 'Restock household goods for retail shop', 3, 'RLS own-row insert test'
    from public.profiles
    where user_id = '10000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  null,
  'borrower cannot bypass the restricted submission function'
);
select lives_ok(
  $$
    select public.submit_loan_application(
      2500000,
      'Restock household goods for retail shop',
      3::smallint,
      null,
      'Restricted submission function test'
    )
  $$,
  'completed borrower can submit through the restricted function'
);
select is(
  (
    select count(*)::integer
    from public.loan_applications
    where purpose = 'Restock household goods for retail shop'
      and status = 'submitted'
  ),
  1,
  'restricted submission creates a visible submitted application for its caller'
);
select is(
  (select count(*)::integer from public.audit_logs),
  0,
  'borrower cannot read audit logs'
);
select ok(
  not has_column_privilege(
    'authenticated',
    'public.user_roles',
    'role',
    'UPDATE'
  ),
  'authenticated users cannot update role assignments'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000002',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

select ok(
  (select count(*) from public.loan_applications) >= 2,
  'administrator can read all applications'
);
select ok(
  (select count(*) from public.audit_logs) >= 1,
  'administrator can read audit logs'
);

select * from finish();
rollback;
