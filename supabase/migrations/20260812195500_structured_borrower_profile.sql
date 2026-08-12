alter table public.profiles
  add column first_name text,
  add column middle_name text,
  add column last_name text;

update public.profiles
set
  first_name = case
    when full_name is null then null
    when position(' ' in trim(full_name)) = 0 then trim(full_name)
    else split_part(trim(full_name), ' ', 1)
  end,
  last_name = case
    when full_name is null or position(' ' in trim(full_name)) = 0 then null
    else regexp_replace(trim(full_name), '^.*\s+', '')
  end
where full_name is not null;

alter table public.profiles
  drop constraint profiles_state_check,
  drop constraint profiles_employment_type_check;

alter table public.profiles
  add constraint profiles_first_name_length_check check (
    first_name is null or char_length(trim(first_name)) between 2 and 60
  ),
  add constraint profiles_middle_name_length_check check (
    middle_name is null or char_length(trim(middle_name)) between 2 and 60
  ),
  add constraint profiles_last_name_length_check check (
    last_name is null or char_length(trim(last_name)) between 2 and 60
  ),
  add constraint profiles_nigerian_state_check check (
    state is null or state = any (array[
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
      'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
      'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa',
      'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
      'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
      'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ]::text[])
  ) not valid,
  add constraint profiles_employment_type_check check (
    employment_type is null or employment_type = any (array[
      'Employed', 'Self-employed', 'Business owner', 'Student', 'Retired',
      'Not employed', 'Other'
    ]::text[])
  ) not valid;

comment on column public.profiles.first_name is
  'Borrower given name. Kept separately while full_name remains the derived display name.';
comment on column public.profiles.middle_name is
  'Optional borrower middle or additional name.';
comment on column public.profiles.last_name is
  'Borrower family name.';
