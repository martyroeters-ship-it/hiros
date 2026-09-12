-- Three in-treatment demo patients for the doctor Patients tab.
-- Safe to re-run.

insert into public.profiles (
  id, role, email, first_name, last_name, phone, locale, postal_code, il, is_active
)
values
  (
    '00000000-0000-4000-a000-000000000b01',
    'patient',
    'demo+can@hiros.local',
    'Can',
    'Demir',
    '5321112233',
    'tr',
    '34710',
    'İstanbul',
    true
  ),
  (
    '00000000-0000-4000-a000-000000000b02',
    'patient',
    'demo+emre@hiros.local',
    'Emre',
    'Kaya',
    '5332223344',
    'tr',
    '06680',
    'Ankara',
    true
  ),
  (
    '00000000-0000-4000-a000-000000000b03',
    'patient',
    'demo+selin@hiros.local',
    'Selin',
    'Arslan',
    '5343334455',
    'tr',
    '35220',
    'İzmir',
    true
  )
on conflict (id) do nothing;

insert into public.consents (patient_id, kind, version)
select v.patient_id, v.kind, 'trial-v1'
from (
  values
    ('00000000-0000-4000-a000-000000000b01'::uuid, 'kvkk'::public.consent_kind),
    ('00000000-0000-4000-a000-000000000b01'::uuid, 'prototype_trial'::public.consent_kind),
    ('00000000-0000-4000-a000-000000000b02'::uuid, 'kvkk'::public.consent_kind),
    ('00000000-0000-4000-a000-000000000b02'::uuid, 'prototype_trial'::public.consent_kind),
    ('00000000-0000-4000-a000-000000000b03'::uuid, 'kvkk'::public.consent_kind),
    ('00000000-0000-4000-a000-000000000b03'::uuid, 'prototype_trial'::public.consent_kind)
) as v(patient_id, kind)
where not exists (
  select 1 from public.consents c
  where c.patient_id = v.patient_id and c.kind = v.kind
);

insert into public.cases (
  id, patient_id, assigned_doctor_id, assigned_clinic_id, status, is_trial,
  postal_code, il, risk, aga_score, confidence, priority, submitted_at, reviewed_at
)
values
  (
    '00000000-0000-4000-a000-000000000c01',
    '00000000-0000-4000-a000-000000000b01',
    '00000000-0000-4000-a000-0000000000d0',
    '00000000-0000-4000-a000-0000000000c1',
    'trial_active',
    true,
    '34710',
    'İstanbul',
    'Green',
    20,
    'High',
    'Low',
    now() - interval '46 days',
    now() - interval '45 days'
  ),
  (
    '00000000-0000-4000-a000-000000000c02',
    '00000000-0000-4000-a000-000000000b02',
    '00000000-0000-4000-a000-0000000000d0',
    '00000000-0000-4000-a000-0000000000c1',
    'trial_active',
    true,
    '06680',
    'Ankara',
    'Orange',
    15,
    'Medium',
    'Medium',
    now() - interval '18 days',
    now() - interval '16 days'
  ),
  (
    '00000000-0000-4000-a000-000000000c03',
    '00000000-0000-4000-a000-000000000b03',
    '00000000-0000-4000-a000-0000000000d0',
    '00000000-0000-4000-a000-0000000000c1',
    'trial_active',
    true,
    '35220',
    'İzmir',
    'Orange',
    18,
    'Medium',
    'Low',
    now() - interval '38 days',
    now() - interval '36 days'
  )
on conflict (id) do nothing;

