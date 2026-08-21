create sequence public.payment_reference_seq start 1001;

alter table public.repayments
  add constraint repayment_reference_length_check
  check (char_length(trim(payment_reference)) between 3 and 120);

create function public.record_repayment(
  p_loan_id uuid,
  p_amount bigint,
  p_payment_method public.payment_method,
  p_payment_date date default current_date,
  p_payment_reference text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  loan_record public.loans;
  schedule_record public.repayment_schedules;
  remaining_amount bigint;
  allocated_amount bigint;
  first_schedule_id uuid;
  repayment_id uuid;
  resolved_reference text;
  new_outstanding bigint;
  target_status public.loan_status;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Repayment amount must be greater than zero' using errcode = '23514';
  end if;

  if p_payment_date is null or p_payment_date > current_date then
    raise exception 'Payment date cannot be in the future' using errcode = '23514';
  end if;

  if p_notes is not null and char_length(p_notes) > 1000 then
    raise exception 'Repayment notes cannot exceed 1000 characters' using errcode = '23514';
  end if;

  select * into loan_record
  from public.loans
  where id = p_loan_id
  for update;

  if loan_record.id is null then
    raise exception 'Loan was not found' using errcode = 'P0002';
  end if;

  if loan_record.status not in ('disbursed', 'active', 'overdue', 'defaulted') then
    raise exception 'Repayments can only be recorded for a repayable loan' using errcode = '23514';
  end if;

  if p_payment_date < loan_record.disbursed_at::date then
    raise exception 'Payment date cannot precede disbursement' using errcode = '23514';
  end if;

  if p_amount > loan_record.outstanding_balance then
    raise exception 'Repayment cannot exceed the outstanding balance' using errcode = '23514';
  end if;

  resolved_reference := coalesce(
    nullif(trim(p_payment_reference), ''),
    'PAY-' || to_char(current_date, 'YYYYMMDD') || '-' ||
      lpad(nextval('public.payment_reference_seq')::text, 6, '0')
  );

  if char_length(resolved_reference) not between 3 and 120 then
    raise exception 'Payment reference must contain 3 to 120 characters' using errcode = '23514';
  end if;

  remaining_amount := p_amount;

  for schedule_record in
    select *
    from public.repayment_schedules
    where loan_id = p_loan_id and outstanding_amount > 0
    order by due_date, installment_number
    for update
  loop
    exit when remaining_amount = 0;
    first_schedule_id := coalesce(first_schedule_id, schedule_record.id);
    allocated_amount := least(remaining_amount, schedule_record.outstanding_amount);

    update public.repayment_schedules
    set
      amount_paid = amount_paid + allocated_amount,
      outstanding_amount = outstanding_amount - allocated_amount,
      status = case
        when outstanding_amount - allocated_amount = 0 then 'paid'::public.repayment_status
        else 'partially_paid'::public.repayment_status
      end,
      paid_at = case
        when outstanding_amount - allocated_amount = 0 then statement_timestamp()
        else null
      end
    where id = schedule_record.id;

    remaining_amount := remaining_amount - allocated_amount;
  end loop;

  if remaining_amount <> 0 or first_schedule_id is null then
    raise exception 'Repayment schedule cannot absorb the payment amount' using errcode = '23514';
  end if;

  new_outstanding := loan_record.outstanding_balance - p_amount;

  if loan_record.status = 'disbursed' then
    update public.loans set status = 'active' where id = p_loan_id;
    loan_record.status := 'active';
  end if;

  target_status := case
    when new_outstanding = 0 then 'fully_repaid'::public.loan_status
    when loan_record.status = 'defaulted' then 'defaulted'::public.loan_status
    when exists (
      select 1 from public.repayment_schedules
      where loan_id = p_loan_id
        and due_date < current_date
        and outstanding_amount > 0
    ) then 'overdue'::public.loan_status
    else 'active'::public.loan_status
  end;

  update public.loans
  set
    amount_repaid = amount_repaid + p_amount,
    outstanding_balance = new_outstanding,
    status = target_status
  where id = p_loan_id;

  insert into public.repayments (
    loan_id,
    repayment_schedule_id,
    borrower_id,
    payment_reference,
    amount,
    payment_method,
    payment_date,
    notes,
    recorded_by
  ) values (
    p_loan_id,
    first_schedule_id,
    loan_record.borrower_id,
    resolved_reference,
    p_amount,
    p_payment_method,
    p_payment_date,
    nullif(trim(p_notes), ''),
    auth.uid()
  ) returning id into repayment_id;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'repayment.recorded', 'repayment', repayment_id,
    jsonb_build_object(
      'loan_amount_repaid', loan_record.amount_repaid,
      'loan_outstanding_balance', loan_record.outstanding_balance
    ),
    jsonb_build_object(
      'loan_id', p_loan_id,
      'payment_reference', resolved_reference,
      'amount', p_amount,
      'loan_amount_repaid', loan_record.amount_repaid + p_amount,
      'loan_outstanding_balance', new_outstanding
    )
  );

  return repayment_id;
end;
$$;

revoke all on function public.record_repayment(uuid, bigint, public.payment_method, date, text, text) from public, anon;
grant execute on function public.record_repayment(uuid, bigint, public.payment_method, date, text, text) to authenticated;

comment on function public.record_repayment(uuid, bigint, public.payment_method, date, text, text) is
  'Atomically records one immutable repayment transaction, allocates oldest installments, and recalculates loan balances and status.';
