-- LoanTrack NG — SD-17 initial PostgreSQL schema and RLS foundation.
-- Money is stored as BIGINT minor units (kobo); ₦120,000 = 12,000,000.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.app_role as enum ('borrower', 'admin');
create type public.application_status as enum (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'cancelled'
);
create type public.loan_status as enum (
  'approved',
  'disbursed',
  'active',
  'overdue',
  'fully_repaid',
  'completed',
  'defaulted',
  'cancelled'
);
create type public.repayment_status as enum (
  'pending',
  'partially_paid',
  'paid',
  'overdue'
);
create type public.repayment_frequency as enum ('monthly');
create type public.payment_method as enum ('cash', 'bank_transfer', 'other');
create type public.history_entity_type as enum ('loan_application', 'loan');

create sequence public.application_number_seq start with 1001;
create sequence public.loan_number_seq start with 1001;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text check (
    full_name is null or char_length(trim(full_name)) between 2 and 120
  ),
  phone text check (phone is null or char_length(trim(phone)) between 7 and 20),
  email text check (email is null or char_length(trim(email)) between 3 and 254),
  address text check (address is null or char_length(address) <= 500),
  state text check (state is null or char_length(trim(state)) between 2 and 80),
  occupation text check (
    occupation is null or char_length(trim(occupation)) between 2 and 120
  ),
  employment_type text check (
    employment_type is null or char_length(trim(employment_type)) between 2 and 80
  ),
  business_type text check (
    business_type is null or char_length(trim(business_type)) between 2 and 120
  ),
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'borrower',
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  borrower_id uuid not null references public.profiles (id) on delete restrict,
  application_number text not null unique default (
    'APP-' || to_char(current_date, 'YYYYMMDD') || '-' ||
    lpad(nextval('public.application_number_seq')::text, 6, '0')
  ),
  requested_amount bigint not null check (requested_amount > 0),
  purpose text not null check (char_length(trim(purpose)) between 10 and 1000),
  repayment_duration_months smallint not null check (
    repayment_duration_months between 1 and 60
  ),
  preferred_start_date date,
  status public.application_status not null default 'draft',
  borrower_notes text check (borrower_notes is null or char_length(borrower_notes) <= 2000),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 2000),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_borrower_unique unique (id, borrower_id),
  constraint application_status_timestamps_check check (
    (
      status not in ('submitted', 'under_review', 'approved', 'rejected')
      or submitted_at is not null
    )
    and (
      status not in ('under_review', 'approved', 'rejected')
      or reviewed_at is not null
    )
    and (status <> 'approved' or approved_at is not null)
    and (status <> 'rejected' or rejected_at is not null)
    and (approved_at is null or rejected_at is null)
  )
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  loan_application_id uuid not null unique references public.loan_applications (id) on delete restrict,
  borrower_id uuid not null references public.profiles (id) on delete restrict,
  loan_number text not null unique default (
    'LOAN-' || to_char(current_date, 'YYYYMMDD') || '-' ||
    lpad(nextval('public.loan_number_seq')::text, 6, '0')
  ),
  principal_amount bigint not null check (principal_amount > 0),
  interest_rate numeric(7, 4) not null default 0 check (
    interest_rate between 0 and 100
  ),
  interest_amount bigint not null default 0 check (interest_amount >= 0),
  total_repayable bigint not null check (total_repayable > 0),
  repayment_duration_months smallint not null check (
    repayment_duration_months between 1 and 60
  ),
  repayment_frequency public.repayment_frequency not null default 'monthly',
  installment_amount bigint not null check (installment_amount > 0),
  amount_repaid bigint not null default 0 check (amount_repaid >= 0),
  outstanding_balance bigint not null check (outstanding_balance >= 0),
  start_date date,
  maturity_date date,
  disbursed_at timestamptz,
  status public.loan_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loan_amounts_check check (
    total_repayable = principal_amount + interest_amount
    and amount_repaid <= total_repayable
    and outstanding_balance = total_repayable - amount_repaid
  ),
  constraint loan_dates_check check (
    maturity_date is null or start_date is null or maturity_date >= start_date
  ),
  constraint loan_status_financials_check check (
    status not in ('fully_repaid', 'completed') or outstanding_balance = 0
  ),
  constraint loan_disbursement_timestamp_check check (
    status in ('approved', 'cancelled') or disbursed_at is not null
  ),
  constraint loan_borrower_unique unique (id, borrower_id),
  constraint loan_application_borrower_fk foreign key (loan_application_id, borrower_id)
    references public.loan_applications (id, borrower_id) on delete restrict
);

