-- LoanTrack NG synthetic demonstration data.
-- These records and credentials are for local/capstone demonstration only.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'emem.borrower@example.test',
    extensions.crypt('LoanTrackDemo!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Emem James","demo_record":true}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'admin@example.test',
    extensions.crypt('LoanTrackAdmin!2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Demo Administrator","demo_record":true}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '{"sub":"10000000-0000-4000-8000-000000000001","email":"emem.borrower@example.test","email_verified":true}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '{"sub":"10000000-0000-4000-8000-000000000002","email":"admin@example.test","email_verified":true}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do nothing;

update public.profiles
set id = '11000000-0000-4000-8000-000000000001'
where user_id = '10000000-0000-4000-8000-000000000001';

update public.profiles
set id = '11000000-0000-4000-8000-000000000002'
where user_id = '10000000-0000-4000-8000-000000000002';

update public.profiles
set
  full_name = 'Emem James',
  phone = '+234 803 000 0017',
  email = 'emem.borrower@example.test',
  address = 'Demo address, Uyo',
  state = 'Akwa Ibom',
  occupation = 'Provision Store Owner',
  employment_type = 'Self-employed',
  business_type = 'Retail provisions',
  profile_completed_at = now()
where user_id = '10000000-0000-4000-8000-000000000001';

update public.user_roles
set
  role = 'admin',
  assigned_by = '10000000-0000-4000-8000-000000000002'
where user_id = '10000000-0000-4000-8000-000000000002';

insert into public.loan_applications (
  id,
  borrower_id,
  application_number,
  requested_amount,
  purpose,
  repayment_duration_months,
  preferred_start_date,
  status,
  borrower_notes,
  admin_notes,
  submitted_at,
  reviewed_at,
  approved_at,
  created_at,
  updated_at
)
select
  '30000000-0000-4000-8000-000000000001',
  p.id,
  'APP-DEMO-000001',
  12000000,
  'Purchase additional business inventory',
  6,
  current_date - 2,
  'approved',
  'Synthetic demonstration application for the SD-17 capstone.',
  'Approved for demonstration at 0% interest.',
  now() - interval '12 days',
  now() - interval '11 days',
  now() - interval '10 days',
  now() - interval '12 days',
  now() - interval '10 days'
from public.profiles as p
where p.user_id = '10000000-0000-4000-8000-000000000001'
on conflict (id) do nothing;

insert into public.loans (
  id,
  loan_application_id,
  borrower_id,
  loan_number,
  principal_amount,
  interest_rate,
  interest_amount,
  total_repayable,
  repayment_duration_months,
  repayment_frequency,
  installment_amount,
  amount_repaid,
  outstanding_balance,
  start_date,
  maturity_date,
  disbursed_at,
  status,
  created_at,
  updated_at
)
select
  '40000000-0000-4000-8000-000000000001',
  la.id,
  la.borrower_id,
  'LOAN-DEMO-000001',
  12000000,
  0,
  0,
  12000000,
  6,
  'monthly',
  2000000,
  4000000,
  8000000,
  current_date - 2,
  (current_date - 2 + interval '5 months')::date,
  now() - interval '2 days',
  'active',
  now() - interval '10 days',
  now()
from public.loan_applications as la
where la.id = '30000000-0000-4000-8000-000000000001'
on conflict (id) do nothing;

insert into public.repayment_schedules (
  id,
  loan_id,
  installment_number,
  due_date,
  amount_due,
  amount_paid,
  outstanding_amount,
  status,
  paid_at
)
values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 1, current_date - 2, 2000000, 2000000, 0, 'paid', now() - interval '1 day'),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', 2, (current_date - 2 + interval '1 month')::date, 2000000, 2000000, 0, 'paid', now()),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000001', 3, (current_date - 2 + interval '2 months')::date, 2000000, 0, 2000000, 'pending', null),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000001', 4, (current_date - 2 + interval '3 months')::date, 2000000, 0, 2000000, 'pending', null),
  ('50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000001', 5, (current_date - 2 + interval '4 months')::date, 2000000, 0, 2000000, 'pending', null),
  ('50000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000001', 6, (current_date - 2 + interval '5 months')::date, 2000000, 0, 2000000, 'pending', null)
on conflict (id) do nothing;

insert into public.repayments (
  id,
  loan_id,
  repayment_schedule_id,
  borrower_id,
  payment_reference,
  amount,
  payment_method,
  payment_date,
  notes,
  recorded_by,
  created_at
)
select
  payment.id,
  payment.loan_id,
  payment.schedule_id,
  loan.borrower_id,
  payment.reference,
  2000000,
  'bank_transfer',
  payment.payment_date,
  'Synthetic demonstration repayment.',
  '10000000-0000-4000-8000-000000000002',
  payment.created_at
from public.loans as loan
cross join (
  values
    ('60000000-0000-4000-8000-000000000001'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, '50000000-0000-4000-8000-000000000001'::uuid, 'PAY-DEMO-000001', current_date - 1, now() - interval '1 day'),
    ('60000000-0000-4000-8000-000000000002'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, '50000000-0000-4000-8000-000000000002'::uuid, 'PAY-DEMO-000002', current_date, now())
) as payment(id, loan_id, schedule_id, reference, payment_date, created_at)
where loan.id = payment.loan_id
on conflict (id) do nothing;

insert into public.loan_status_history (
  id,
  entity_type,
  entity_id,
  previous_status,
  new_status,
  changed_by,
  notes,
  created_at
)
values
  ('70000000-0000-4000-8000-000000000001', 'loan_application', '30000000-0000-4000-8000-000000000001', 'draft', 'submitted', '10000000-0000-4000-8000-000000000001', 'Submitted by demonstration borrower.', now() - interval '12 days'),
  ('70000000-0000-4000-8000-000000000002', 'loan_application', '30000000-0000-4000-8000-000000000001', 'submitted', 'under_review', '10000000-0000-4000-8000-000000000002', 'Review started.', now() - interval '11 days'),
  ('70000000-0000-4000-8000-000000000003', 'loan_application', '30000000-0000-4000-8000-000000000001', 'under_review', 'approved', '10000000-0000-4000-8000-000000000002', 'Approved at 0% demonstration interest.', now() - interval '10 days'),
  ('70000000-0000-4000-8000-000000000004', 'loan', '40000000-0000-4000-8000-000000000001', 'approved', 'disbursed', '10000000-0000-4000-8000-000000000002', 'Synthetic disbursement.', now() - interval '2 days'),
  ('70000000-0000-4000-8000-000000000005', 'loan', '40000000-0000-4000-8000-000000000001', 'disbursed', 'active', '10000000-0000-4000-8000-000000000002', 'Repayment tracking activated.', now() - interval '2 days' + interval '1 minute')
on conflict (id) do nothing;

insert into public.audit_logs (
  actor_user_id,
  action,
  entity_type,
  entity_id,
  new_data,
  request_id
)
values (
  '10000000-0000-4000-8000-000000000002',
  'demo_data_seeded',
  'system',
  null,
  '{"demo":true,"project":"SD-17"}'::jsonb,
  'seed-local-demo'
);