insert into public.case_answers (case_id, step_id, phase, question, answer, follow_up_text)
values
  -- Can: full max-score intake → 20/20, no flags
  ('00000000-0000-4000-a000-000000000c01', 'current-situation', 'pre_medical', 'Reason for visit', 'My hairline has changed', null),
  ('00000000-0000-4000-a000-000000000c01', 'change-location', 'pre_medical', 'Affected areas', 'Hairline / temples', null),
  ('00000000-0000-4000-a000-000000000c01', 'timeline', 'pre_medical', 'Reported onset', '1–3 years', null),
  ('00000000-0000-4000-a000-000000000c01', 'clarity', 'pre_medical', 'Clarity sought', 'What a physician may recommend', null),
  ('00000000-0000-4000-a000-000000000c01', 'primary-goal', 'pre_medical', 'Primary goal', 'I want to prevent further hair loss', null),
  ('00000000-0000-4000-a000-000000000c01', 'progression', 'clinical', 'Rate of progression', 'Slow and steady over years', null),
  ('00000000-0000-4000-a000-000000000c01', 'symptoms', 'clinical', 'Scalp symptoms', 'No symptoms', null),
  ('00000000-0000-4000-a000-000000000c01', 'family-history', 'clinical', 'Family history of hair loss', 'Father or grandfather experienced hair loss', null),
  ('00000000-0000-4000-a000-000000000c01', 'medical-conditions', 'clinical', 'Ongoing medical conditions', 'No known conditions', null),
  ('00000000-0000-4000-a000-000000000c01', 'medications', 'clinical', 'Current medications', 'No', null),
  ('00000000-0000-4000-a000-000000000c01', 'recent-changes', 'clinical', 'Recent changes', 'None of these', null),
  ('00000000-0000-4000-a000-000000000c01', 'previous-hair-loss-treatments', 'clinical', 'Previous treatments', 'No', null),
  ('00000000-0000-4000-a000-000000000c01', 'final-notes', 'clinical', 'Additional notes', 'No', null),
  -- Emre: recent onset is an orange flag → 15/20, video visit to clarify
  ('00000000-0000-4000-a000-000000000c02', 'current-situation', 'pre_medical', 'Reason for visit', 'I’m seeing more thinning or shedding', null),
  ('00000000-0000-4000-a000-000000000c02', 'change-location', 'pre_medical', 'Affected areas', 'Crown', null),
  ('00000000-0000-4000-a000-000000000c02', 'timeline', 'pre_medical', 'Reported onset', 'Less than 3 months', null),
  ('00000000-0000-4000-a000-000000000c02', 'clarity', 'pre_medical', 'Clarity sought', 'What options might fit my situation', null),
  ('00000000-0000-4000-a000-000000000c02', 'primary-goal', 'pre_medical', 'Primary goal', 'I want to prevent further hair loss', null),
  ('00000000-0000-4000-a000-000000000c02', 'progression', 'clinical', 'Rate of progression', 'Gradual over months', null),
  ('00000000-0000-4000-a000-000000000c02', 'symptoms', 'clinical', 'Scalp symptoms', 'Mild dandruff or dryness', null),
  ('00000000-0000-4000-a000-000000000c02', 'family-history', 'clinical', 'Family history of hair loss', 'Some family thinning', null),
  ('00000000-0000-4000-a000-000000000c02', 'medical-conditions', 'clinical', 'Ongoing medical conditions', 'No known conditions', null),
  ('00000000-0000-4000-a000-000000000c02', 'medications', 'clinical', 'Current medications', 'Yes', 'Vitamin D'),
  ('00000000-0000-4000-a000-000000000c02', 'recent-changes', 'clinical', 'Recent changes', 'None of these', null),
  ('00000000-0000-4000-a000-000000000c02', 'previous-hair-loss-treatments', 'clinical', 'Previous treatments', 'No', null),
  ('00000000-0000-4000-a000-000000000c02', 'final-notes', 'clinical', 'Additional notes', 'No', null),
  -- Selin: 18/20 Orange, no intake flags (treatment alerts come from check-in)
  ('00000000-0000-4000-a000-000000000c03', 'current-situation', 'pre_medical', 'Reason for visit', 'My hairline has changed', null),
  ('00000000-0000-4000-a000-000000000c03', 'change-location', 'pre_medical', 'Affected areas', 'Overall thinning', null),
  ('00000000-0000-4000-a000-000000000c03', 'timeline', 'pre_medical', 'Reported onset', '1–3 years', null),
  ('00000000-0000-4000-a000-000000000c03', 'clarity', 'pre_medical', 'Clarity sought', 'What a physician may recommend', null),
  ('00000000-0000-4000-a000-000000000c03', 'primary-goal', 'pre_medical', 'Primary goal', 'I want to prevent further hair loss', null),
  ('00000000-0000-4000-a000-000000000c03', 'progression', 'clinical', 'Rate of progression', 'Slow and steady over years', null),
  ('00000000-0000-4000-a000-000000000c03', 'symptoms', 'clinical', 'Scalp symptoms', 'Itching', null),
  ('00000000-0000-4000-a000-000000000c03', 'family-history', 'clinical', 'Family history of hair loss', 'Father or grandfather experienced hair loss', null),
  ('00000000-0000-4000-a000-000000000c03', 'medical-conditions', 'clinical', 'Ongoing medical conditions', 'No known conditions', null),
  ('00000000-0000-4000-a000-000000000c03', 'medications', 'clinical', 'Current medications', 'Yes', 'Occasional antihistamine'),
  ('00000000-0000-4000-a000-000000000c03', 'recent-changes', 'clinical', 'Recent changes', 'None of these', null),
  ('00000000-0000-4000-a000-000000000c03', 'previous-hair-loss-treatments', 'clinical', 'Previous treatments', 'No', null),
  ('00000000-0000-4000-a000-000000000c03', 'final-notes', 'clinical', 'Additional notes', 'No', null)
