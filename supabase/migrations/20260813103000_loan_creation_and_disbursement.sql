create function public.create_loan_from_application(
  p_application_id uuid,
  p_interest_rate numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  application_record public.loan_applications;
  existing_loan_id uuid;
  new_loan_id uuid;
  calculated_interest bigint;
  calculated_total bigint;
  calculated_installment bigint;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  if p_interest_rate is null
    or p_interest_rate < 0
    or p_interest_rate > 100
    or round(p_interest_rate, 4) <> p_interest_rate
  then
    raise exception 'Interest rate must be between 0 and 100 with at most four decimal places'
      using errcode = '23514';
  end if;

  select * into application_record
  from public.loan_applications
  where id = p_application_id
  for update;

  if application_record.id is null then
    raise exception 'Loan application was not found' using errcode = 'P0002';
  end if;

  if application_record.status <> 'approved' then
    raise exception 'Only approved applications can become loans' using errcode = '23514';
  end if;

  select id into existing_loan_id
  from public.loans
  where loan_application_id = p_application_id;

  if existing_loan_id is not null then
    return existing_loan_id;
  end if;

  calculated_interest := round(
    application_record.requested_amount::numeric * p_interest_rate / 100
  )::bigint;
  calculated_total := application_record.requested_amount + calculated_interest;
  calculated_installment := ceil(
    calculated_total::numeric / application_record.repayment_duration_months
  )::bigint;

  insert into public.loans (
    loan_application_id,
    borrower_id,
    principal_amount,
    interest_rate,
    interest_amount,
    total_repayable,
    repayment_duration_months,
    repayment_frequency,
    installment_amount,
    amount_repaid,
    outstanding_balance,
    status
  ) values (
    application_record.id,
    application_record.borrower_id,
    application_record.requested_amount,
    p_interest_rate,
    calculated_interest,
    calculated_total,
    application_record.repayment_duration_months,
    'monthly',
    calculated_installment,
    0,
    calculated_total,
    'approved'
  ) returning id into new_loan_id;

  insert into public.loan_status_history (
    entity_type, entity_id, previous_status, new_status, changed_by, notes
  ) values (
    'loan', new_loan_id, null, 'approved', auth.uid(),
    format('Loan created from approved application at %s%% interest', p_interest_rate)
  );

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, new_data
  ) values (
    auth.uid(), 'loan.created', 'loan', new_loan_id,
    jsonb_build_object(
      'application_id', application_record.id,
      'principal_amount', application_record.requested_amount,
      'interest_rate', p_interest_rate,
      'interest_amount', calculated_interest,
      'total_repayable', calculated_total,
      'status', 'approved'
    )
  );

  return new_loan_id;
end;
$$;

create function public.disburse_loan(
  p_loan_id uuid,
  p_first_repayment_date date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  loan_record public.loans;
  schedule_count integer;
  installment_due bigint;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  if p_first_repayment_date is null or p_first_repayment_date < current_date then
    raise exception 'First repayment date cannot be in the past' using errcode = '23514';
  end if;

  select * into loan_record
  from public.loans
  where id = p_loan_id
  for update;

  if loan_record.id is null then
    raise exception 'Loan was not found' using errcode = 'P0002';
  end if;

  if loan_record.status = 'disbursed' then
    select count(*) into schedule_count
    from public.repayment_schedules
    where loan_id = p_loan_id;

    if schedule_count = loan_record.repayment_duration_months then
      return;
    end if;

    raise exception 'Disbursed loan has an incomplete repayment schedule'
      using errcode = '23514';
  end if;

  if loan_record.status <> 'approved' then
    raise exception 'Only approved loans can be disbursed' using errcode = '23514';
  end if;

  update public.loans
  set
    start_date = current_date,
    maturity_date = (
      p_first_repayment_date
      + make_interval(months => loan_record.repayment_duration_months - 1)
    )::date,
    disbursed_at = statement_timestamp(),
    status = 'disbursed'
  where id = p_loan_id;

  for schedule_number in 1..loan_record.repayment_duration_months loop
    installment_due := case
      when schedule_number = loan_record.repayment_duration_months then
        loan_record.total_repayable
        - loan_record.installment_amount * (loan_record.repayment_duration_months - 1)
      else loan_record.installment_amount
    end;

    insert into public.repayment_schedules (
      loan_id,
      installment_number,
      due_date,
      amount_due,
      amount_paid,
      outstanding_amount,
      status
    ) values (
      p_loan_id,
      schedule_number,
      (
        p_first_repayment_date
        + make_interval(months => schedule_number - 1)
      )::date,
      installment_due,
      0,
      installment_due,
      'pending'
    );
  end loop;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'loan.disbursed', 'loan', p_loan_id,
    jsonb_build_object('status', loan_record.status),
    jsonb_build_object(
      'status', 'disbursed',
      'first_repayment_date', p_first_repayment_date,
      'installment_count', loan_record.repayment_duration_months
    )
  );
end;
$$;

revoke all on function public.create_loan_from_application(uuid, numeric) from public, anon;
revoke all on function public.disburse_loan(uuid, date) from public, anon;
grant execute on function public.create_loan_from_application(uuid, numeric) to authenticated;
grant execute on function public.disburse_loan(uuid, date) to authenticated;

comment on function public.create_loan_from_application(uuid, numeric) is
  'Idempotently creates an approved loan from an approved application for a database-verified administrator.';
comment on function public.disburse_loan(uuid, date) is
  'Atomically marks an approved loan disbursed and generates its complete monthly repayment schedule.';
