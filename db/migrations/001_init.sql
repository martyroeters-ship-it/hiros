-- Hiros prototype schema
--
-- Trial (~100 patients): run the real product steps with a demo doctor.
-- Recete and KTS/e-Nabız cannot go live; those steps are simulated and
-- labelled as such. Do not skip named doctor, consent, clinical intake,
-- review, recete screen, or eczane next-step — that is the feedback.
--
-- Still baked in:
--   * KVKK + trial consent before enroll
--   * named-physician consent before medical questions/photos
--   * simulated recete numbers always prefix DEMO- (not valid at eczane)
--   * integration_outbox never leaves the database
--   * admin may read trial rows; support cannot
--   * access_logs + record_change_logs
--   * no plaintext TCKN; no photo bytes; no in-app drug checkout
--   * real-user Postgres + object storage in Turkey
--
-- Seed one is_demo clinic + doctor before enroll_trial_patient() will work.
--
-- Auth: SET LOCAL app.user_id = '<profiles.id>' per request. Role hiros_app.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Session identity
-- ---------------------------------------------------------------------------

create or replace function public.current_user_id()
returns uuid
language plpgsql
stable
as $$
declare
  v text;
begin
  v := current_setting('app.user_id', true);
  if v is null or v = '' then
    return null;
  end if;
  return v::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('patient', 'doctor', 'support', 'admin');

create type public.case_status as enum (
  'trial_onboarding',
  'trial_active',
  'awaiting_consent',
  'clinical_intake',
  'pending_review',
  'approved',
  'declined',
  'needs_in_person',
  'cancelled'
);

create type public.feedback_kind as enum (
  'usability',
  'adherence',
  'outcome',
  'side_effect',
  'nps',
  'other'
);

create type public.answer_phase as enum ('pre_medical', 'clinical');

create type public.consent_kind as enum (
  'kvkk',
  'telemedicine',
  'named_physician',
  'prototype_trial'
);

create type public.service_area_kind as enum ('postal_prefix', 'il', 'ilce');

create type public.charge_kind as enum ('consult', 'saas_fee');

create type public.charge_status as enum (
  'method_saved',
  'pending_approval',
  'capturing',
  'captured',
  'failed',
  'refunded'
);

create type public.message_sender as enum ('patient', 'doctor');

create type public.photo_kind as enum ('front', 'top', 'left', 'right', 'other');

create type public.risk_level as enum ('Green', 'Orange', 'Red');

create type public.confidence_level as enum ('High', 'Medium', 'Low');

create type public.priority_level as enum ('High', 'Medium', 'Low');

create type public.flag_level as enum ('orange', 'red');

create type public.access_action as enum (
  'view',
  'insert',
  'update',
  'delete',
  'export',
  'login'
);

create type public.outbox_status as enum (
  'disabled_trial',
  'pending',
  'sent',
  'failed'
);

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null default 'patient',
  email text unique,
  first_name text,
  last_name text,
  phone text,
  locale text not null default 'tr',
  postal_code text check (postal_code is null or postal_code ~ '^[0-9]{5}$'),
  il text,
  ilce text,
  street_address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  license_number text,
  skrs_code text,
  city text,
  address text,
  iyzico_sub_merchant_key text,
  remote_care_permitted boolean not null default false,
  is_demo boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clinics_updated_at
  before update on public.clinics
  for each row execute function public.set_updated_at();

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete restrict,
  clinic_id uuid not null references public.clinics (id) on delete restrict,
  full_name text not null,
  license_number text not null,
  ckys_id text,
  specialty text,
  is_accepting_cases boolean not null default true,
  is_demo boolean not null default false,
  invited_by uuid references public.profiles (id),
  invited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger doctors_updated_at
  before update on public.doctors
  for each row execute function public.set_updated_at();

create table public.doctor_service_areas (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  kind public.service_area_kind not null default 'postal_prefix',
  code text not null,
  created_at timestamptz not null default now(),
  unique (doctor_id, kind, code)
);

create index doctor_service_areas_code_idx
  on public.doctor_service_areas (kind, code);

