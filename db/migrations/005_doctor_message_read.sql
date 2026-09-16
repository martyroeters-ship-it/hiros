alter table public.cases
  add column if not exists doctor_last_read_at timestamptz;

comment on column public.cases.doctor_last_read_at is
  'When the assigned physician last opened this case in messenger. Null means never read.';
