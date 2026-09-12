-- Scheduled video visits between a named physician and an assigned patient.
-- Prototype rooms only — not a ministry telemedicine recording.

do $$ begin
  create type public.appointment_status as enum (
    'requested',
    'scheduled',
    'cancelled',
    'completed'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.appointment_actor as enum ('patient', 'doctor');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.video_appointments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete restrict,
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  starts_at timestamptz not null,
  duration_minutes integer not null default 20
    check (duration_minutes between 10 and 60),
  status public.appointment_status not null default 'requested',
  requested_by public.appointment_actor not null,
  reason text,
  notes text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists video_appointments_updated_at on public.video_appointments;
create trigger video_appointments_updated_at
  before update on public.video_appointments
  for each row execute function public.set_updated_at();

create index if not exists video_appointments_doctor_starts_idx
  on public.video_appointments (doctor_id, starts_at);
create index if not exists video_appointments_case_starts_idx
  on public.video_appointments (case_id, starts_at);

grant usage on type public.appointment_status, public.appointment_actor to hiros_app;
grant select, insert, update on public.video_appointments to hiros_app;

alter table public.video_appointments enable row level security;
alter table public.video_appointments force row level security;

drop policy if exists video_appointments_select on public.video_appointments;
create policy video_appointments_select on public.video_appointments
  for select to hiros_app
  using (
    patient_id = public.current_user_id()
    or doctor_id = public.my_doctor_id()
    or exists (
      select 1 from public.cases c
      where c.id = video_appointments.case_id
        and c.is_trial
        and public.is_trial_operator()
    )
  );

drop policy if exists video_appointments_write on public.video_appointments;
create policy video_appointments_write on public.video_appointments
  for all to hiros_app
  using (
    patient_id = public.current_user_id()
    or doctor_id = public.my_doctor_id()
    or exists (
      select 1 from public.cases c
      where c.id = video_appointments.case_id
        and c.is_trial
        and public.is_trial_operator()
    )
  )
  with check (
    patient_id = public.current_user_id()
    or doctor_id = public.my_doctor_id()
    or exists (
      select 1 from public.cases c
      where c.id = video_appointments.case_id
        and c.is_trial
        and public.is_trial_operator()
    )
  );