-- HMAC-SHA256 of TCKN with an app secret. Never store the 11 digits.
create table public.patient_identities (
  patient_id uuid primary key references public.profiles (id) on delete cascade,
  tckn_hash text not null unique,
  full_legal_name text,
  date_of_birth date,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger patient_identities_updated_at
  before update on public.patient_identities
  for each row execute function public.set_updated_at();

create table public.intake_drafts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null unique references public.profiles (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  follow_up_text jsonb not null default '{}'::jsonb,
  treatment_selections jsonb not null default '{}'::jsonb,
  treatment_other_detail text,
  side_effects_level text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger intake_drafts_updated_at
  before update on public.intake_drafts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Cases: one enrollment. Trial assigns a demo doctor and walks the full flow.
-- ---------------------------------------------------------------------------

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete restrict,
  assigned_doctor_id uuid references public.doctors (id) on delete restrict,
  assigned_clinic_id uuid references public.clinics (id) on delete restrict,
  status public.case_status not null default 'trial_onboarding',
  is_trial boolean not null default true,
  postal_code text check (postal_code is null or postal_code ~ '^[0-9]{5}$'),
  il text,
  ilce text,
  risk public.risk_level,
  aga_score integer check (aga_score is null or (aga_score >= 0 and aga_score <= 20)),
  confidence public.confidence_level,
  priority public.priority_level,
  findings jsonb not null default '[]'::jsonb,
  triage_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.doctors (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger cases_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

create index cases_patient_idx on public.cases (patient_id, created_at desc);
create index cases_doctor_status_idx on public.cases (assigned_doctor_id, status);

create unique index cases_one_open_per_patient
  on public.cases (patient_id)
  where status in (
    'trial_onboarding',
    'trial_active',
    'awaiting_consent',
    'clinical_intake',
    'pending_review'
  );

create table public.case_answers (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  step_id text not null,
  phase public.answer_phase not null,
  question text not null,
  answer text not null,
  follow_up_text text,
  flag public.flag_level,
  flag_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, step_id)
);

create trigger case_answers_updated_at
  before update on public.case_answers
  for each row execute function public.set_updated_at();

create table public.case_previous_treatments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  category text not null,
  detail text
);

create table public.case_photos (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  kind public.photo_kind not null default 'other',
  storage_path text not null,
  content_type text,
  byte_size integer,
  created_at timestamptz not null default now()
);

create table public.consent_versions (
  id uuid primary key default gen_random_uuid(),
  kind public.consent_kind not null,
  version text not null,
  locale text not null default 'tr',
  body_hash text not null,
  created_at timestamptz not null default now(),
  unique (kind, version, locale)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  case_id uuid references public.cases (id) on delete cascade,
  kind public.consent_kind not null,
  doctor_id uuid references public.doctors (id),
  version text not null,
  accepted_at timestamptz not null default now(),
  ip inet,
  user_agent text,
  check (
    kind <> 'named_physician'
    or (doctor_id is not null and case_id is not null)
  )
);

create index consents_patient_idx on public.consents (patient_id, kind);

-- ---------------------------------------------------------------------------
-- Payments (consult + SaaS). No PAN/CVV. Charge on physician approval.
-- ---------------------------------------------------------------------------

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null default 'iyzico',
  provider_card_user_key text not null,
  provider_card_token text,
  brand text,
  last4 text,
  exp_month smallint,
  exp_year smallint,
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.charges (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete restrict,
  patient_id uuid not null references public.profiles (id) on delete restrict,
  kind public.charge_kind not null,
  clinic_id uuid references public.clinics (id),
  amount_kurus integer not null check (amount_kurus > 0),
  currency text not null default 'TRY',
  status public.charge_status not null default 'pending_approval',
  provider text not null default 'iyzico',
  provider_payment_id text,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'consult' and clinic_id is not null)
    or kind = 'saas_fee'
  )
);

create trigger charges_updated_at
  before update on public.charges
  for each row execute function public.set_updated_at();

create unique index charges_one_kind_per_case
  on public.charges (case_id, kind);

-- e-reçete number only. No PDF, no pharmacy payment.
create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete restrict,
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  e_recete_number text not null unique,
  is_simulated boolean not null default true,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (not is_simulated or e_recete_number like 'DEMO-%')
);

create unique index prescriptions_one_per_case on public.prescriptions (case_id);

create table public.pharmacies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gln text,
  postal_code text check (postal_code is null or postal_code ~ '^[0-9]{5}$'),
  il text,
  ilce text,
  address text,
  lat double precision,
  lng double precision,
  compounds_magistral boolean not null default false,
  magistral_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pharmacies_updated_at
  before update on public.pharmacies
  for each row execute function public.set_updated_at();

create table public.case_pharmacy_preferences (
  case_id uuid primary key references public.cases (id) on delete cascade,
  pharmacy_id uuid references public.pharmacies (id) on delete set null,
  noted_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  sender_role public.message_sender not null,
  sender_profile_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (char_length(body) > 0),
  created_at timestamptz not null default now()
);

create index messages_case_idx on public.messages (case_id, created_at);

-- Off-platform supply for the prototype. Not a prescription. Not a checkout.
create table public.trial_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.product_issues (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete restrict,
  product_id uuid not null references public.trial_products (id) on delete restrict,
  issued_at date not null default (timezone('Europe/Istanbul', now()))::date,
  issued_by uuid not null references public.profiles (id),
  notes text,
  created_at timestamptz not null default now()
);

create index product_issues_case_idx on public.product_issues (case_id);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  kind public.feedback_kind not null default 'other',
  week_number integer,
  nps smallint check (nps is null or (nps >= 0 and nps <= 10)),
  answers jsonb not null default '{}'::jsonb,
  free_text text,
  created_at timestamptz not null default now()
);

create index check_ins_case_idx on public.check_ins (case_id, created_at desc);


