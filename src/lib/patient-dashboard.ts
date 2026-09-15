import { getSessionUser } from "./auth";
import { sql } from "./db";
import { ready } from "./ensure-db";
import path from "node:path";
import type {
  DashboardMessage,
  DashboardNotification,
  DashboardPhoto,
  DashboardPhysicianNote,
  DashboardTimelineEvent,
  DashboardTrackerStep,
  PatientDashboardSnapshot,
} from "./patient-dashboard-types";

export type {
  DashboardMessage,
  DashboardNotification,
  DashboardNotificationIcon,
  DashboardPhoto,
  DashboardPhysicianNote,
  DashboardTimelineEvent,
  DashboardTrackerStep,
  PatientDashboardSnapshot,
  TrackerStepStatus,
} from "./patient-dashboard-types";

const ACTION_BADGE = "bg-[#f3ddd0] text-[#a85f3f]";
const NEW_BADGE = "bg-[#dce8d6] text-[#3d5c35]";

function formatShortDate(value: Date | string | number): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatWhen(value: Date | string | number): string {
  const date = new Date(value);
  const time = date.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  return `${formatShortDate(date)}, ${time}`;
}

function doctorFirst(name: string | null): string {
  if (!name) return "your physician";
  return name.replace(/^Dr\.?\s+/i, "").split(" ")[0] || name;
}

function truncate(text: string, max = 88): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function formatLongDate(value: Date | string | number): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function photoKindLabel(kind: string): string {
  if (kind === "front") return "Front";
  if (kind === "top") return "Crown";
  if (kind === "left") return "Left";
  if (kind === "right") return "Right";
  return "Photo";
}

function extras(): Pick<
  PatientDashboardSnapshot,
  | "doctorLicense"
  | "treatmentNotes"
  | "treatmentApproved"
  | "physicianSince"
  | "lastReviewAt"
  | "isPremium"
  | "unreadMessageCount"
  | "photos"
  | "messages"
  | "physicianNotes"
  | "timeline"
  | "currentMedications"
> {
  return {
    doctorLicense: null,
    treatmentNotes: null,
    treatmentApproved: false,
    physicianSince: null,
    lastReviewAt: null,
    isPremium: false,
    unreadMessageCount: 0,
    photos: [],
    messages: [],
    physicianNotes: [],
    timeline: [],
    currentMedications: [],
  };
}

function emptySnapshot(signedIn: boolean): PatientDashboardSnapshot {
  return {
    signedIn,
    greetingSubtitle: signedIn
      ? "Complete your intake so a physician can review your case."
      : "Sign in to see your care plan.",
    caseId: null,
    statusTitle: "Start your intake",
    statusDetail: "Answer a few questions. A licensed physician will review your case and share the next step.",
    statusCta: { label: signedIn ? "Start intake" : "Sign in", href: signedIn ? "/intake" : "/" },
    stepCurrent: 1,
    stepTotal: 5,
    tracker: [
      { label: "Requested", status: "active" },
      { label: "Approved", status: "pending" },
      { label: "Preparing", status: "pending" },
      { label: "Shipped", status: "pending", icon: "truck" },
      { label: "Delivered", status: "pending", icon: "house" },
    ],
    estimatedDelivery: "After intake",
    doctorName: null,
    doctorSpecialty: null,
    doctorLabel: "Your physician",
    treatmentName: null,
    treatmentStart: null,
    treatmentFollowUp: null,
    ...extras(),
    nextUp: signedIn
      ? {
          title: "Complete your intake",
          detail: "A few questions help your physician understand what you are noticing.",
          cta: "Get started",
          href: "/intake",
        }
      : {
          title: "Sign in to continue",
          detail: "Use the account you created during intake.",
          cta: "Sign in",
          href: "/",
        },
    notifications: signedIn
      ? [
          {
            id: "start-intake",
            title: "Intake not started",
            detail: "Complete the form so a physician can review your case.",
            time: "Now",
            badge: "ACTION REQUIRED",
            badgeClass: ACTION_BADGE,
            icon: "clock",
            href: "/intake",
          },
        ]
      : [],
  };
}

