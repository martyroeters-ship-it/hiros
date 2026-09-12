import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { buildCaseFromIntake, evaluateIntake, QUESTION_LABELS, type IntakeSubmission } from "@/app/doctor/triage";
import type { PatientCase, TabKey } from "@/app/doctor/data";
import { PRE_MEDICAL_STEP_IDS } from "@/types/database";
import { followUpDateFromLabel } from "./patients-repo";
import { sql } from "./db";

const PHOTO_ROOT = path.join(process.cwd(), "data", "case-photos");
const PRE_MEDICAL = new Set<string>(PRE_MEDICAL_STEP_IDS);

export type IntakePersistInput = IntakeSubmission & {
  lastName?: string;
  postalCode?: string;
  phone?: string;
  province?: string;
};

type CaseRow = {
  id: string;
  patient_id: string;
  status: string;
  is_trial: boolean;
  postal_code: string | null;
  il: string | null;
  risk: PatientCase["risk"] | null;
  aga_score: number | null;
  confidence: PatientCase["confidence"] | null;
  priority: PatientCase["priority"] | null;
  findings: PatientCase["findings"];
  triage_note: string | null;
  submitted_at: Date | null;
  created_at: Date;
  first_name: string | null;
};

function tabFromStatus(status: string): TabKey {
  if (status === "approved" || status === "trial_active") return "approved";
  if (status === "declined") return "declined";
  return "pending";
}

function statusLabel(status: string): string {
  if (status === "approved" || status === "trial_active") return "Approved";
  if (status === "declined") return "Declined";
  if (status === "needs_in_person") return "Needs in person";
  return "Submitted";
}

function parseDataUrl(dataUrl: string): { ext: string; bytes: Buffer } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Photo is not a data URL");
  }
  const mime = match[1];
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  return { ext, bytes: Buffer.from(match[2], "base64") };
}

async function loadPatientCase(caseId: string): Promise<PatientCase | null> {
  const rows = await sql<CaseRow[]>`
    select
      c.id,
      c.patient_id,
      c.status,
      c.is_trial,
      c.postal_code,
      c.il,
      c.risk,
      c.aga_score,
      c.confidence,
      c.priority,
      c.findings,
      c.triage_note,
      c.submitted_at,
      c.created_at,
      p.first_name
    from public.cases c
    join public.profiles p on p.id = c.patient_id
    where c.id = ${caseId}::uuid
  `;
  const row = rows[0];
  if (!row) return null;

  const answers = await sql<
    { step_id: string; question: string; answer: string; follow_up_text: string | null; flag: "orange" | "red" | null; flag_note: string | null }[]
  >`
    select step_id, question, answer, follow_up_text, flag, flag_note
    from public.case_answers
    where case_id = ${caseId}::uuid
    order by created_at
  `;

  const treatments = await sql<{ category: string; detail: string | null }[]>`
    select category, detail from public.case_previous_treatments where case_id = ${caseId}::uuid
  `;

  const photos = await sql<{ id: string; kind: string; storage_path: string }[]>`
    select id, kind, storage_path from public.case_photos where case_id = ${caseId}::uuid order by created_at
  `;

  const answerByStep = Object.fromEntries(answers.map((a) => [a.step_id, a.answer]));
  const submitted = row.submitted_at ?? row.created_at;

  return {
    id: row.id,
    firstName: row.first_name?.trim() || "Patient",
    risk: row.risk ?? "Green",
    agaScore: row.aga_score ?? 0,
    confidence: row.confidence ?? "Low",
    status: statusLabel(row.status),
    submittedAt: new Date(submitted).getTime(),
    ageRange: "Not provided",
    reason: answerByStep["current-situation"] ?? "Hair loss consultation",
    location: row.il ?? "Not provided",
    reportedOnset: answerByStep.timeline ?? "Not provided",
    date: new Date(submitted).toLocaleDateString("en-US"),
    priority: row.priority ?? "Low",
    tab: tabFromStatus(row.status),
    medicalConditions:
      answerByStep["medical-conditions"] && answerByStep["medical-conditions"] !== "No known conditions"
        ? [answers.find((a) => a.step_id === "medical-conditions")?.follow_up_text || answerByStep["medical-conditions"]]
        : undefined,
    currentMedications:
      answerByStep.medications === "Yes"
        ? [answers.find((a) => a.step_id === "medications")?.follow_up_text || "Reported — see notes"]
        : undefined,
    previousTreatments: treatments.length
      ? treatments.map((t) => ({ category: t.category, detail: t.detail ?? undefined }))
      : undefined,
    answers: answers.map((a) => ({
      question: a.question,
      answer: a.follow_up_text ? `${a.answer} — ${a.follow_up_text}` : a.answer,
      flag: a.flag ?? undefined,
      flagNote: a.flag_note ?? undefined,
    })),
    findings: Array.isArray(row.findings) ? row.findings : [],
    triageNote: row.triage_note ?? undefined,
    photos: photos.map((p) => ({
      label: p.kind,
      src: `/api/case-photos/${row.id}/${path.basename(p.storage_path)}`,
    })),
  };
}

