alter table public.case_photos
  add column if not exists bytes bytea;
