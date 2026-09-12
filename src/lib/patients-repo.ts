import path from "path";
import { sql } from "./db";
import type {
  ComplianceStatus,
  PatientAlert,
  TreatmentPatient,
  TreatmentPatientDetail,
} from "@/app/doctor/patients/types";

const MONTH_MS = 35 * 24 * 60 * 60 * 1000;
const FILL_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

type RosterRow = {
  case_id: string;
  patient_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  postal_code: string | null;
  started_at: Date | null;
  treatment_name: string | null;
  treatment_notes: string | null;
  follow_up_at: string | null;
  e_recete_number: string | null;
  issued_at: Date | null;
  is_simulated: boolean | null;
  filled_reported_at: Date | null;
  fill_note: string | null;
  last_checkin_at: Date | null;
  last_checkin_kind: string | null;
  last_checkin_answers: Record<string, unknown> | null;
  last_checkin_text: string | null;
};

function asBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function derive(row: RosterRow): TreatmentPatient {
  const answers = row.last_checkin_answers ?? {};
  const tookMedsThisMonth = asBool(answers.tookMedsThisMonth);
  const submittedPhotos = asBool(answers.submittedPhotos);
  const daysTaken = asNumber(answers.daysTaken);
  const sideEffects = asText(answers.sideEffects);
  const lastCheckInAt = row.last_checkin_at ? new Date(row.last_checkin_at).getTime() : null;
  const issuedAt = row.issued_at ? new Date(row.issued_at).getTime() : null;
  const filledAt = row.filled_reported_at ? new Date(row.filled_reported_at).getTime() : null;
  const filled = Boolean(filledAt);
  const now = Date.now();
  const checkInFresh = lastCheckInAt !== null && now - lastCheckInAt < MONTH_MS;
  const alerts: PatientAlert[] = [];

  if (issuedAt && !filled && now - issuedAt > FILL_GRACE_MS) {
    alerts.push({
      kind: "not_filled",
      severity: "red",
      label: "Prescription not collected",
      detail: "No eczane collection has been reported more than 7 days after the e-reçete was issued.",
    });
  }

  if (!lastCheckInAt || !checkInFresh) {
    alerts.push({
      kind: "no_checkin",
      severity: lastCheckInAt ? "orange" : "red",
      label: lastCheckInAt ? "Check-in overdue" : "No check-in yet",
      detail: lastCheckInAt
        ? "The last check-in is older than a month."
        : "This patient has not submitted a treatment check-in.",
    });
  }

  if (checkInFresh && tookMedsThisMonth === false) {
    alerts.push({
      kind: "missed_doses",
      severity: "red",
      label: "Not taking medication consistently",
      detail: daysTaken != null
        ? `Reported ${daysTaken} days of use this month.`
        : "The latest check-in says medication was not taken consistently.",
    });
  }

  if (sideEffects) {
    alerts.push({
      kind: "side_effects",
      severity: "red",
      label: "Side effects reported",
      detail: sideEffects,
    });
  }

  if (row.follow_up_at && row.follow_up_at <= new Date().toISOString().slice(0, 10)) {
    alerts.push({
      kind: "follow_up_due",
      severity: "orange",
      label: "Follow-up due",
      detail: `Scheduled review date is ${row.follow_up_at}.`,
    });
  }

  let compliance: ComplianceStatus = "on_track";
  if (alerts.some((a) => a.severity === "red")) compliance = "alert";
  else if (alerts.length > 0 || !filled || tookMedsThisMonth == null) compliance = "watch";

  const firstName = row.first_name?.trim() || "Patient";
  const lastName = row.last_name?.trim() || "";

  return {
    caseId: row.case_id,
    patientId: row.patient_id,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" "),
    email: row.email,
    phone: row.phone,
    city: row.city || "Not provided",
    postalCode: row.postal_code,
    startedAt: row.started_at ? new Date(row.started_at).getTime() : Date.now(),
    treatmentName: row.treatment_name || "Treatment not specified",
    treatmentNotes: row.treatment_notes,
    followUpAt: row.follow_up_at,
    prescriptionNumber: row.e_recete_number,
    prescriptionIssuedAt: issuedAt,
    prescriptionSimulated: Boolean(row.is_simulated),
    filled,
    filledAt,
    fillNote: row.fill_note,
    lastCheckInAt,
    lastCheckInKind: row.last_checkin_kind,
    lastCheckInNote: row.last_checkin_text,
    tookMedsThisMonth: checkInFresh ? tookMedsThisMonth : null,
    submittedPhotos: checkInFresh ? submittedPhotos : null,
    daysTaken: checkInFresh ? daysTaken : null,
    sideEffects,
    compliance,
    alerts,
  };
}