export async function getPatientDashboardSnapshot(): Promise<PatientDashboardSnapshot> {
  await ready();
  const user = await getSessionUser();
  if (!user) return emptySnapshot(false);

  const [row] = await sql<
    {
      id: string;
      status: string;
      submitted_at: Date | null;
      created_at: Date;
      reviewed_at: Date | null;
      doctor_name: string | null;
      doctor_specialty: string | null;
      doctor_license: string | null;
      treatment_name: string | null;
      treatment_notes: string | null;
      follow_up_at: string | null;
      treatment_started_at: Date | null;
      filled_reported_at: Date | null;
      triage_note: string | null;
      photo_count: number;
      submitted_photos: boolean | null;
    }[]
  >`
    select
      c.id,
      c.status,
      c.submitted_at,
      c.created_at,
      c.reviewed_at,
      c.triage_note,
      d.full_name as doctor_name,
      d.specialty as doctor_specialty,
      d.license_number as doctor_license,
      t.name as treatment_name,
      t.notes as treatment_notes,
      t.follow_up_at::text as follow_up_at,
      t.created_at as treatment_started_at,
      rx.filled_reported_at,
      (
        select count(*)::int
        from public.case_photos p
        where p.case_id = c.id
      ) as photo_count,
      (ci.answers ->> 'submittedPhotos')::boolean as submitted_photos
    from public.cases c
    left join public.doctors d on d.id = c.assigned_doctor_id
    left join public.case_treatments t on t.case_id = c.id
    left join public.prescriptions rx on rx.case_id = c.id
    left join lateral (
      select answers
      from public.check_ins
      where case_id = c.id
      order by created_at desc
      limit 1
    ) ci on true
    where c.patient_id = ${user.id}::uuid
    order by coalesce(c.submitted_at, c.created_at) desc
    limit 1
  `;

  if (!row) return emptySnapshot(true);

  const messageRows = await sql<{ id: string; sender_role: "patient" | "doctor"; body: string; created_at: Date }[]>`
    select id, sender_role, body, created_at
    from public.messages
    where case_id = ${row.id}::uuid
    order by created_at
  `;
  const message = messageRows[messageRows.length - 1];

  const photoRows = await sql<{ id: string; kind: string; storage_path: string; created_at: Date }[]>`
    select id, kind, storage_path, created_at
    from public.case_photos
    where case_id = ${row.id}::uuid
    order by created_at
  `;

  const [medRow] = await sql<{ answer: string; follow_up_text: string | null }[]>`
    select answer, follow_up_text
    from public.case_answers
    where case_id = ${row.id}::uuid and step_id = 'medications'
    limit 1
  `;

  const visitNotes = await sql<{ id: string; notes: string | null; starts_at: Date }[]>`
    select id, notes, starts_at
    from public.video_appointments
    where case_id = ${row.id}::uuid
      and notes is not null
      and btrim(notes) <> ''
    order by starts_at desc
  `;

  const [visit] = await sql<{ status: string; starts_at: Date; reason: string | null }[]>`
    select status, starts_at, reason
    from public.video_appointments
    where case_id = ${row.id}::uuid
      and status in ('requested', 'scheduled')
    order by starts_at desc
    limit 1
  `;

  const submitted = row.submitted_at ?? row.created_at;
  const doctorName = row.doctor_name?.trim() || null;
  const doctor = doctorName ?? "Your physician";
  const isIntake = row.status === "trial_onboarding" || row.status === "awaiting_consent" || row.status === "clinical_intake";
  const isReview = row.status === "pending_review";
  const isApproved = row.status === "approved" || row.status === "trial_active";
  const isDeclined = row.status === "declined" || row.status === "cancelled";
  const isInPerson = row.status === "needs_in_person";
  const filled = Boolean(row.filled_reported_at);
  const hasPhotos = row.photo_count > 0 || row.submitted_photos === true;
  const treatmentName =
    row.treatment_name && row.treatment_name !== "Treatment plan pending" ? row.treatment_name : isApproved ? "Treatment plan" : null;

  const tracker: DashboardTrackerStep[] = [
    { label: "Requested", status: "complete", date: formatShortDate(submitted) },
    {
      label: "Approved",
      status: isApproved ? "complete" : "pending",
      date: isApproved && row.reviewed_at ? formatShortDate(row.reviewed_at) : undefined,
    },
    {
      label: "Preparing",
      status: filled ? "complete" : isApproved ? "active" : "pending",
    },
    { label: "Shipped", status: filled ? "complete" : "pending", icon: "truck" },
    {
      label: "Delivered",
      status: filled ? "complete" : "pending",
      icon: "house",
      date: filled && row.filled_reported_at ? formatShortDate(row.filled_reported_at) : undefined,
    },
  ];
  const activeIndex = tracker.findIndex((step) => step.status === "active");
  const completeCount = tracker.filter((step) => step.status === "complete").length;
  const stepCurrent = activeIndex >= 0 ? activeIndex + 1 : Math.max(1, completeCount);

  let statusTitle = "Intake in progress";
  let statusDetail = "Finish the remaining questions so a physician can review your case.";
  let greetingSubtitle = "A few more answers and your physician can review.";
  let statusCta = { label: "Continue intake", href: "/intake" };
  let estimatedDelivery = "After approval";
  let nextUp = {
    title: "Finish your intake",
    detail: "Your physician needs the completed form before they can review.",
    cta: "Continue",
    href: "/intake",
  };

  if (isReview) {
    statusTitle = "Physician reviewing your case";
    statusDetail = `${doctor} is reviewing the answers you submitted.`;
    greetingSubtitle = "Your intake is with your physician. We’ll update you here.";
    statusCta = { label: "View physician", href: "/dashboard/doctor" };
    estimatedDelivery = "After approval";
    nextUp = hasPhotos
      ? {
          title: "Wait for physician review",
          detail: "You’ll be notified here as soon as there’s a decision.",
          cta: "View physician",
          href: "/dashboard/doctor",
        }
      : {
          title: "Add photos for your physician",
          detail: "Photos help your physician understand what you are noticing.",
          cta: "Upload photos",
          href: "/dashboard/photos",
        };
  } else if (isInPerson) {
    statusTitle = "In-person visit recommended";
    statusDetail = `${doctor} has asked to see you in person before treatment can continue online.`;
    greetingSubtitle = "Your physician has shared a next step.";
    statusCta = { label: "View physician", href: "/dashboard/doctor" };
    estimatedDelivery = "Not applicable";
    nextUp = {
      title: "Follow up with your physician",
      detail: "An in-person visit was recommended after your intake.",
      cta: "View physician",
      href: "/dashboard/doctor",
    };
  } else if (isDeclined) {
    statusTitle = "Online treatment not recommended";
    statusDetail = `${doctor} reviewed your intake and recommended a different next step.`;
    greetingSubtitle = "Your physician has shared a next step.";
    statusCta = { label: "View physician", href: "/dashboard/doctor" };
    estimatedDelivery = "Not applicable";
    nextUp = {
      title: "Talk with your physician",
      detail: "Ask any questions about the review and what to do next.",
      cta: "Open messages",
      href: "/dashboard/messages",
    };
  } else if (isApproved && filled) {
    statusTitle = "Treatment underway";
    statusDetail = "Your prescription has been collected. Stay consistent and keep your physician updated.";
    greetingSubtitle = "Everything is on track. We’ll keep you updated.";
    statusCta = { label: "View treatment", href: "/dashboard/treatment" };
    estimatedDelivery = row.filled_reported_at ? formatShortDate(row.filled_reported_at) : "Collected";
    nextUp = {
      title: "Log today’s check-in",
      detail: "Small updates help your physician follow how treatment is going.",
      cta: "Open progress",
      href: "/dashboard/progress",
    };
  } else if (isApproved) {
    statusTitle = "Preparing your treatment";
    statusDetail = "Your plan is approved. The prescription is being prepared.";
    greetingSubtitle = "Everything is on track. We’ll keep you updated.";
    statusCta = { label: "View treatment", href: "/dashboard/treatment" };
    estimatedDelivery = "Being prepared";
    nextUp = hasPhotos
      ? {
          title: "Your treatment is being prepared",
          detail: "We’ll update this status when it’s ready for collection.",
          cta: "View treatment",
          href: "/dashboard/treatment",
        }
      : {
          title: "Take your baseline photos",
          detail: "Help your physician track your progress from the start.",
          cta: "Get started",
          href: "/dashboard/photos",
        };
  } else if (isIntake) {
    statusTitle = "Finish your intake";
    statusDetail = "Your answers are saved. Complete the remaining steps so a physician can review.";
  }

  const notifications: DashboardNotification[] = [];

  if (message?.sender_role === "doctor") {
    notifications.push({
      id: "message",
      title: `Message from ${doctorFirst(doctorName)}`,
      detail: truncate(message.body),
      time: formatWhen(message.created_at),
      badge: "NEW",
      badgeClass: NEW_BADGE,
      icon: "message",
      href: "/dashboard/messages",
    });
  }

  if (isApproved && row.reviewed_at) {
    notifications.push({
      id: "approved",
      title: "Treatment approved",
      detail: `${doctor} has approved your plan`,
      time: formatWhen(row.reviewed_at),
      badge: "NEW",
      badgeClass: NEW_BADGE,
      icon: "check",
    });
  } else if (isReview) {
    notifications.push({
      id: "review",
      title: "Intake received",
      detail: `${doctor} is reviewing the answers you submitted`,
      time: formatWhen(submitted),
      badge: "NEW",
      badgeClass: NEW_BADGE,
      icon: "clock",
    });
  } else if (isDeclined && row.reviewed_at) {
    notifications.push({
      id: "declined",
      title: "Review complete",
      detail: `${doctor} has shared a next step`,
      time: formatWhen(row.reviewed_at),
      icon: "clock",
    });
  } else if (isIntake) {
    notifications.push({
      id: "intake",
      title: "Finish your intake",
      detail: "Complete the remaining questions so a physician can review your case.",
      time: formatWhen(submitted),
      badge: "ACTION REQUIRED",
      badgeClass: ACTION_BADGE,
      icon: "clock",
      href: "/intake",
    });
  }

  if (!hasPhotos && (isReview || isApproved)) {
    notifications.push({
      id: "photos",
      title: "Photos needed",
      detail: "Upload photos so your physician can follow your progress",
      time: formatWhen(submitted),
      badge: "ACTION REQUIRED",
      badgeClass: ACTION_BADGE,
      icon: "camera",
      href: "/dashboard/photos",
    });
  }

  if (visit) {
    notifications.push({
      id: "visit",
      title: visit.status === "requested" ? "Visit requested" : "Call scheduled",
      detail: visit.reason?.trim() || "Video call with your physician",
      time: formatWhen(visit.starts_at),
      badge: visit.status === "requested" ? "NEW" : undefined,
      badgeClass: visit.status === "requested" ? NEW_BADGE : undefined,
      icon: "clock",
      href: "/dashboard/doctor",
    });
  }

  const photos: DashboardPhoto[] = photoRows.map((item) => ({
    id: item.id,
    kind: item.kind,
    label: photoKindLabel(item.kind),
    src: `/api/case-photos/${row.id}/${path.basename(item.storage_path)}`,
    date: formatLongDate(item.created_at),
    createdAt: new Date(item.created_at).getTime(),
  }));

  const messages: DashboardMessage[] = messageRows.map((item) => {
    const created = new Date(item.created_at);
    return {
      id: item.id,
      from: item.sender_role,
      body: item.body,
      date: formatShortDate(created),
      time: created.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" }),
      createdAt: created.getTime(),
    };
  });

  const physicianNotes: DashboardPhysicianNote[] = [];
  if (isApproved && row.reviewed_at) {
    physicianNotes.push({
      id: "approved",
      date: formatLongDate(row.reviewed_at),
      text: treatmentName
        ? `Treatment approved. ${treatmentName} prescribed.`
        : "Treatment approved.",
    });
  } else if ((isDeclined || isInPerson) && row.reviewed_at) {
    physicianNotes.push({
      id: "reviewed",
      date: formatLongDate(row.reviewed_at),
      text: isDeclined
        ? "Online treatment was not recommended. Your physician shared a next step."
        : "An in-person visit was recommended before treatment can continue online.",
    });
  }
  if (row.triage_note?.trim()) {
    physicianNotes.push({
      id: "triage",
      date: formatLongDate(row.reviewed_at ?? submitted),
      text: row.triage_note.trim(),
    });
  }
  if (row.treatment_notes?.trim()) {
    physicianNotes.push({
      id: "treatment-notes",
      date: formatLongDate(row.treatment_started_at ?? row.reviewed_at ?? submitted),
      text: row.treatment_notes.trim(),
    });
  }
  for (const visitNote of visitNotes) {
    if (!visitNote.notes?.trim()) continue;
    physicianNotes.push({
      id: `visit-${visitNote.id}`,
      date: formatLongDate(visitNote.starts_at),
      text: visitNote.notes.trim(),
    });
  }

  const timelineItems: (DashboardTimelineEvent & { at: number })[] = [];
  if (isApproved || treatmentName) {
    const startedAt = row.treatment_started_at ?? row.reviewed_at ?? submitted;
    timelineItems.push({
      date: formatShortDate(startedAt),
      label: "Treatment started",
      sub: treatmentName || "Plan approved",
      type: "start",
      at: new Date(startedAt).getTime(),
    });
  }
  const photosByDay = new Map<string, { count: number; at: number }>();
  for (const photo of photos) {
    const day = formatShortDate(photo.createdAt);
    const existing = photosByDay.get(day);
    photosByDay.set(day, { count: (existing?.count ?? 0) + 1, at: existing?.at ?? photo.createdAt });
  }
  for (const [date, group] of photosByDay) {
    timelineItems.push({
      date,
      label: "Photos uploaded",
      sub: group.count === 1 ? "1 photo submitted" : `${group.count} photos submitted`,
      type: "photo",
      at: group.at,
    });
  }
  if (row.reviewed_at) {
    timelineItems.push({
      date: formatShortDate(row.reviewed_at),
      label: "Physician review",
      sub: isApproved ? "Treatment plan approved" : "Review complete",
      type: "physician",
      at: new Date(row.reviewed_at).getTime(),
    });
  }
  const timeline: DashboardTimelineEvent[] = timelineItems
    .sort((a, b) => b.at - a.at)
    .map(({ at: _at, ...event }) => event);

  const currentMedications =
    medRow?.answer === "Yes" && medRow.follow_up_text?.trim()
      ? medRow.follow_up_text
          .split(/[,;\n]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  return {
    signedIn: true,
    greetingSubtitle,
    caseId: row.id,
    statusTitle,
    statusDetail,
    statusCta,
    stepCurrent,
    stepTotal: 5,
    tracker,
    estimatedDelivery,
    doctorName,
    doctorSpecialty: row.doctor_specialty,
    doctorLicense: row.doctor_license?.trim() || null,
    doctorLabel: isApproved || isDeclined || isInPerson ? "Reviewed by" : "Your physician",
    treatmentName,
    treatmentStart: row.treatment_started_at
      ? formatShortDate(row.treatment_started_at)
      : isApproved && row.reviewed_at
        ? formatShortDate(row.reviewed_at)
        : null,
    treatmentFollowUp: row.follow_up_at ? formatShortDate(row.follow_up_at) : null,
    treatmentNotes: row.treatment_notes?.trim() || null,
    treatmentApproved: isApproved,
    physicianSince: formatLongDate(submitted),
    lastReviewAt: row.reviewed_at ? formatLongDate(row.reviewed_at) : null,
    isPremium: false,
    unreadMessageCount: message?.sender_role === "doctor" ? 1 : 0,
    photos,
    messages,
    physicianNotes,
    timeline,
    currentMedications,
    nextUp,
    notifications: notifications.slice(0, 3),
  };
}

export async function sendPatientMessage(body: string): Promise<PatientDashboardSnapshot> {
  await ready();
  const user = await getSessionUser();
  if (!user) throw new Error("Sign in to send a message");

  const snapshot = await getPatientDashboardSnapshot();
  if (!snapshot.isPremium) {
    throw new Error("Messaging your physician is included in Hiros Premium");
  }
  if (!snapshot.caseId) {
    throw new Error("Complete your intake before messaging your physician");
  }

  const text = body.trim();
  if (!text) throw new Error("Message is required");

  await sql`
    insert into public.messages (case_id, sender_role, sender_profile_id, body)
    values (${snapshot.caseId}::uuid, 'patient', ${user.id}::uuid, ${text})
  `;

  return getPatientDashboardSnapshot();
}
