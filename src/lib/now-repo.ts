import { sql } from "./db";

export type NowKind = "new_case" | "visit_request" | "call_today" | "unread_message";

export type NowItem = {
  id: string;
  kind: NowKind;
  title: string;
  detail: string;
  href: string;
  when: number;
};

export async function getDoctorNow(): Promise<NowItem[]> {
  const cases = await sql<
    {
      id: string;
      first_name: string | null;
      last_name: string | null;
      submitted_at: Date | null;
      created_at: Date;
      reason: string | null;
    }[]
  >`
    select
      c.id,
      p.first_name,
      p.last_name,
      c.submitted_at,
      c.created_at,
      (
        select a.answer
        from public.case_answers a
        where a.case_id = c.id and a.step_id = 'current-situation'
        limit 1
      ) as reason
    from public.cases c
    join public.profiles p on p.id = c.patient_id
    where c.status not in ('approved', 'trial_active', 'declined')
    order by coalesce(c.submitted_at, c.created_at) desc
  `;

  const visits = await sql<
    {
      id: string;
      case_id: string;
      first_name: string | null;
      last_name: string | null;
      starts_at: Date;
      status: string;
      reason: string | null;
    }[]
  >`
    select
      a.id,
      a.case_id,
      p.first_name,
      p.last_name,
      a.starts_at,
      a.status::text as status,
      a.reason
    from public.video_appointments a
    join public.profiles p on p.id = a.patient_id
    where a.status = 'requested'
       or (
         a.status = 'scheduled'
         and a.starts_at >= date_trunc('day', now())
         and a.starts_at < date_trunc('day', now()) + interval '1 day'
       )
    order by a.starts_at
  `;

  const unread = await sql<
    {
      case_id: string;
      first_name: string | null;
      last_name: string | null;
      last_message: string;
      last_at: Date;
    }[]
  >`
    select
      c.id as case_id,
      p.first_name,
      p.last_name,
      m.body as last_message,
      m.created_at as last_at
    from public.cases c
    join public.profiles p on p.id = c.patient_id
    join lateral (
      select body, sender_role, created_at
      from public.messages
      where case_id = c.id
      order by created_at desc
      limit 1
    ) m on true
    where m.sender_role = 'patient'
      and (c.doctor_last_read_at is null or m.created_at > c.doctor_last_read_at)
      and c.assigned_doctor_id is not null
    order by m.created_at desc
  `;

  const nameOf = (first: string | null, last: string | null) =>
    [first?.trim(), last?.trim()].filter(Boolean).join(" ") || "Patient";

  const items: NowItem[] = [
    ...cases.map((row) => ({
      id: `case-${row.id}`,
      kind: "new_case" as const,
      title: nameOf(row.first_name, row.last_name),
      detail: row.reason || "New intake",
      href: `/doctor/${row.id}`,
      when: new Date(row.submitted_at ?? row.created_at).getTime(),
    })),
    ...visits.map((row) => {
      const requested = row.status === "requested";
      return {
        id: `visit-${row.id}`,
        kind: requested ? ("visit_request" as const) : ("call_today" as const),
        title: nameOf(row.first_name, row.last_name),
        detail: requested
          ? row.reason || "Asked for a video visit"
          : row.reason || "Scheduled video visit today",
        href: requested ? "/doctor/agenda" : `/call/${row.id}`,
        when: new Date(row.starts_at).getTime(),
      };
    }),
    ...unread.map((row) => ({
      id: `msg-${row.case_id}`,
      kind: "unread_message" as const,
      title: nameOf(row.first_name, row.last_name),
      detail: row.last_message,
      href: `/doctor/messages?case=${row.case_id}`,
      when: new Date(row.last_at).getTime(),
    })),
  ];

  const rank: Record<NowKind, number> = {
    call_today: 0,
    visit_request: 1,
    new_case: 2,
    unread_message: 3,
  };

  return items.sort((a, b) => rank[a.kind] - rank[b.kind] || b.when - a.when);
}
