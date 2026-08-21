create function public.complete_loan(
  p_loan_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  loan_record public.loans;
  schedule_count integer;
  unpaid_count integer;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  if p_notes is not null and char_length(p_notes) > 1000 then
    raise exception 'Completion notes cannot exceed 1000 characters' using errcode = '23514';
  end if;

  select * into loan_record
  from public.loans
  where id = p_loan_id
  for update;

  if loan_record.id is null then
    raise exception 'Loan was not found' using errcode = 'P0002';
  end if;

  if loan_record.status = 'completed' then
    return;
  end if;

  if loan_record.status <> 'fully_repaid' or loan_record.outstanding_balance <> 0 then
    raise exception 'Only a fully repaid loan can be completed' using errcode = '23514';
  end if;

  select count(*), count(*) filter (where outstanding_amount <> 0 or status <> 'paid')
  into schedule_count, unpaid_count
  from public.repayment_schedules
  where loan_id = p_loan_id;

  if schedule_count <> loan_record.repayment_duration_months or unpaid_count <> 0 then
    raise exception 'Every repayment installment must be paid before completion' using errcode = '23514';
  end if;

  update public.loans
  set status = 'completed'
  where id = p_loan_id;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'loan.completed', 'loan', p_loan_id,
    jsonb_build_object('status', loan_record.status),
    jsonb_build_object('status', 'completed', 'notes', nullif(trim(p_notes), ''))
  );
end;
$$;

revoke all on function public.complete_loan(uuid, text) from public, anon;
grant execute on function public.complete_loan(uuid, text) to authenticated;

comment on function public.complete_loan(uuid, text) is
  'Allows a database-verified administrator to close a fully repaid loan after verifying every installment is paid.';