const rosterSelect = sql`
  c.id as case_id,
  c.patient_id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  coalesce(c.il, p.il) as city,
  coalesce(c.postal_code, p.postal_code) as postal_code,
  coalesce(c.reviewed_at, c.submitted_at, c.created_at) as started_at,
  t.name as treatment_name,
  t.notes as treatment_notes,
  t.follow_up_at::text as follow_up_at,
  rx.e_recete_number,
  rx.issued_at,
  rx.is_simulated,
  rx.filled_reported_at,
  rx.fill_note,
  ci.created_at as last_checkin_at,
  ci.kind as last_checkin_kind,
  ci.answers as last_checkin_answers,
  ci.free_text as last_checkin_text
`;

async function loadRosterRows(caseId?: string): Promise<RosterRow[]> {
  if (caseId) {
    return sql<RosterRow[]>`
      select ${rosterSelect}
      from public.cases c
      join public.profiles p on p.id = c.patient_id
      left join public.case_treatments t on t.case_id = c.id
      left join public.prescriptions rx on rx.case_id = c.id
      left join lateral (
        select created_at, kind, answers, free_text
        from public.check_ins
        where case_id = c.id
        order by created_at desc
        limit 1
      ) ci on true
      where c.id = ${caseId}::uuid
        and c.status in ('approved', 'trial_active')
        and c.assigned_doctor_id is not null
    `;
  }

  return sql<RosterRow[]>`
    select ${rosterSelect}
    from public.cases c
    join public.profiles p on p.id = c.patient_id
    left join public.case_treatments t on t.case_id = c.id
    left join public.prescriptions rx on rx.case_id = c.id
    left join lateral (
      select created_at, kind, answers, free_text
      from public.check_ins
      where case_id = c.id
      order by created_at desc
      limit 1
    ) ci on true
    where c.status in ('approved', 'trial_active')
      and c.assigned_doctor_id is not null
    order by
      case
        when rx.filled_reported_at is null and rx.issued_at < now() - interval '7 days' then 0
        when ci.created_at is null then 1
        else 2
      end,
      coalesce(c.reviewed_at, c.created_at) desc
  `;
}

export async function listTreatmentPatients(): Promise<TreatmentPatient[]> {
  const rows = await loadRosterRows();
  return rows.map(derive);
}

