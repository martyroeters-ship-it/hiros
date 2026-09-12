import { sql } from "./db";
import { getDoctorNow } from "./now-repo";

export type DoctorNavBadges = {
  now: number;
  cases: number;
  agenda: number;
  messages: number;
};

export async function getDoctorNavBadges(): Promise<DoctorNavBadges> {
  const [cases] = await sql<{ n: number }[]>`
    select count(*)::int as n
    from public.cases
    where status not in ('approved', 'trial_active', 'declined')
  `;

  const [agenda] = await sql<{ n: number }[]>`
    select count(*)::int as n
    from public.video_appointments
    where status = 'requested'
       or (
         status = 'scheduled'
         and starts_at >= date_trunc('day', now())
         and starts_at < date_trunc('day', now()) + interval '1 day'
       )
  `;

  const [messages] = await sql<{ n: number }[]>`
    select count(*)::int as n
    from public.cases c
    join lateral (
      select sender_role
      from public.messages
      where case_id = c.id
      order by created_at desc
      limit 1
    ) m on true
    where m.sender_role = 'patient'
      and c.assigned_doctor_id is not null
      and c.status in ('approved', 'trial_active')
  `;

  const queue = await getDoctorNow();

  return {
    now: queue.length,
    cases: cases?.n ?? 0,
    agenda: agenda?.n ?? 0,
    messages: messages?.n ?? 0,
  };
}