export async function listCases(): Promise<PatientCase[]> {
  const ids = await sql<{ id: string }[]>`
    select id from public.cases order by coalesce(submitted_at, created_at) desc
  `;
  const cases = await Promise.all(ids.map((row) => loadPatientCase(row.id)));
  return cases.filter((c): c is PatientCase => c !== null);
}

export async function getCase(id: string): Promise<PatientCase | null> {
  return loadPatientCase(id);
}

export async function persistIntake(input: IntakePersistInput, patientId?: string | null): Promise<PatientCase> {
  const built = buildCaseFromIntake(input);
  const triage = evaluateIntake(input);
  const signedInId = patientId?.trim() || null;
  const newPatientId = signedInId ?? randomUUID();
  const postal =
    input.postalCode && /^[0-9]{5}$/.test(input.postalCode.trim())
      ? input.postalCode.trim()
      : null;

  const caseId = await sql.begin(async (tx) => {
    if (signedInId) {
      await tx`
        update public.profiles
        set
          first_name = coalesce(nullif(${input.firstName.trim()}, ''), first_name, 'Patient'),
          last_name = coalesce(nullif(${input.lastName?.trim() || ""}, ''), last_name),
          phone = coalesce(nullif(${input.phone?.trim() || ""}, ''), phone),
          postal_code = coalesce(${postal}, postal_code),
          il = coalesce(${input.city}, il)
        where id = ${signedInId}::uuid
      `;
    } else {
      await tx`
        insert into public.profiles (
          id, role, email, first_name, last_name, phone, locale, postal_code, il
        ) values (
          ${newPatientId}::uuid,
          'patient',
          ${`demo+${newPatientId.slice(0, 8)}@hiros.local`},
          ${input.firstName.trim() || "Patient"},
          ${input.lastName?.trim() || null},
          ${input.phone?.trim() || null},
          'tr',
          ${postal},
          ${input.city}
        )
      `;
    }

    await tx`
      insert into public.consents (patient_id, kind, version)
      select ${newPatientId}::uuid, kind, 'trial-v1'
      from (values ('kvkk'::public.consent_kind), ('prototype_trial'::public.consent_kind)) as k(kind)
      where not exists (
        select 1 from public.consents c
        where c.patient_id = ${newPatientId}::uuid and c.kind = k.kind
      )
    `;

    await tx`
      insert into public.intake_drafts (
        patient_id, answers, follow_up_text, treatment_selections, treatment_other_detail, side_effects_level, city
      ) values (
        ${newPatientId}::uuid,
        ${tx.json(input.answers)},
        ${tx.json(input.followUpText)},
        ${tx.json(input.treatmentSelections)},
        ${input.treatmentOtherDetail || null},
        ${input.sideEffectsLevel},
        ${input.city}
      )
      on conflict (patient_id) do update set
        answers = excluded.answers,
        follow_up_text = excluded.follow_up_text,
        treatment_selections = excluded.treatment_selections,
        treatment_other_detail = excluded.treatment_other_detail,
        side_effects_level = excluded.side_effects_level,
        city = excluded.city
    `;

    await tx`select set_config('app.user_id', ${newPatientId}, true)`;
    const [existing] = await tx<{ id: string }[]>`
      select id from public.cases where patient_id = ${newPatientId}::uuid order by created_at desc limit 1
    `;
    const enrolled = existing
      ? [existing]
      : await tx<{ id: string }[]>`select enroll_trial_patient() as id`;
    const id = enrolled[0]?.id;
    if (!id) throw new Error("Could not enroll trial patient. Is the demo doctor seeded?");

    await tx`select accept_named_physician_consent(${id}::uuid, 'trial-v1')`;

    for (const [stepId, answer] of Object.entries(input.answers)) {
      const question = QUESTION_LABELS[stepId] ?? stepId;
      const flagged = triage.answers.find((a) => a.question === question);
      await tx`
        insert into public.case_answers (case_id, step_id, phase, question, answer, follow_up_text, flag, flag_note)
        values (
          ${id}::uuid,
          ${stepId},
          ${PRE_MEDICAL.has(stepId) ? "pre_medical" : "clinical"},
          ${question},
          ${answer},
          ${input.followUpText[stepId] || null},
          ${flagged?.flag ?? null},
          ${flagged?.flagNote ?? null}
        )
        on conflict (case_id, step_id) do update set
          answer = excluded.answer,
          follow_up_text = excluded.follow_up_text,
          flag = excluded.flag,
          flag_note = excluded.flag_note,
          phase = excluded.phase,
          question = excluded.question
      `;
    }

    await tx`
      update public.cases
      set
        risk = ${built.risk},
        aga_score = ${built.agaScore},
        confidence = ${built.confidence},
        priority = ${built.priority},
        findings = ${tx.json(built.findings)},
        il = ${input.city},
        postal_code = coalesce(${postal}, postal_code)
      where id = ${id}::uuid
    `;

    await tx`select submit_trial_case(${id}::uuid)`;
    return id;
  });

  if (input.photos.length) {
    const dir = path.join(PHOTO_ROOT, caseId);
    await mkdir(dir, { recursive: true });
    const kinds = ["front", "top", "other"] as const;
    for (const [index, dataUrl] of input.photos.entries()) {
      if (!dataUrl.startsWith("data:")) continue;
      const { ext, bytes } = parseDataUrl(dataUrl);
      const filename = `${String(index + 1).padStart(2, "0")}.${ext}`;
      const storagePath = path.join(dir, filename);
      await writeFile(storagePath, bytes);
      await sql`
        insert into public.case_photos (case_id, kind, storage_path, content_type, byte_size)
        values (
          ${caseId}::uuid,
          ${kinds[index] ?? "other"},
          ${storagePath},
          ${ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"},
          ${bytes.length}
        )
      `;
    }
  }

  const saved = await loadPatientCase(caseId);
  if (!saved) throw new Error("Case was created but could not be loaded");
  return saved;
}