-- Future e-Nabız / VEM. Trial rows stay disabled_trial — do not send.
create table public.integration_outbox (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete restrict,
  destination text not null default 'e_nabiz',
  payload jsonb not null default '{}'::jsonb,
  status public.outbox_status not null default 'disabled_trial',
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger integration_outbox_updated_at
  before update on public.integration_outbox
  for each row execute function public.set_updated_at();

-- Funnel: which essential steps the patient actually completed.
create table public.case_flow_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  step text not null,
  simulated boolean not null default false,
  actor_id uuid references public.profiles (id),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index case_flow_events_case_idx
  on public.case_flow_events (case_id, occurred_at);

-- ---------------------------------------------------------------------------
-- Logs: app writes access_logs on every clinical view.
-- Triggers write record_change_logs on write. No updates/deletes of log rows.
-- ---------------------------------------------------------------------------

create table public.access_logs (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  actor_role public.app_role,
  action public.access_action not null,
  entity_type text not null,
  entity_id uuid,
  ip inet,
  user_agent text
);

create index access_logs_occurred_idx on public.access_logs (occurred_at desc);
create index access_logs_entity_idx on public.access_logs (entity_type, entity_id);

create table public.record_change_logs (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  table_name text not null,
  record_id uuid not null,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  old_row jsonb,
  new_row jsonb
);

create index record_change_logs_record_idx
  on public.record_change_logs (table_name, record_id, occurred_at);

create or replace function public.write_record_change_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_old jsonb;
  v_new jsonb;
begin
  if tg_op = 'INSERT' then
    v_new := to_jsonb(new);
    v_id := (v_new ->> 'id')::uuid;
    if v_id is null and tg_table_name = 'patient_identities' then
      v_id := new.patient_id;
    end if;
    if tg_table_name = 'patient_identities' then
      v_new := jsonb_build_object('patient_id', new.patient_id, 'updated', true);
    end if;
    insert into public.record_change_logs (actor_id, table_name, record_id, operation, new_row)
    values (public.current_user_id(), tg_table_name, v_id, tg_op, v_new);
    return new;
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_id := (v_new ->> 'id')::uuid;
    if v_id is null and tg_table_name = 'patient_identities' then
      v_id := new.patient_id;
    end if;
    if tg_table_name = 'patient_identities' then
      v_old := jsonb_build_object('patient_id', old.patient_id);
      v_new := jsonb_build_object('patient_id', new.patient_id, 'updated', true);
    end if;
    insert into public.record_change_logs (actor_id, table_name, record_id, operation, old_row, new_row)
    values (public.current_user_id(), tg_table_name, v_id, tg_op, v_old, v_new);
    return new;
  else
    v_old := to_jsonb(old);
    v_id := (v_old ->> 'id')::uuid;
    if v_id is null and tg_table_name = 'patient_identities' then
      v_id := old.patient_id;
    end if;
    if tg_table_name = 'patient_identities' then
      v_old := jsonb_build_object('patient_id', old.patient_id);
    end if;
    insert into public.record_change_logs (actor_id, table_name, record_id, operation, old_row)
    values (public.current_user_id(), tg_table_name, v_id, tg_op, v_old);
    return old;
  end if;
end;
$$;

create trigger cases_change_log
  after insert or update or delete on public.cases
  for each row execute function public.write_record_change_log();

create trigger case_answers_change_log
  after insert or update or delete on public.case_answers
  for each row execute function public.write_record_change_log();

create trigger case_photos_change_log
  after insert or update or delete on public.case_photos
  for each row execute function public.write_record_change_log();

create trigger identities_change_log
  after insert or update or delete on public.patient_identities
  for each row execute function public.write_record_change_log();

create trigger prescriptions_change_log
  after insert or update or delete on public.prescriptions
  for each row execute function public.write_record_change_log();

create trigger messages_change_log
  after insert or update or delete on public.messages
  for each row execute function public.write_record_change_log();

create trigger check_ins_change_log
  after insert or update or delete on public.check_ins
  for each row execute function public.write_record_change_log();

create trigger product_issues_change_log
  after insert or update or delete on public.product_issues
  for each row execute function public.write_record_change_log();

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = public.current_user_id();
$$;

create or replace function public.my_doctor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select d.id from public.doctors d
  where d.profile_id = public.current_user_id()
  limit 1;
$$;

create or replace function public.my_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select d.clinic_id from public.doctors d
  where d.profile_id = public.current_user_id()
  limit 1;
$$;

create or replace function public.has_named_physician_consent(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.consents c
    join public.cases cs on cs.id = c.case_id
    where c.case_id = p_case_id
      and c.patient_id = cs.patient_id
      and c.kind = 'named_physician'
      and c.doctor_id = cs.assigned_doctor_id
  );
$$;

create or replace function public.has_trial_consent(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.consents
    where patient_id = p_patient_id
      and kind = 'prototype_trial'
  )
  and exists (
    select 1 from public.consents
    where patient_id = p_patient_id
      and kind = 'kvkk'
  );
$$;

create or replace function public.is_trial_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'admin';
$$;

create or replace function public.log_case_flow(
  p_case_id uuid,
  p_step text,
  p_simulated boolean default false,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.case_flow_events (
    case_id, step, simulated, actor_id, metadata
  )
  values (
    p_case_id,
    p_step,
    p_simulated,
    public.current_user_id(),
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

-- Prototype path: assign the seeded demo doctor, then named-physician consent.
create or replace function public.enroll_trial_patient()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient uuid := public.current_user_id();
  v_role public.app_role;
  v_postal text;
  v_il text;
  v_ilce text;
  v_doctor uuid;
  v_clinic uuid;
  v_doctor_name text;
  v_case uuid;
begin
  if v_patient is null then
    raise exception 'not authenticated';
  end if;

  select role, postal_code, il, ilce
    into v_role, v_postal, v_il, v_ilce
  from public.profiles
  where id = v_patient;

  if v_role is distinct from 'patient' then
    raise exception 'only patients can enroll';
  end if;

  if not public.has_trial_consent(v_patient) then
    raise exception 'KVKK and prototype trial consent required';
  end if;

  select d.id, d.clinic_id, d.full_name
    into v_doctor, v_clinic, v_doctor_name
  from public.doctors d
  join public.clinics cl on cl.id = d.clinic_id
  where d.is_demo
    and d.is_accepting_cases
    and cl.is_active
  order by d.created_at
  limit 1;

  if v_doctor is null then
    raise exception 'seed a demo doctor before enrolling trial patients';
  end if;

  insert into public.cases (
    patient_id,
    assigned_doctor_id,
    assigned_clinic_id,
    status,
    is_trial,
    postal_code,
    il,
    ilce
  )
  values (
    v_patient,
    v_doctor,
    v_clinic,
    'awaiting_consent',
    true,
    v_postal,
    v_il,
    v_ilce
  )
  returning id into v_case;

  insert into public.case_answers (
    case_id, step_id, phase, question, answer, follow_up_text
  )
  select
    v_case,
    e.key,
    'pre_medical',
    e.key,
    e.value #>> '{}',
    nullif(d.follow_up_text ->> e.key, '')
  from public.intake_drafts d
  cross join lateral jsonb_each(d.answers) as e
  where d.patient_id = v_patient
  on conflict (case_id, step_id) do nothing;

  insert into public.case_previous_treatments (case_id, category)
  select v_case, t.key
  from public.intake_drafts d
  cross join lateral jsonb_each(d.treatment_selections) as t
  where d.patient_id = v_patient
    and t.value = to_jsonb(true);

  insert into public.integration_outbox (case_id, status)
  values (v_case, 'disabled_trial');

  perform public.log_case_flow(
    v_case,
    'doctor_assigned',
    true,
    jsonb_build_object('doctor_id', v_doctor, 'doctor_name', v_doctor_name)
  );

  insert into public.access_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (v_patient, 'patient', 'insert', 'case', v_case);

  return v_case;
end;
$$;


-- ---------------------------------------------------------------------------
-- Assignment (postcode, then fewest open cases)
-- ---------------------------------------------------------------------------

create or replace function public.assign_doctor_and_open_case()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient uuid := public.current_user_id();
  v_role public.app_role;
  v_postal text;
  v_il text;
  v_ilce text;
  v_doctor uuid;
  v_clinic uuid;
  v_case uuid;
  v_prefix2 text;
begin
  if v_patient is null then
    raise exception 'not authenticated';
  end if;

  select role, postal_code, il, ilce
    into v_role, v_postal, v_il, v_ilce
  from public.profiles
  where id = v_patient;

  if v_role is distinct from 'patient' then
    raise exception 'only patients can open a case';
  end if;

  if not public.has_trial_consent(v_patient) then
    raise exception 'prototype trial consent required';
  end if;

  if not exists (
    select 1 from public.patient_identities where patient_id = v_patient
  ) then
    raise exception 'identity required before doctor assignment';
  end if;

  if v_postal is null then
    raise exception 'postal code required for doctor assignment';
  end if;

  v_prefix2 := left(v_postal, 2);

  select d.id, d.clinic_id
    into v_doctor, v_clinic
  from public.doctors d
  join public.clinics cl on cl.id = d.clinic_id
  where d.is_accepting_cases
    and cl.is_active
    and exists (
      select 1
      from public.doctor_service_areas a
      where a.doctor_id = d.id
        and (
          (a.kind = 'postal_prefix' and v_postal like a.code || '%')
          or (a.kind = 'postal_prefix' and a.code = v_prefix2)
          or (a.kind = 'il' and v_il is not null and lower(a.code) = lower(v_il))
          or (a.kind = 'ilce' and v_ilce is not null and lower(a.code) = lower(v_ilce))
        )
    )
  order by (
    select count(*)
    from public.cases c
    where c.assigned_doctor_id = d.id
      and c.status in ('awaiting_consent', 'clinical_intake', 'pending_review')
  )
  limit 1;

  if v_doctor is null then
    raise exception 'no doctor covering this postcode';
  end if;

  insert into public.cases (
    patient_id,
    assigned_doctor_id,
    assigned_clinic_id,
    status,
    is_trial,
    postal_code,
    il,
    ilce
  )
  values (
    v_patient,
    v_doctor,
    v_clinic,
    'awaiting_consent',
    true,
    v_postal,
    v_il,
    v_ilce
  )
  returning id into v_case;

  insert into public.case_answers (
    case_id, step_id, phase, question, answer, follow_up_text
  )
  select
    v_case,
    e.key,
    'pre_medical',
    e.key,
    e.value #>> '{}',
    nullif(d.follow_up_text ->> e.key, '')
  from public.intake_drafts d
  cross join lateral jsonb_each(d.answers) as e
  where d.patient_id = v_patient
  on conflict (case_id, step_id) do nothing;

  insert into public.case_previous_treatments (case_id, category)
  select v_case, t.key
  from public.intake_drafts d
  cross join lateral jsonb_each(d.treatment_selections) as t
  where d.patient_id = v_patient
    and t.value = to_jsonb(true);

  insert into public.integration_outbox (case_id, status)
  values (v_case, 'disabled_trial');

  insert into public.access_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (v_patient, 'patient', 'insert', 'case', v_case);

  return v_case;
end;
$$;

create or replace function public.accept_named_physician_consent(
  p_case_id uuid,
  p_version text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient uuid := public.current_user_id();
  v_doctor uuid;
  v_status public.case_status;
begin
  select assigned_doctor_id, status
    into v_doctor, v_status
  from public.cases
  where id = p_case_id
    and patient_id = v_patient;

  if v_doctor is null then
    raise exception 'case not found';
  end if;

  if v_status is distinct from 'awaiting_consent' then
    raise exception 'consent already recorded or case not awaiting consent';
  end if;

  insert into public.consents (
    patient_id, case_id, kind, doctor_id, version
  )
  values (
    v_patient, p_case_id, 'named_physician', v_doctor, p_version
  );

  update public.cases
  set status = 'clinical_intake'
  where id = p_case_id;

  perform public.log_case_flow(p_case_id, 'named_physician_consent', false);
end;
$$;

create or replace function public.submit_trial_case(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient uuid := public.current_user_id();
begin
  if not exists (
    select 1 from public.cases
    where id = p_case_id
      and patient_id = v_patient
      and status = 'clinical_intake'
      and public.has_named_physician_consent(p_case_id)
  ) then
    raise exception 'case not ready to submit';
  end if;

  update public.cases
  set status = 'pending_review',
      submitted_at = now()
  where id = p_case_id;

  perform public.log_case_flow(p_case_id, 'intake_submitted', false);
end;
$$;

-- Demo doctor or trial admin. Does not issue a real recete.
create or replace function public.simulate_doctor_review(
  p_case_id uuid,
  p_decision public.case_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_doctor uuid;
  v_is_demo boolean;
begin
  if p_decision not in ('approved', 'declined', 'needs_in_person') then
    raise exception 'invalid review decision';
  end if;

  select c.assigned_doctor_id, d.is_demo
    into v_doctor, v_is_demo
  from public.cases c
  join public.doctors d on d.id = c.assigned_doctor_id
  where c.id = p_case_id
    and c.status = 'pending_review'
    and c.is_trial;

  if v_doctor is null then
    raise exception 'case not awaiting review';
  end if;

  if public.my_doctor_id() is distinct from v_doctor
     and not public.is_trial_operator() then
    raise exception 'not allowed to review this case';
  end if;

  update public.cases
  set status = p_decision,
      reviewed_at = now(),
      reviewed_by = v_doctor,
      triage_note = p_note
  where id = p_case_id;

  perform public.log_case_flow(
    p_case_id,
    'doctor_review',
    v_is_demo,
    jsonb_build_object('decision', p_decision)
  );
end;
$$;

create or replace function public.issue_simulated_prescription(p_case_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_doctor uuid;
  v_number text;
begin
  select assigned_doctor_id
    into v_doctor
  from public.cases
  where id = p_case_id
    and is_trial
    and status = 'approved';

  if v_doctor is null then
    raise exception 'case is not an approved trial case';
  end if;

  if public.my_doctor_id() is distinct from v_doctor
     and not public.is_trial_operator() then
    raise exception 'not allowed to issue a simulated recete';
  end if;

  v_number := 'DEMO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.prescriptions (
    case_id, doctor_id, e_recete_number, is_simulated
  )
  values (p_case_id, v_doctor, v_number, true);

  update public.cases
  set status = 'trial_active'
  where id = p_case_id;

  perform public.log_case_flow(
    p_case_id,
    'simulated_recete',
    true,
    jsonb_build_object('e_recete_number', v_number)
  );

  return v_number;
end;
$$;

-- Never calls a ministry system. Marks the outbox as a local simulation only.
create or replace function public.simulate_kts_handoff(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.cases
    where id = p_case_id
      and is_trial
      and (
        assigned_doctor_id = public.my_doctor_id()
        or public.is_trial_operator()
      )
  ) then
    raise exception 'not allowed';
  end if;

  update public.integration_outbox
  set payload = jsonb_build_object(
        'simulated', true,
        'at', now(),
        'note', 'local prototype only — not sent to KTS or e-Nabız'
      ),
      last_error = null,
      updated_at = now()
  where case_id = p_case_id;

  perform public.log_case_flow(p_case_id, 'simulated_kts_handoff', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants + RLS
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'hiros_app') then
    create role hiros_app login password 'hiros_app_login';
  else
    execute 'alter role hiros_app login password ''hiros_app_login''';
  end if;
end
$$;

grant usage on schema public to hiros_app;
grant usage on type
  public.app_role,
  public.case_status,
  public.answer_phase,
  public.consent_kind,
  public.service_area_kind,
  public.charge_kind,
  public.charge_status,
  public.message_sender,
  public.photo_kind,
  public.risk_level,
  public.confidence_level,
  public.priority_level,
  public.flag_level,
  public.access_action,
  public.outbox_status,
  public.feedback_kind
to hiros_app;
grant usage, select on all sequences in schema public to hiros_app;
grant execute on function public.current_user_id() to hiros_app;
grant execute on function public.current_app_role() to hiros_app;
grant execute on function public.my_doctor_id() to hiros_app;
grant execute on function public.my_clinic_id() to hiros_app;
grant execute on function public.has_named_physician_consent(uuid) to hiros_app;
grant execute on function public.has_trial_consent(uuid) to hiros_app;
grant execute on function public.is_trial_operator() to hiros_app;
grant execute on function public.enroll_trial_patient() to hiros_app;
grant execute on function public.log_case_flow(uuid, text, boolean, jsonb) to hiros_app;
grant execute on function public.assign_doctor_and_open_case() to hiros_app;
grant execute on function public.accept_named_physician_consent(uuid, text) to hiros_app;
grant execute on function public.submit_trial_case(uuid) to hiros_app;
grant execute on function public.simulate_doctor_review(uuid, public.case_status, text) to hiros_app;
grant execute on function public.issue_simulated_prescription(uuid) to hiros_app;
grant execute on function public.simulate_kts_handoff(uuid) to hiros_app;

grant select, insert, update on
  public.profiles,
  public.intake_drafts,
  public.patient_identities,
  public.cases,
  public.case_answers,
  public.case_previous_treatments,
  public.case_photos,
  public.consents,
  public.payment_methods,
  public.charges,
  public.case_pharmacy_preferences,
  public.messages,
  public.check_ins,
  public.case_flow_events
to hiros_app;

grant select on
  public.clinics,
  public.doctors,
  public.doctor_service_areas,
  public.consent_versions,
  public.pharmacies,
  public.prescriptions,
  public.integration_outbox,
  public.trial_products,
  public.product_issues
to hiros_app;

grant insert on
  public.prescriptions,
  public.access_logs,
  public.product_issues
to hiros_app;

grant insert, update on public.clinics to hiros_app;
grant insert, update on public.doctors to hiros_app;
grant insert, update, delete on public.doctor_service_areas to hiros_app;
grant insert, update on public.pharmacies to hiros_app;
grant insert, update on public.consent_versions to hiros_app;
grant insert, update on public.trial_products to hiros_app;

alter table public.profiles enable row level security;
alter table public.clinics enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_service_areas enable row level security;
alter table public.patient_identities enable row level security;
alter table public.intake_drafts enable row level security;
alter table public.cases enable row level security;
alter table public.case_answers enable row level security;
alter table public.case_previous_treatments enable row level security;
alter table public.case_photos enable row level security;
alter table public.consent_versions enable row level security;
alter table public.consents enable row level security;
alter table public.payment_methods enable row level security;
alter table public.charges enable row level security;
alter table public.prescriptions enable row level security;
alter table public.case_pharmacy_preferences enable row level security;
alter table public.pharmacies enable row level security;
alter table public.messages enable row level security;
alter table public.integration_outbox enable row level security;
alter table public.trial_products enable row level security;
alter table public.product_issues enable row level security;
alter table public.check_ins enable row level security;
alter table public.case_flow_events enable row level security;
alter table public.access_logs enable row level security;
alter table public.record_change_logs enable row level security;

alter table public.profiles force row level security;
alter table public.clinics force row level security;
alter table public.doctors force row level security;
alter table public.doctor_service_areas force row level security;
alter table public.patient_identities force row level security;
alter table public.intake_drafts force row level security;
alter table public.cases force row level security;
alter table public.case_answers force row level security;
alter table public.case_previous_treatments force row level security;
alter table public.case_photos force row level security;
alter table public.consent_versions force row level security;
alter table public.consents force row level security;
alter table public.payment_methods force row level security;
alter table public.charges force row level security;
alter table public.prescriptions force row level security;
alter table public.case_pharmacy_preferences force row level security;
alter table public.pharmacies force row level security;
alter table public.messages force row level security;
alter table public.integration_outbox force row level security;
alter table public.trial_products force row level security;
alter table public.product_issues force row level security;
alter table public.check_ins force row level security;
alter table public.case_flow_events force row level security;
alter table public.access_logs force row level security;
alter table public.record_change_logs force row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select to hiros_app
  using (id = public.current_user_id());

create policy profiles_select_assigned_patient on public.profiles
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.patient_id = profiles.id
        and c.assigned_doctor_id = public.my_doctor_id()
    )
  );

create policy profiles_select_staff_non_patients on public.profiles
  for select to hiros_app
  using (
    public.current_app_role() in ('admin', 'support')
    and role <> 'patient'
  );

create policy profiles_select_trial_patients on public.profiles
  for select to hiros_app
  using (
    public.is_trial_operator()
    and exists (
      select 1 from public.cases c
      where c.patient_id = profiles.id
        and c.is_trial
    )
  );

create policy profiles_update_own on public.profiles
  for update to hiros_app
  using (id = public.current_user_id())
  with check (
    id = public.current_user_id()
    and role = (select p.role from public.profiles p where p.id = public.current_user_id())
  );

create policy profiles_insert_self on public.profiles
  for insert to hiros_app
  with check (
    id = public.current_user_id()
    and role = 'patient'
  );

create policy profiles_admin_insert on public.profiles
  for insert to hiros_app
  with check (public.current_app_role() = 'admin');

-- clinics / doctors
create policy clinics_select on public.clinics
  for select to hiros_app
  using (
    public.current_app_role() = 'admin'
    or id = public.my_clinic_id()
    or exists (
      select 1 from public.cases c
      where c.assigned_clinic_id = clinics.id
        and c.patient_id = public.current_user_id()
    )
  );

create policy clinics_admin_write on public.clinics
  for all to hiros_app
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

create policy doctors_select on public.doctors
  for select to hiros_app
  using (
    profile_id = public.current_user_id()
    or public.current_app_role() = 'admin'
    or exists (
      select 1 from public.cases c
      where c.assigned_doctor_id = doctors.id
        and c.patient_id = public.current_user_id()
    )
  );

create policy doctors_admin_write on public.doctors
  for all to hiros_app
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

create policy service_areas_select on public.doctor_service_areas
  for select to hiros_app
  using (
    public.current_app_role() = 'admin'
    or doctor_id = public.my_doctor_id()
  );

create policy service_areas_admin_write on public.doctor_service_areas
  for all to hiros_app
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

create policy consent_versions_select on public.consent_versions
  for select to hiros_app
  using (true);

create policy consent_versions_admin_write on public.consent_versions
  for all to hiros_app
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

-- identity + drafts
create policy identities_select on public.patient_identities
  for select to hiros_app
  using (
    patient_id = public.current_user_id()
    or exists (
      select 1 from public.cases c
      where c.patient_id = patient_identities.patient_id
        and c.assigned_doctor_id = public.my_doctor_id()
    )
    or (
      public.is_trial_operator()
      and exists (
        select 1 from public.cases c
        where c.patient_id = patient_identities.patient_id
          and c.is_trial
      )
    )
  );

create policy identities_insert_own on public.patient_identities
  for insert to hiros_app
  with check (patient_id = public.current_user_id());

create policy identities_update_own on public.patient_identities
  for update to hiros_app
  using (patient_id = public.current_user_id())
  with check (patient_id = public.current_user_id());

create policy drafts_own on public.intake_drafts
  for all to hiros_app
  using (patient_id = public.current_user_id())
  with check (patient_id = public.current_user_id());

-- cases
create policy cases_select on public.cases
  for select to hiros_app
  using (
    patient_id = public.current_user_id()
    or assigned_doctor_id = public.my_doctor_id()
    or (is_trial and public.is_trial_operator())
  );

create policy cases_admin_trial_update on public.cases
  for update to hiros_app
  using (is_trial and public.is_trial_operator())
  with check (is_trial and public.is_trial_operator());

create policy cases_doctor_update on public.cases
  for update to hiros_app
  using (assigned_doctor_id = public.my_doctor_id())
  with check (assigned_doctor_id = public.my_doctor_id());

create policy cases_patient_cancel on public.cases
  for update to hiros_app
  using (
    patient_id = public.current_user_id()
    and status in ('trial_onboarding', 'trial_active', 'awaiting_consent', 'clinical_intake')
  )
  with check (
    patient_id = public.current_user_id()
    and status = 'cancelled'
  );

create policy answers_select on public.case_answers
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_answers.case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

create policy answers_patient_insert_pre_medical on public.case_answers
  for insert to hiros_app
  with check (
    phase = 'pre_medical'
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.patient_id = public.current_user_id()
        and c.status in ('trial_onboarding', 'trial_active', 'awaiting_consent', 'clinical_intake')
    )
  );

create policy answers_patient_insert_clinical on public.case_answers
  for insert to hiros_app
  with check (
    phase = 'clinical'
    and public.has_named_physician_consent(case_id)
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.patient_id = public.current_user_id()
        and c.status = 'clinical_intake'
    )
  );

create policy answers_patient_update_open on public.case_answers
  for update to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_answers.case_id
        and c.patient_id = public.current_user_id()
        and c.status = 'clinical_intake'
    )
  )
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.patient_id = public.current_user_id()
        and c.status = 'clinical_intake'
    )
  );