create table public.repayment_schedules (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans (id) on delete restrict,
  installment_number smallint not null check (installment_number > 0),
  due_date date not null,
  amount_due bigint not null check (amount_due > 0),
  amount_paid bigint not null default 0 check (amount_paid >= 0),
  outstanding_amount bigint not null check (outstanding_amount >= 0),
  status public.repayment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repayment_schedule_installment_unique unique (loan_id, installment_number),
  constraint repayment_schedule_identity_unique unique (id, loan_id),
  constraint repayment_schedule_amounts_check check (
    amount_paid <= amount_due
    and outstanding_amount = amount_due - amount_paid
  ),
  constraint repayment_schedule_status_check check (
    (status = 'pending' and amount_paid = 0 and outstanding_amount = amount_due and paid_at is null)
    or (status = 'partially_paid' and amount_paid > 0 and outstanding_amount > 0 and paid_at is null)
    or (status = 'paid' and amount_paid = amount_due and outstanding_amount = 0 and paid_at is not null)
    or (status = 'overdue' and outstanding_amount > 0 and paid_at is null)
  )
);

create table public.repayments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null,
  repayment_schedule_id uuid,
  borrower_id uuid not null,
  payment_reference text not null unique,
  amount bigint not null check (amount > 0),
  payment_method public.payment_method not null,
  payment_date date not null default current_date,
  notes text check (notes is null or char_length(notes) <= 1000),
  recorded_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint repayment_loan_borrower_fk foreign key (loan_id, borrower_id)
    references public.loans (id, borrower_id) on delete restrict,
  constraint repayment_schedule_loan_fk foreign key (repayment_schedule_id, loan_id)
    references public.repayment_schedules (id, loan_id) on delete restrict
);

create table public.loan_status_history (
  id uuid primary key default gen_random_uuid(),
  entity_type public.history_entity_type not null,
  entity_id uuid not null,
  previous_status text,
  new_status text not null,
  changed_by uuid references auth.users (id) on delete set null,
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 160),
  message text not null check (char_length(trim(message)) between 2 and 2000),
  notification_type text not null default 'system' check (
    char_length(trim(notification_type)) between 2 and 60
  ),
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(trim(action)) between 2 and 120),
  entity_type text not null check (char_length(trim(entity_type)) between 2 and 80),
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index profiles_user_id_idx on public.profiles (user_id);
create index user_roles_role_idx on public.user_roles (role);
create index loan_applications_borrower_idx on public.loan_applications (borrower_id);
create index loan_applications_status_submitted_idx on public.loan_applications (status, submitted_at desc);
create index loan_applications_amount_idx on public.loan_applications (requested_amount);
create index loans_borrower_idx on public.loans (borrower_id);
create index loans_status_maturity_idx on public.loans (status, maturity_date);
create index repayment_schedules_loan_due_idx on public.repayment_schedules (loan_id, due_date);
create index repayment_schedules_status_due_idx on public.repayment_schedules (status, due_date);
create index repayments_loan_date_idx on public.repayments (loan_id, payment_date desc);
create index repayments_borrower_date_idx on public.repayments (borrower_id, payment_date desc);
create index status_history_entity_idx on public.loan_status_history (entity_type, entity_id, created_at);
create index notifications_recipient_idx on public.notifications (recipient_user_id, read_at, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at desc);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger user_roles_set_updated_at
before update on public.user_roles
for each row execute function private.set_updated_at();

create trigger loan_applications_set_updated_at
before update on public.loan_applications
for each row execute function private.set_updated_at();

create trigger loans_set_updated_at
before update on public.loans
for each row execute function private.set_updated_at();

