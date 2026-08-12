revoke insert, update on table public.loan_applications from authenticated;

create function public.submit_loan_application(
  p_requested_amount bigint,
  p_purpose text,
  p_repayment_duration_months smallint,
  p_preferred_start_date date default null,
  p_borrower_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  borrower_profile public.profiles;
  application_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  select * into borrower_profile
  from public.profiles
  where user_id = auth.uid();

  if borrower_profile.id is null or borrower_profile.profile_completed_at is null then
    raise exception 'Complete your borrower profile before applying' using errcode = '23514';
  end if;

  if p_requested_amount < 100000 or p_requested_amount > 500000000 then
    raise exception 'Requested amount must be between NGN 1,000 and NGN 5,000,000'
      using errcode = '23514';
  end if;

  if char_length(trim(p_purpose)) not between 10 and 1000 then
    raise exception 'Loan purpose must contain 10 to 1000 characters' using errcode = '23514';
  end if;

  if p_repayment_duration_months not between 1 and 24 then
    raise exception 'Repayment duration must be between 1 and 24 months' using errcode = '23514';
  end if;

  if p_preferred_start_date is not null and p_preferred_start_date < current_date then
    raise exception 'Preferred start date cannot be in the past' using errcode = '23514';
  end if;

  insert into public.loan_applications (
    borrower_id,
    requested_amount,
    purpose,
    repayment_duration_months,
    preferred_start_date,
    borrower_notes,
    status,
    submitted_at
  ) values (
    borrower_profile.id,
    p_requested_amount,
    trim(p_purpose),
    p_repayment_duration_months,
    p_preferred_start_date,
    nullif(trim(p_borrower_notes), ''),
    'submitted',
    statement_timestamp()
  ) returning id into application_id;

  insert into public.loan_status_history (
    entity_type, entity_id, previous_status, new_status, changed_by, notes
  ) values (
    'loan_application', application_id, null, 'submitted', auth.uid(), 'Application submitted by borrower'
  );

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, new_data
  ) values (
    auth.uid(), 'loan_application.submitted', 'loan_application', application_id,
    jsonb_build_object('requested_amount', p_requested_amount, 'status', 'submitted')
  );

  return application_id;
end;
$$;

create function public.review_loan_application(
  p_application_id uuid,
  p_new_status public.application_status,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status public.application_status;
begin
  if not private.is_admin() then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  if p_new_status not in ('under_review', 'submitted', 'approved', 'rejected') then
    raise exception 'Unsupported administrator status' using errcode = '23514';
  end if;

  if p_admin_notes is not null and char_length(p_admin_notes) > 2000 then
    raise exception 'Administrator notes cannot exceed 2000 characters' using errcode = '23514';
  end if;

  select status into current_status
  from public.loan_applications
  where id = p_application_id
  for update;

  if current_status is null then
    raise exception 'Loan application was not found' using errcode = 'P0002';
  end if;

  update public.loan_applications
  set
    status = p_new_status,
    admin_notes = nullif(trim(p_admin_notes), ''),
    reviewed_at = case
      when p_new_status in ('under_review', 'approved', 'rejected') then statement_timestamp()
      else reviewed_at
    end,
    approved_at = case when p_new_status = 'approved' then statement_timestamp() else null end,
    rejected_at = case when p_new_status = 'rejected' then statement_timestamp() else null end
  where id = p_application_id;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'loan_application.status_changed', 'loan_application', p_application_id,
    jsonb_build_object('status', current_status),
    jsonb_build_object('status', p_new_status)
  );
end;
$$;

revoke all on function public.submit_loan_application(bigint, text, smallint, date, text) from public, anon;
revoke all on function public.review_loan_application(uuid, public.application_status, text) from public, anon;
grant execute on function public.submit_loan_application(bigint, text, smallint, date, text) to authenticated;
grant execute on function public.review_loan_application(uuid, public.application_status, text) to authenticated;

comment on function public.submit_loan_application(bigint, text, smallint, date, text) is
  'Atomically submits a validated application for the authenticated completed borrower profile.';
comment on function public.review_loan_application(uuid, public.application_status, text) is
  'Performs an allow-listed application review transition for a database-verified administrator.';