create policy answers_doctor_flag on public.case_answers
  for update to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_answers.case_id
        and c.assigned_doctor_id = public.my_doctor_id()
    )
  )
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.assigned_doctor_id = public.my_doctor_id()
    )
  );

create policy treatments_select on public.case_previous_treatments
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_previous_treatments.case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

create policy treatments_patient_write on public.case_previous_treatments
  for all to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_previous_treatments.case_id
        and c.patient_id = public.current_user_id()
        and c.status in ('trial_onboarding', 'trial_active', 'clinical_intake')
    )
  )
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.patient_id = public.current_user_id()
        and c.status in ('trial_onboarding', 'trial_active', 'clinical_intake')
    )
  );

create policy photos_select on public.case_photos
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_photos.case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

create policy photos_patient_insert on public.case_photos
  for insert to hiros_app
  with check (
    public.has_named_physician_consent(case_id)
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.patient_id = public.current_user_id()
        and c.status = 'clinical_intake'
    )
  );

create policy consents_select on public.consents
  for select to hiros_app
  using (
    patient_id = public.current_user_id()
    or (kind = 'named_physician' and doctor_id = public.my_doctor_id())
    or (
      public.is_trial_operator()
      and exists (
        select 1 from public.cases c
        where c.patient_id = consents.patient_id
          and c.is_trial
      )
    )
  );

