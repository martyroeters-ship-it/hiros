-- Video visits only for clarification of a flagged answer or a reported
-- side effect. Not routine check-ins. Safe to re-run.

delete from public.video_appointments
where id = '00000000-0000-4000-a000-000000000e03';

insert into public.video_appointments (
  id, case_id, patient_id, doctor_id, starts_at, duration_minutes,
  status, requested_by, reason, notes
)
values
  (
    '00000000-0000-4000-a000-000000000e01',
    '00000000-0000-4000-a000-000000000c02',
    '00000000-0000-4000-a000-000000000b02',
    '00000000-0000-4000-a000-0000000000d0',
    timezone('Europe/Istanbul', timestamp '2026-09-03 11:00:00'),
    20,
    'completed',
    'doctor',
    'Clarify flagged onset under 3 months — telogen vs AGA',
    'Asked about recent illness, crash diet, and new medication. Patient reported a high-fever flu 8 weeks ago.'
  ),
  (
    '00000000-0000-4000-a000-000000000e02',
    '00000000-0000-4000-a000-000000000c03',
    '00000000-0000-4000-a000-000000000b03',
    '00000000-0000-4000-a000-0000000000d0',
    timezone('Europe/Istanbul', timestamp '2026-09-08 14:00:00'),
    20,
    'requested',
    'patient',
    'Clarify flagged scalp itching and whether to pause treatment',
    null
  ),
  (
    '00000000-0000-4000-a000-000000000e04',
    '00000000-0000-4000-a000-000000000c02',
    '00000000-0000-4000-a000-000000000b02',
    '00000000-0000-4000-a000-0000000000d0',
    timezone('Europe/Istanbul', timestamp '2026-09-11 16:00:00'),
    20,
    'scheduled',
    'doctor',
    'Clarify whether the recent-onset flag is shedding after a fever',
    null
  )
on conflict (id) do update set
  case_id = excluded.case_id,
  patient_id = excluded.patient_id,
  starts_at = excluded.starts_at,
  duration_minutes = excluded.duration_minutes,
  status = excluded.status,
  requested_by = excluded.requested_by,
  reason = excluded.reason,
  notes = excluded.notes;
