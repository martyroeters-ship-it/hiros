import { sql } from "./db";
import type {
  AppointmentActor,
  CreateAppointmentInput,
  VideoAppointment,
} from "@/app/doctor/agenda/types";

type AppointmentRow = {
  id: string;
  case_id: string;
  patient_id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  doctor_name: string;
  starts_at: Date;
  duration_minutes: number;
  status: VideoAppointment["status"];
  requested_by: AppointmentActor;
  reason: string | null;
  notes: string | null;
};

function mapRow(row: AppointmentRow): VideoAppointment {
  return {
    id: row.id,
    caseId: row.case_id,
    patientId: row.patient_id,
    patientName: [row.first_name?.trim() || "Patient", row.last_name?.trim() || ""].filter(Boolean).join(" "),
    doctorName: row.doctor_name,
    city: row.city || "Not provided",
    startsAt: new Date(row.starts_at).getTime(),
    durationMinutes: row.duration_minutes,
    status: row.status,
    requestedBy: row.requested_by,
    reason: row.reason,
    notes: row.notes,
  };
}

const selectSql = sql`
  a.id,
  a.case_id,
  a.patient_id,
  p.first_name,
  p.last_name,
  coalesce(c.il, p.il) as city,
  d.full_name as doctor_name,
  a.starts_at,
  a.duration_minutes,
  a.status,
  a.requested_by,
  a.reason,
  a.notes
`;

export async function listAppointments(caseId?: string): Promise<VideoAppointment[]> {
  const rows = caseId
    ? await sql<AppointmentRow[]>`
        select ${selectSql}
        from public.video_appointments a
        join public.cases c on c.id = a.case_id
        join public.profiles p on p.id = a.patient_id
        join public.doctors d on d.id = a.doctor_id
        where a.case_id = ${caseId}::uuid
        order by a.starts_at
      `
    : await sql<AppointmentRow[]>`
        select ${selectSql}
        from public.video_appointments a
        join public.cases c on c.id = a.case_id
        join public.profiles p on p.id = a.patient_id
        join public.doctors d on d.id = a.doctor_id
        where a.doctor_id is not null
        order by a.starts_at
      `;
  return rows.map(mapRow);
}

export async function getAppointment(id: string): Promise<VideoAppointment | null> {
  const rows = await sql<AppointmentRow[]>`
    select ${selectSql}
    from public.video_appointments a
    join public.cases c on c.id = a.case_id
    join public.profiles p on p.id = a.patient_id
    join public.doctors d on d.id = a.doctor_id
    where a.id = ${id}::uuid
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<VideoAppointment> {
  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("Start time is invalid");
  }
  const duration = input.durationMinutes && [15, 20, 30].includes(input.durationMinutes)
    ? input.durationMinutes
    : 20;
  const requestedBy = input.requestedBy === "doctor" ? "doctor" : "patient";
  const status = requestedBy === "doctor" ? "scheduled" : "requested";

  const [caseRow] = await sql<{ patient_id: string; assigned_doctor_id: string | null; status: string }[]>`
    select patient_id, assigned_doctor_id, status
    from public.cases
    where id = ${input.caseId}::uuid
  `;
  if (!caseRow?.assigned_doctor_id) {
    throw new Error("Case is not assigned to a physician");
  }
  if (!["approved", "trial_active"].includes(caseRow.status)) {
    throw new Error("Video visits are only for patients in treatment");
  }

  const [created] = await sql<{ id: string }[]>`
    insert into public.video_appointments (
      case_id, patient_id, doctor_id, starts_at, duration_minutes,
      status, requested_by, reason
    )
    values (
      ${input.caseId}::uuid,
      ${caseRow.patient_id}::uuid,
      ${caseRow.assigned_doctor_id}::uuid,
      ${startsAt.toISOString()}::timestamptz,
      ${duration},
      ${status}::public.appointment_status,
      ${requestedBy}::public.appointment_actor,
      ${input.reason?.trim() || null}
    )
    returning id
  `;

  await sql`
    insert into public.case_flow_events (case_id, step, simulated, metadata)
    values (
      ${input.caseId}::uuid,
      ${requestedBy === "doctor" ? "video_invite" : "video_request"},
      true,
      ${sql.json({ appointment_id: created.id, status })}
    )
  `;

  const saved = await getAppointment(created.id);
  if (!saved) throw new Error("Appointment was created but could not be loaded");
  return saved;
}

export async function updateAppointment(
  id: string,
  action: "confirm" | "cancel" | "complete" | "note",
  notes?: string,
): Promise<VideoAppointment | null> {
  const existing = await getAppointment(id);
  if (!existing) return null;

  if (action === "note") {
    await sql`
      update public.video_appointments
      set notes = ${notes?.trim() || null}
      where id = ${id}::uuid
    `;
    return getAppointment(id);
  }

  if (action === "confirm") {
    if (existing.status !== "requested") {
      throw new Error("Only a requested visit can be confirmed");
    }
    await sql`
      update public.video_appointments
      set status = 'scheduled', notes = coalesce(${notes?.trim() || null}, notes)
      where id = ${id}::uuid
    `;
  } else if (action === "cancel") {
    if (existing.status === "completed" || existing.status === "cancelled") {
      throw new Error("This visit cannot be cancelled");
    }
    await sql`
      update public.video_appointments
      set status = 'cancelled',
          cancelled_at = now(),
          notes = coalesce(${notes?.trim() || null}, notes)
      where id = ${id}::uuid
    `;
  } else {
    if (existing.status !== "scheduled") {
      throw new Error("Only a scheduled visit can be marked complete");
    }
    await sql`
      update public.video_appointments
      set status = 'completed', notes = coalesce(${notes?.trim() || null}, notes)
      where id = ${id}::uuid
    `;
  }

  return getAppointment(id);
}
