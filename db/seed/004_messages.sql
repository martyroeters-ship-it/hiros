-- Demo inbox threads for the doctor messenger. Safe to re-run.

insert into public.messages (id, case_id, sender_role, sender_profile_id, body, created_at)
values
  (
    '00000000-0000-4000-a000-000000000101',
    '00000000-0000-4000-a000-000000000c03',
    'patient',
    '00000000-0000-4000-a000-000000000b03',
    'The itching is worse in the evenings. Should I pause the treatment until the video call?',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-4000-a000-000000000102',
    '00000000-0000-4000-a000-000000000c03',
    'doctor',
    '00000000-0000-4000-a000-0000000000d1',
    'Thank you for writing. Do not start a new bottle until we have spoken. Keep the call on Tuesday so we can go through the flagged itching together.',
    now() - interval '2 days' + interval '20 minutes'
  ),
  (
    '00000000-0000-4000-a000-000000000103',
    '00000000-0000-4000-a000-000000000c03',
    'patient',
    '00000000-0000-4000-a000-000000000b03',
    'Understood. I will wait and see you then.',
    now() - interval '2 days' + interval '35 minutes'
  ),
  (
    '00000000-0000-4000-a000-000000000104',
    '00000000-0000-4000-a000-000000000c02',
    'doctor',
    '00000000-0000-4000-a000-0000000000d1',
    'Emre, before Friday I would like to know whether the shedding started after a fever or illness. That helps decide if this is telogen or AGA.',
    now() - interval '1 day'
  ),
  (
    '00000000-0000-4000-a000-000000000105',
    '00000000-0000-4000-a000-000000000c02',
    'patient',
    '00000000-0000-4000-a000-000000000b02',
    'I had a fever about five weeks ago. The extra shedding started two weeks after that.',
    now() - interval '1 day' + interval '3 hours'
  ),
  (
    '00000000-0000-4000-a000-000000000106',
    '00000000-0000-4000-a000-000000000c01',
    'patient',
    '00000000-0000-4000-a000-000000000b01',
    'Collected the e-reçete at the eczane yesterday. Starting tonight.',
    now() - interval '12 hours'
  ),
  (
    '00000000-0000-4000-a000-000000000107',
    '00000000-0000-4000-a000-000000000c01',
    'doctor',
    '00000000-0000-4000-a000-0000000000d1',
    'Good. Use it at the same time each evening. Write if anything unexpected shows up — no need for a call unless a flag appears.',
    now() - interval '11 hours'
  )
on conflict (id) do nothing;