export async function getTreatmentPatient(caseId: string): Promise<TreatmentPatientDetail | null> {
  const rows = await loadRosterRows(caseId);
  const row = rows[0];
  if (!row) return null;

  const base = derive(row);

  const answers = await sql<{ question: string; answer: string; follow_up_text: string | null; step_id: string }[]>`
    select question, answer, follow_up_text, step_id
    from public.case_answers
    where case_id = ${caseId}::uuid
    order by created_at
  `;

  const checkIns = await sql<
    { id: string; kind: string; created_at: Date; answers: Record<string, unknown>; free_text: string | null }[]
  >`
    select id, kind, created_at, answers, free_text
    from public.check_ins
    where case_id = ${caseId}::uuid
    order by created_at desc
  `;

  const messages = await sql<{ id: string; sender_role: "patient" | "doctor"; body: string; created_at: Date }[]>`
    select id, sender_role, body, created_at
    from public.messages
    where case_id = ${caseId}::uuid
    order by created_at desc
    limit 20
  `;

  const photos = await sql<{ kind: string; storage_path: string }[]>`
    select kind, storage_path
    from public.case_photos
    where case_id = ${caseId}::uuid
    order by created_at
  `;

  const visits = await sql<{ id: string; starts_at: Date; status: string; reason: string | null; notes: string | null }[]>`
    select id, starts_at, status, reason, notes
    from public.video_appointments
    where case_id = ${caseId}::uuid
    order by starts_at desc
  `;

  const answerByStep = Object.fromEntries(answers.map((a) => [a.step_id, a]));
  const conditions = answerByStep["medical-conditions"];
  const medications = answerByStep.medications;

  return {
    ...base,
    reason: answerByStep["current-situation"]?.answer ?? "Hair loss consultation",
    onset: answerByStep.timeline?.answer ?? "Not provided",
    medicalConditions:
      conditions && conditions.answer !== "No known conditions"
        ? [conditions.follow_up_text || conditions.answer]
        : [],
    currentMedications:
      medications?.answer === "Yes"
        ? [medications.follow_up_text || "Reported — see notes"]
        : [],
    answers: answers.map((a) => ({
      question: a.question,
      answer: a.follow_up_text ? `${a.answer} — ${a.follow_up_text}` : a.answer,
    })),
    checkIns: checkIns.map((item) => ({
      id: item.id,
      kind: item.kind,
      createdAt: new Date(item.created_at).getTime(),
      tookMedsThisMonth: asBool(item.answers?.tookMedsThisMonth),
      submittedPhotos: asBool(item.answers?.submittedPhotos),
      sideEffects: asText(item.answers?.sideEffects),
      note: item.free_text,
    })),
    messages: messages.map((item) => ({
      id: item.id,
      from: item.sender_role,
      body: item.body,
      createdAt: new Date(item.created_at).getTime(),
    })),
    photos: photos.map((item) => ({
      label: item.kind,
      src: `/api/case-photos/${caseId}/${path.basename(item.storage_path)}`,
    })),
    visits: visits.map((item) => ({
      id: item.id,
      startsAt: new Date(item.starts_at).getTime(),
      status: item.status,
      reason: item.reason,
      notes: item.notes,
    })),
  };
}

export async function markPrescriptionFilled(caseId: string, note?: string): Promise<TreatmentPatientDetail | null> {
  await sql`
    update public.prescriptions
    set filled_reported_at = coalesce(filled_reported_at, now()),
        fill_note = coalesce(${note?.trim() || null}, fill_note, 'Doctor recorded eczane collection')
    where case_id = ${caseId}::uuid
  `;
  await sql`
    insert into public.case_flow_events (case_id, step, simulated, metadata)
    values (
      ${caseId}::uuid,
      'prescription_fill_reported',
      true,
      ${sql.json({ source: "doctor_portal" })}
    )
  `;
  return getTreatmentPatient(caseId);
}

export async function adjustTreatment(
  caseId: string,
  name: string,
  notes?: string,
): Promise<TreatmentPatientDetail | null> {
  await sql`
    insert into public.case_treatments (case_id, name, notes)
    values (${caseId}::uuid, ${name.trim()}, ${notes?.trim() || null})
    on conflict (case_id) do update set
      name = excluded.name,
      notes = coalesce(excluded.notes, public.case_treatments.notes)
  `;
  return getTreatmentPatient(caseId);
}

export async function scheduleFollowUp(
  caseId: string,
  followUpAt: string,
): Promise<TreatmentPatientDetail | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(followUpAt)) {
    throw new Error("Follow-up date must be YYYY-MM-DD");
  }
  await sql`
    insert into public.case_treatments (case_id, name, follow_up_at)
    values (${caseId}::uuid, 'Treatment plan pending', ${followUpAt}::date)
    on conflict (case_id) do update set follow_up_at = excluded.follow_up_at
  `;
  return getTreatmentPatient(caseId);
}

