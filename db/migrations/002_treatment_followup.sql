-- Treatment roster: current plan, follow-up, and patient-reported eczane collection.
-- Hiros still does not see MEDULA fill status. filled_reported_at is what the
-- patient or doctor records in the prototype.

alter table public.prescriptions
  add column if not exists filled_reported_at timestamptz,
  add column if not exists fill_note text;

create table if not exists public.case_treatments (
  case_id uuid primary key references public.cases (id) on delete cascade,
  name text not null,
  follow_up_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists case_treatments_updated_at on public.case_treatments;
create trigger case_treatments_updated_at
  before update on public.case_treatments
  for each row execute function public.set_updated_at();

grant select, insert, update on public.case_treatments to hiros_app;
grant update on public.prescriptions to hiros_app;

alter table public.case_treatments enable row level security;
alter table public.case_treatments force row level security;

drop policy if exists case_treatments_select on public.case_treatments;
create policy case_treatments_select on public.case_treatments
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_treatments.case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

drop policy if exists case_treatments_doctor_write on public.case_treatments;
create policy case_treatments_doctor_write on public.case_treatments
  for all to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_treatments.case_id
        and (
          c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  )
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_treatments.case_id
        and (
          c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

-- Existing approved demo cases become active treatment rows.
insert into public.case_treatments (case_id, name, follow_up_at, notes)
select
  c.id,
  'Treatment plan pending',
  (timezone('Europe/Istanbul', now()))::date + 90,
  null
from public.cases c
where c.status in ('approved', 'trial_active')
on conflict (case_id) do nothing;

insert into public.prescriptions (case_id, doctor_id, e_recete_number, is_simulated)
select
  c.id,
  c.assigned_doctor_id,
  'DEMO-' || upper(substr(replace(c.id::text, '-', ''), 1, 10)),
  true
from public.cases c
where c.status in ('approved', 'trial_active')
  and c.assigned_doctor_id is not null
  and not exists (
    select 1 from public.prescriptions p where p.case_id = c.id
  );

update public.cases
set status = 'trial_active'
where status = 'approved';
