-- Email/password for the Istanbul demo. Not OAuth.
-- Prototype only: no email verification, no TCKN binding.

alter table public.profiles
  add column if not exists password_hash text;

comment on column public.profiles.password_hash is
  'scrypt salt:hash for demo email login. Null for seeded/demo-only rows.';