create policy consents_patient_insert on public.consents
  for insert to hiros_app
  with check (patient_id = public.current_user_id());

create policy payment_methods_own on public.payment_methods
  for all to hiros_app
  using (patient_id = public.current_user_id())
  with check (patient_id = public.current_user_id());

create policy charges_patient_select on public.charges
  for select to hiros_app
  using (patient_id = public.current_user_id());

create policy charges_doctor_consult_select on public.charges
  for select to hiros_app
  using (kind = 'consult' and clinic_id = public.my_clinic_id());

create policy charges_patient_insert on public.charges
  for insert to hiros_app
  with check (
    patient_id = public.current_user_id()
    and status in ('method_saved', 'pending_approval')
    and exists (
      select 1 from public.cases c
      where c.id = case_id and c.patient_id = public.current_user_id()
    )
  );

create policy prescriptions_select on public.prescriptions
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = prescriptions.case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
        )
    )
  );

create policy prescriptions_doctor_insert on public.prescriptions
  for insert to hiros_app
  with check (
    doctor_id = public.my_doctor_id()
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.assigned_doctor_id = public.my_doctor_id()
        and c.status = 'approved'
    )
  );

create policy pharmacy_pref_patient on public.case_pharmacy_preferences
  for all to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_pharmacy_preferences.case_id
        and c.patient_id = public.current_user_id()
    )
  )
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.patient_id = public.current_user_id()
    )
  );

