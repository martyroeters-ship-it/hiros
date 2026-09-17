-- Demo clinic + named physician for the trial flow.
-- Runs as the database owner (bypasses RLS). Safe to re-run.
-- Physician name must match src/lib/demo-physician.ts (Dr. Ahmet Yılmaz).

insert into public.consent_versions (kind, version, locale, body_hash)
values
  ('kvkk', 'trial-v1', 'tr', 'kvkk-trial-v1'),
  ('prototype_trial', 'trial-v1', 'tr', 'prototype-trial-v1'),
  ('telemedicine', 'trial-v1', 'tr', 'telemedicine-trial-v1'),
  ('named_physician', 'trial-v1', 'tr', 'named-physician-trial-v1')
on conflict (kind, version, locale) do nothing;

insert into public.profiles (
  id, role, email, first_name, last_name, locale, is_active
)
values
  (
    '00000000-0000-4000-a000-0000000000a1',
    'admin',
    'admin@hiros.local',
    'Hiros',
    'Admin',
    'tr',
    true
  ),
  (
    '00000000-0000-4000-a000-0000000000d1',
    'doctor',
    'demo.hekim@hiros.local',
    'Ahmet',
    'Yılmaz',
    'tr',
    true
  )
on conflict (id) do nothing;

insert into public.clinics (
  id,
  name,
  license_number,
  city,
  remote_care_permitted,
  is_demo,
  is_active
)
values (
  '00000000-0000-4000-a000-0000000000c1',
  'Hiros Demo Kliniği',
  'DEMO-CLINIC',
  'İstanbul',
  true,
  true,
  true
)
on conflict (id) do nothing;

insert into public.doctors (
  id,
  profile_id,
  clinic_id,
  full_name,
  license_number,
  specialty,
  is_accepting_cases,
  is_demo,
  invited_at
)
values (
  '00000000-0000-4000-a000-0000000000d0',
  '00000000-0000-4000-a000-0000000000d1',
  '00000000-0000-4000-a000-0000000000c1',
  'Dr. Ahmet Yılmaz',
  'DEMO-LICENSE',
  'Dermatoloji',
  true,
  true,
  now()
)
on conflict (id) do nothing;

insert into public.trial_products (id, name, notes, is_active)
values (
  '00000000-0000-4000-a000-0000000000f1',
  'Minoksidil %5 solüsyon',
  'Off-platform trial supply. Not a Hiros pharmacy sale.',
  true
)
on conflict (id) do nothing;