create trigger repayment_schedules_set_updated_at
before update on public.repayment_schedules
for each row execute function private.set_updated_at();

create function private.application_transition_allowed(
  previous_status public.application_status,
  next_status public.application_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case previous_status
    when 'draft' then next_status in ('submitted', 'cancelled')
    when 'submitted' then next_status in ('under_review', 'cancelled')
    when 'under_review' then next_status in ('submitted', 'approved', 'rejected')
    else false
  end;
$$;

create function private.loan_transition_allowed(
  previous_status public.loan_status,
  next_status public.loan_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case previous_status
    when 'approved' then next_status in ('disbursed', 'cancelled')
    when 'disbursed' then next_status in ('active', 'cancelled')
    when 'active' then next_status in ('overdue', 'fully_repaid', 'defaulted', 'cancelled')
    when 'overdue' then next_status in ('active', 'fully_repaid', 'defaulted')
    when 'fully_repaid' then next_status = 'completed'
    when 'defaulted' then next_status in ('active', 'fully_repaid')
    else false
  end;
$$;

create function private.validate_application_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status is distinct from new.status
    and not private.application_transition_allowed(old.status, new.status)
  then
    raise exception 'Invalid application status transition: % -> %', old.status, new.status
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create function private.validate_loan_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status is distinct from new.status
    and not private.loan_transition_allowed(old.status, new.status)
  then
    raise exception 'Invalid loan status transition: % -> %', old.status, new.status
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger loan_applications_validate_transition
before update of status on public.loan_applications
for each row execute function private.validate_application_transition();

create trigger loans_validate_transition
before update of status on public.loans
for each row execute function private.validate_loan_transition();

create function private.record_application_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    insert into public.loan_status_history (
      entity_type,
      entity_id,
      previous_status,
      new_status,
      changed_by,
      notes
    ) values (
      'loan_application',
      new.id,
      old.status::text,
      new.status::text,
      auth.uid(),
      new.admin_notes
    );
  end if;
  return new;
end;
$$;

create function private.record_loan_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    insert into public.loan_status_history (
      entity_type,
      entity_id,
      previous_status,
      new_status,
      changed_by
    ) values (
      'loan',
      new.id,
      old.status::text,
      new.status::text,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger loan_applications_record_status_history
after update of status on public.loan_applications
for each row execute function private.record_application_status_history();

create trigger loans_record_status_history
after update of status on public.loans
for each row execute function private.record_loan_status_history();

create function private.prevent_immutable_row_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% records are append-only', tg_table_name using errcode = '55000';
end;
$$;

create trigger repayments_are_immutable
before update or delete on public.repayments
for each row execute function private.prevent_immutable_row_change();

create trigger status_history_is_immutable
before update or delete on public.loan_status_history
for each row execute function private.prevent_immutable_row_change();

create trigger audit_logs_are_immutable
before update or delete on public.audit_logs
for each row execute function private.prevent_immutable_row_change();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    new.email
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'borrower')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.profiles as p
  where p.user_id = (select auth.uid());
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'admin'
  );
$$;

create function private.owns_loan(target_loan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.loans as l
    where l.id = target_loan_id
      and l.borrower_id = private.current_profile_id()
  );
$$;

create function private.can_access_history(
  target_entity_type public.history_entity_type,
  target_entity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case target_entity_type
    when 'loan_application' then exists (
      select 1
      from public.loan_applications as la
      where la.id = target_entity_id
        and la.borrower_id = private.current_profile_id()
    )
    when 'loan' then exists (
      select 1
      from public.loans as l
      where l.id = target_entity_id
        and l.borrower_id = private.current_profile_id()
    )
    else false
  end;
$$;

create view public.repayment_schedule_effective
with (security_invoker = true)
as
select
  rs.id,
  rs.loan_id,
  rs.installment_number,
  rs.due_date,
  rs.amount_due,
  rs.amount_paid,
  rs.outstanding_amount,
  case
    when rs.due_date < current_date and rs.outstanding_amount > 0 then 'overdue'::public.repayment_status
    else rs.status
  end as effective_status,
  rs.paid_at,
  rs.created_at,
  rs.updated_at
from public.repayment_schedules as rs;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.loan_applications enable row level security;
alter table public.loans enable row level security;
alter table public.repayment_schedules enable row level security;
alter table public.repayments enable row level security;
alter table public.loan_status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_own_or_admin
on public.profiles for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy profiles_update_own
on public.profiles for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy profiles_update_admin
on public.profiles for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy user_roles_select_own_or_admin
on public.user_roles for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy applications_select_own_or_admin
on public.loan_applications for select
to authenticated
using (
  borrower_id = (select private.current_profile_id())
  or (select private.is_admin())
);

create policy applications_insert_own_draft
on public.loan_applications for insert
to authenticated
with check (
  borrower_id = (select private.current_profile_id())
  and status = 'draft'
);

create policy applications_update_own_draft
on public.loan_applications for update
to authenticated
using (
  borrower_id = (select private.current_profile_id())
  and status = 'draft'
)
with check (
  borrower_id = (select private.current_profile_id())
  and status in ('draft', 'submitted', 'cancelled')
);

create policy loans_select_own_or_admin
on public.loans for select
to authenticated
using (
  borrower_id = (select private.current_profile_id())
  or (select private.is_admin())
);

create policy schedules_select_own_or_admin
on public.repayment_schedules for select
to authenticated
using (
  (select private.owns_loan(loan_id))
  or (select private.is_admin())
);

create policy repayments_select_own_or_admin
on public.repayments for select
to authenticated
using (
  borrower_id = (select private.current_profile_id())
  or (select private.is_admin())
);

create policy status_history_select_own_or_admin
on public.loan_status_history for select
to authenticated
using (
  (select private.can_access_history(entity_type, entity_id))
  or (select private.is_admin())
);

create policy notifications_select_own_or_admin
on public.notifications for select
to authenticated
using (
  recipient_user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy notifications_update_own_or_admin
on public.notifications for update
to authenticated
using (
  recipient_user_id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  recipient_user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy audit_logs_select_admin
on public.audit_logs for select
to authenticated
using ((select private.is_admin()));

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant usage on schema private to authenticated;
grant usage on type public.app_role to authenticated;
grant usage on type public.application_status to authenticated;
grant usage on type public.loan_status to authenticated;
grant usage on type public.repayment_status to authenticated;
grant usage on type public.repayment_frequency to authenticated;
grant usage on type public.payment_method to authenticated;
grant usage on type public.history_entity_type to authenticated;

grant select on table public.profiles to authenticated;
grant update (
  full_name,
  phone,
  email,
  address,
  state,
  occupation,
  employment_type,
  business_type,
  profile_completed_at
) on table public.profiles to authenticated;

grant select on table public.user_roles to authenticated;
grant select on table public.loan_applications to authenticated;
grant insert (
  borrower_id,
  requested_amount,
  purpose,
  repayment_duration_months,
  preferred_start_date,
  borrower_notes
) on table public.loan_applications to authenticated;
grant update (
  requested_amount,
  purpose,
  repayment_duration_months,
  preferred_start_date,
  status,
  borrower_notes,
  submitted_at
) on table public.loan_applications to authenticated;
grant usage, select on sequence public.application_number_seq to authenticated;
grant select on table public.loans to authenticated;
grant select on table public.repayment_schedules to authenticated;
grant select on table public.repayment_schedule_effective to authenticated;
grant select on table public.repayments to authenticated;
grant select on table public.loan_status_history to authenticated;
grant select on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;
grant select on table public.audit_logs to authenticated;

grant execute on function private.current_profile_id() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.owns_loan(uuid) to authenticated;
grant execute on function private.can_access_history(public.history_entity_type, uuid) to authenticated;

comment on table public.repayments is
  'Append-only repayment transactions. Balances must never be changed without a transaction.';
comment on column public.loan_applications.requested_amount is
  'Requested principal in integer kobo.';
comment on column public.loans.principal_amount is
  'Principal in integer kobo.';
comment on column public.loans.total_repayable is
  'Total repayable in integer kobo.';
comment on column public.loans.outstanding_balance is
  'Outstanding balance in integer kobo.';