create policy pharmacies_select_active on public.pharmacies
  for select to hiros_app
  using (is_active);

create policy pharmacies_admin_write on public.pharmacies
  for all to hiros_app
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

create policy messages_select on public.messages
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = messages.case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
        )
    )
  );

create policy messages_patient_insert on public.messages
  for insert to hiros_app
  with check (
    sender_role = 'patient'
    and sender_profile_id = public.current_user_id()
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.patient_id = public.current_user_id()
        and c.assigned_doctor_id is not null
    )
  );

create policy messages_doctor_insert on public.messages
  for insert to hiros_app
  with check (
    sender_role = 'doctor'
    and sender_profile_id = public.current_user_id()
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.assigned_doctor_id = public.my_doctor_id()
    )
  );

-- Trial supply + feedback
create policy trial_products_select on public.trial_products
  for select to hiros_app
  using (is_active or public.is_trial_operator());

create policy trial_products_admin_write on public.trial_products
  for all to hiros_app
  using (public.is_trial_operator())
  with check (public.is_trial_operator());

create policy product_issues_select on public.product_issues
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = product_issues.case_id
        and (
          c.patient_id = public.current_user_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

create policy product_issues_admin_insert on public.product_issues
  for insert to hiros_app
  with check (
    public.is_trial_operator()
    and issued_by = public.current_user_id()
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.is_trial
    )
  );