on conflict (case_id, step_id) do update set
  phase = excluded.phase,
  question = excluded.question,
  answer = excluded.answer,
  follow_up_text = excluded.follow_up_text,
  flag = null,
  flag_note = null;

update public.case_answers
set
  flag = 'orange',
  flag_note = 'Very recent onset — consider telogen effluvium or temporary shedding vs. AGA.'
where case_id = '00000000-0000-4000-a000-000000000c02'
  and step_id = 'timeline';

update public.case_answers
set
  flag = 'orange',
  flag_note = 'Scalp itching — physician review advised.'
where case_id = '00000000-0000-4000-a000-000000000c03'
  and step_id = 'symptoms';

update public.cases
set
  risk = 'Green',
  aga_score = 20,
  confidence = 'High',
  findings = '[]'::jsonb
where id = '00000000-0000-4000-a000-000000000c01';

update public.cases
set
  risk = 'Orange',
  aga_score = 15,
  confidence = 'Medium',
  findings = '[{"level":"orange","point":"Reported onset: Less than 3 months","note":"Very recent onset — consider telogen effluvium or temporary shedding vs. AGA."}]'::jsonb
where id = '00000000-0000-4000-a000-000000000c02';

update public.cases
set
  risk = 'Orange',
  aga_score = 18,
  confidence = 'Medium',
  findings = '[{"level":"orange","point":"Scalp symptoms: Itching","note":"Scalp itching — physician review advised."}]'::jsonb
where id = '00000000-0000-4000-a000-000000000c03';

insert into public.case_treatments (case_id, name, follow_up_at, notes)
values
  (
    '00000000-0000-4000-a000-000000000c01',
    'Topical Finasteride + Minoxidil',
    (timezone('Europe/Istanbul', now()))::date + 45,
    'Started after first review. Patient collecting at local eczane.'
  ),
  (
    '00000000-0000-4000-a000-000000000c02',
    'Topical Minoxidil',
    (timezone('Europe/Istanbul', now()))::date + 74,
    null
  ),
  (
    '00000000-0000-4000-a000-000000000c03',
    'Topical Finasteride',
    (timezone('Europe/Istanbul', now()))::date - 2,
    'Follow-up is due. Review side-effect report.'
  )
on conflict (case_id) do update set
  name = excluded.name,
  follow_up_at = excluded.follow_up_at,
  notes = excluded.notes;

insert into public.prescriptions (
  case_id, doctor_id, e_recete_number, is_simulated, issued_at, filled_reported_at, fill_note
)
values
  (
    '00000000-0000-4000-a000-000000000c01',
    '00000000-0000-4000-a000-0000000000d0',
    'DEMO-CAN0000001',
    true,
    now() - interval '44 days',
    now() - interval '42 days',
    'Patient reported collection at eczane'
  ),
  (
    '00000000-0000-4000-a000-000000000c02',
    '00000000-0000-4000-a000-0000000000d0',
    'DEMO-EMRE000002',
    true,
    now() - interval '15 days',
    null,
    null
  ),
  (
    '00000000-0000-4000-a000-000000000c03',
    '00000000-0000-4000-a000-0000000000d0',
    'DEMO-SELIN00003',
    true,
    now() - interval '35 days',
    now() - interval '33 days',
    'Collected'
  )
on conflict (case_id) do update set
  filled_reported_at = excluded.filled_reported_at,
  fill_note = excluded.fill_note,
  issued_at = excluded.issued_at;

insert into public.check_ins (case_id, patient_id, kind, week_number, answers, free_text, created_at)
select
  '00000000-0000-4000-a000-000000000c01',
  '00000000-0000-4000-a000-000000000b01',
  'adherence',
  6,
  '{"tookMedsThisMonth": true, "submittedPhotos": true, "sideEffects": null, "daysTaken": 26}'::jsonb,
  'Using every night. No irritation.',
  now() - interval '4 days'
where not exists (
  select 1 from public.check_ins
  where case_id = '00000000-0000-4000-a000-000000000c01'
);

insert into public.check_ins (case_id, patient_id, kind, week_number, answers, free_text, created_at)
select
  '00000000-0000-4000-a000-000000000c03',
  '00000000-0000-4000-a000-000000000b03',
  'side_effect',
  5,
  '{"tookMedsThisMonth": false, "submittedPhotos": false, "sideEffects": "Scalp itching and flaking", "daysTaken": 8}'::jsonb,
  'Stopped for several days after itching started.',
  now() - interval '9 days'
where not exists (
  select 1 from public.check_ins
  where case_id = '00000000-0000-4000-a000-000000000c03'
);