export async function updateCaseTab(
  id: string,
  tab: TabKey,
  extras?: { treatmentType?: string; followUp?: string; note?: string },
): Promise<PatientCase | null> {
  const status = tab === "approved" ? "approved" : tab === "declined" ? "declined" : "pending_review";
  await sql`
    update public.cases
    set status = ${status}::public.case_status, reviewed_at = now()
    where id = ${id}::uuid
  `;

  if (tab === "approved") {
    const treatmentName = extras?.treatmentType?.trim() || "Treatment plan pending";
    const followUp = extras?.followUp ? followUpDateFromLabel(extras.followUp) : null;
    await sql`
      insert into public.case_treatments (case_id, name, follow_up_at, notes)
      values (${id}::uuid, ${treatmentName}, ${followUp}::date, ${extras?.note?.trim() || null})
      on conflict (case_id) do update set
        name = excluded.name,
        follow_up_at = coalesce(excluded.follow_up_at, public.case_treatments.follow_up_at),
        notes = coalesce(excluded.notes, public.case_treatments.notes)
    `;

    const [caseRow] = await sql<{ assigned_doctor_id: string | null }[]>`
      select assigned_doctor_id from public.cases where id = ${id}::uuid
    `;
    if (caseRow?.assigned_doctor_id) {
      await sql`
        insert into public.prescriptions (case_id, doctor_id, e_recete_number, is_simulated)
        values (
          ${id}::uuid,
          ${caseRow.assigned_doctor_id}::uuid,
          ${`DEMO-${id.replace(/-/g, "").slice(0, 10).toUpperCase()}`},
          true
        )
        on conflict (case_id) do nothing
      `;
      await sql`
        update public.cases
        set status = 'trial_active'
        where id = ${id}::uuid
      `;
    }
  }

  return loadPatientCase(id);
}

export function photoFilePath(caseId: string, filename: string): string {
  const safe = path.basename(filename);
  return path.join(PHOTO_ROOT, caseId, safe);
}