create policy check_ins_select on public.check_ins
  for select to hiros_app
  using (
    patient_id = public.current_user_id()
    or exists (
      select 1 from public.cases c
      where c.id = check_ins.case_id
        and c.is_trial
        and public.is_trial_operator()
    )
  );

create policy check_ins_patient_insert on public.check_ins
  for insert to hiros_app
  with check (
    patient_id = public.current_user_id()
    and exists (
      select 1 from public.cases c
      where c.id = case_id
        and c.patient_id = public.current_user_id()
        and c.status in ('trial_active', 'approved')
    )
  );

create policy flow_events_select on public.case_flow_events
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_flow_events.case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

create policy flow_events_insert on public.case_flow_events
  for insert to hiros_app
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

-- Outbox: assigned doctor/patient can see status; nobody sends during trial.
create policy outbox_select on public.integration_outbox
  for select to hiros_app
  using (
    exists (
      select 1 from public.cases c
      where c.id = integration_outbox.case_id
        and (
          c.patient_id = public.current_user_id()
          or c.assigned_doctor_id = public.my_doctor_id()
          or (c.is_trial and public.is_trial_operator())
        )
    )
  );

-- Access logs: actor may insert their own view/write events. No select for
-- support on clinical entities — they cannot infer cases from this table.
create policy access_logs_insert_own on public.access_logs
  for insert to hiros_app
  with check (actor_id = public.current_user_id());

create policy access_logs_select_own on public.access_logs
  for select to hiros_app
  using (actor_id = public.current_user_id());

-- Change logs are not readable via the app role (owner / ops only).
revoke all on public.record_change_logs from hiros_app;

do $$
begin
  execute format(
    'grant connect on database %I to hiros_app',
    current_database()
  );
end
$$;