export async function messagePatient(caseId: string, body: string): Promise<TreatmentPatientDetail | null> {
  const text = body.trim();
  if (!text) throw new Error("Message is empty");

  const [doctor] = await sql<{ profile_id: string }[]>`
    select d.profile_id
    from public.cases c
    join public.doctors d on d.id = c.assigned_doctor_id
    where c.id = ${caseId}::uuid
  `;
  if (!doctor) throw new Error("No assigned doctor");

  await sql`
    insert into public.messages (case_id, sender_role, sender_profile_id, body)
    values (${caseId}::uuid, 'doctor', ${doctor.profile_id}::uuid, ${text})
  `;
  return getTreatmentPatient(caseId);
}

export type ConversationSummary = {
  caseId: string;
  patientName: string;
  city: string;
  treatmentName: string;
  lastMessage: string;
  lastFrom: "patient" | "doctor";
  lastAt: number;
};

export type ConversationThread = {
  caseId: string;
  patientName: string;
  city: string;
  treatmentName: string;
  messages: {
    id: string;
    from: "patient" | "doctor";
    body: string;
    createdAt: number;
  }[];
};

export async function listConversations(): Promise<ConversationSummary[]> {
  const rows = await sql<
    {
      case_id: string;
      first_name: string | null;
      last_name: string | null;
      city: string | null;
      treatment_name: string | null;
      last_message: string;
      last_from: "patient" | "doctor";
      last_at: Date;
    }[]
  >`
    select
      c.id as case_id,
      p.first_name,
      p.last_name,
      coalesce(c.il, p.il) as city,
      t.name as treatment_name,
      m.body as last_message,
      m.sender_role as last_from,
      m.created_at as last_at
    from public.cases c
    join public.profiles p on p.id = c.patient_id
    left join public.case_treatments t on t.case_id = c.id
    join lateral (
      select body, sender_role, created_at
      from public.messages
      where case_id = c.id
      order by created_at desc
      limit 1
    ) m on true
    where c.status in ('approved', 'trial_active')
      and c.assigned_doctor_id is not null
    order by m.created_at desc
  `;

  return rows.map((row) => ({
    caseId: row.case_id,
    patientName: [row.first_name, row.last_name].filter(Boolean).join(" ") || "Patient",
    city: row.city ?? "",
    treatmentName: row.treatment_name ?? "Treatment",
    lastMessage: row.last_message,
    lastFrom: row.last_from,
    lastAt: new Date(row.last_at).getTime(),
  }));
}

export async function getConversation(caseId: string): Promise<ConversationThread | null> {
  const [row] = await sql<
    {
      case_id: string;
      first_name: string | null;
      last_name: string | null;
      city: string | null;
      treatment_name: string | null;
    }[]
  >`
    select
      c.id as case_id,
      p.first_name,
      p.last_name,
      coalesce(c.il, p.il) as city,
      t.name as treatment_name
    from public.cases c
    join public.profiles p on p.id = c.patient_id
    left join public.case_treatments t on t.case_id = c.id
    where c.id = ${caseId}::uuid
      and c.status in ('approved', 'trial_active')
      and c.assigned_doctor_id is not null
  `;
  if (!row) return null;

  const messages = await sql<{ id: string; sender_role: "patient" | "doctor"; body: string; created_at: Date }[]>`
    select id, sender_role, body, created_at
    from public.messages
    where case_id = ${caseId}::uuid
    order by created_at
  `;

  return {
    caseId: row.case_id,
    patientName: [row.first_name, row.last_name].filter(Boolean).join(" ") || "Patient",
    city: row.city ?? "",
    treatmentName: row.treatment_name ?? "Treatment",
    messages: messages.map((item) => ({
      id: item.id,
      from: item.sender_role,
      body: item.body,
      createdAt: new Date(item.created_at).getTime(),
    })),
  };
}

export function followUpDateFromLabel(label: string): string | null {
  const days = label === "1 month" ? 30 : label === "3 months" ? 90 : label === "6 months" ? 180 : 0;
  if (!days) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
