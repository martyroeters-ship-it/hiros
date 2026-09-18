create table if not exists public.care_lifestyle_checkins (
  user_id uuid not null references public.profiles (id) on delete cascade,
  area text not null check (area in ('nutrition', 'sleep')),
  answers jsonb not null default '{}'::jsonb,
  status text not null check (status in ('on_track', 'needs_attention')),
  completed_at timestamptz not null default now(),
  primary key (user_id, area)
);
