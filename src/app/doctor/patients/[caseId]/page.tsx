"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { patchAppointment } from "../../agenda/store";
import { PhotoCompare } from "../../photo-compare";
import { DoctorChrome } from "../../shell";
import { useDoctorLanguage } from "../../use-doctor-language";
import { fetchTreatmentPatient, patchTreatmentPatient } from "../store";
import type { TreatmentPatientDetail } from "../types";

function formatDate(ts: number | null): string {
  if (!ts) return "Not recorded";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function yesNo(value: boolean | null, yes = "Yes", no = "No"): { label: string; tone: "good" | "bad" | "muted" } {
  if (value === true) return { label: yes, tone: "good" };
  if (value === false) return { label: no, tone: "bad" };
  return { label: "Unknown", tone: "muted" };
}

function toneClass(tone: "good" | "bad" | "muted"): string {
  if (tone === "good") return "text-[#3f5f35]";
  if (tone === "bad") return "text-[#a81d12]";
  return "text-black/45";
}

export default function DoctorPatientProfilePage() {
  const { copy } = useDoctorLanguage();
  const params = useParams<{ caseId: string }>();
  const [patient, setPatient] = useState<TreatmentPatientDetail | undefined>();
  const [missing, setMissing] = useState(false);
  const [action, setAction] = useState<"adjust" | "followup" | null>(null);
  const [treatmentName, setTreatmentName] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingVisit, setEditingVisit] = useState<string | null>(null);
  const [visitDraft, setVisitDraft] = useState("");

  useEffect(() => {
    void fetchTreatmentPatient(params.caseId).then((item) => {
      if (!item) {
        setMissing(true);
        return;
      }
      setPatient(item);
      setTreatmentName(item.treatmentName);
      setTreatmentNotes(item.treatmentNotes ?? "");
      setFollowUpAt(item.followUpAt ?? "");
    });
  }, [params.caseId]);

  const run = async (body: Record<string, string | undefined>) => {
    setBusy(true);
    setError("");
    try {
      const updated = await patchTreatmentPatient(params.caseId, body);
      setPatient(updated);
      setAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  if (missing) {
    return (
      <DoctorChrome active="patients" title={copy.pages.patientNotFound}>
        <main className="mx-auto max-w-6xl px-6 py-16 text-[14px] text-black/50">
          This person is not in treatment, or the case id is wrong.{" "}
          <Link href="/doctor/patients" className="font-semibold text-[#3f5f35]">
            Back to patients
          </Link>
        </main>
      </DoctorChrome>
    );
  }

  if (!patient) {
    return (
      <DoctorChrome active="patients" title={copy.pages.patientProfile}>
        <main className="mx-auto max-w-6xl px-6 py-16 text-[14px] text-black/40">Loading profile…</main>
      </DoctorChrome>
    );
  }

  const filled = yesNo(patient.filled, "Collected at eczane", "Not collected");
  const meds = yesNo(patient.tookMedsThisMonth);
  const photos = yesNo(patient.submittedPhotos, "Submitted", "Not submitted");

  return (
    <DoctorChrome active="patients" title={patient.fullName}>
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
        <Link href="/doctor/patients" className="mb-5 inline-flex items-center gap-2 text-[13px] font-semibold text-black/50 hover:text-[#2b2a28]">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All patients
        </Link>

        {patient.alerts.length > 0 ? (
          <div className="mb-5 space-y-2">
            {patient.alerts.map((alert) => (
              <div
                key={alert.kind}
                className={`rounded-[14px] border px-4 py-3 ${
                  alert.severity === "red"
                    ? "border-[#f0c2ba] bg-[#fff4f1]"
                    : "border-[#f0d7b0] bg-[#fff8ee]"
                }`}
              >
                <p className="text-[13.5px] font-semibold text-[#1f241b]">{alert.label}</p>
                <p className="mt-0.5 text-[13px] text-black/55">{alert.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-5 rounded-[14px] border border-[#cfe6d3] bg-[#eaf5ec] px-4 py-3 text-[13.5px] font-medium text-[#3f5f35]">
            No compliance alerts. Prescription collected and the latest check-in looks consistent.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:col-span-2">
            <h2 className="mb-4 text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Patient profile</h2>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name" value={patient.fullName} />
              <Field label="Phone" value={patient.phone || "Not provided"} />
              <Field label="Email" value={patient.email || "Not provided"} />
              <Field label="City" value={patient.city} />
              <Field label="Postal code" value={patient.postalCode || "Not provided"} />
              <Field label="Treatment started" value={formatDate(patient.startedAt)} />
              <Field label="Reason for visit" value={patient.reason} />
              <Field label="Reported onset" value={patient.onset} />
              <Field label="Medical conditions" value={patient.medicalConditions.join(", ") || "None reported"} />
              <Field label="Current medications" value={patient.currentMedications.join(", ") || "None reported"} />
            </dl>
            {patient.answers.length > 0 ? (
              <div className="mt-5 border-t border-black/[0.06] pt-4">
                <p className="mb-3 text-[13px] font-semibold text-[#1f241b]">Intake answers</p>
                <div className="space-y-2">
                  {patient.answers.map((answer) => (
                    <div key={answer.question} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                      <p className="w-48 shrink-0 text-[12.5px] font-medium text-black/45">{answer.question}</p>
                      <p className="text-[13px] font-medium text-[#1f241b]">{answer.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <div className="space-y-4">
            <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="mb-3 text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Current prescription</h2>
              <Field label="Plan" value={patient.treatmentName} />
              <Field label="e-Reçete" value={patient.prescriptionNumber || "Not issued"} />
              <Field label="Issued" value={formatDate(patient.prescriptionIssuedAt)} />
              <Field label="Collection" value={filled.label} />
              {patient.fillNote ? <p className="mt-2 text-[12.5px] text-black/45">{patient.fillNote}</p> : null}
              {patient.prescriptionSimulated ? (
                <p className="mt-3 text-[12px] leading-5 text-black/40">
                  DEMO number only. It is not valid at an eczane and was not sent to MEDULA.
                </p>
              ) : null}
              {!patient.filled && patient.prescriptionNumber ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run({ action: "mark_filled" })}
                  className="mt-4 w-full rounded-[12px] bg-[#2f5f4f] py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50"
                >
                  Mark as collected
                </button>
              ) : null}
            </section>

            <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="mb-3 text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Photos</h2>
              <PhotoCompare photos={patient.photos} />
            </section>

            <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="mb-3 text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Compliance</h2>
              <Field label="Last check-in" value={formatDate(patient.lastCheckInAt)} />
              <p className={`mt-3 text-[13.5px] font-semibold ${toneClass(meds.tone)}`}>Took meds this month: {meds.label}</p>
              <p className={`mt-1 text-[13.5px] font-semibold ${toneClass(photos.tone)}`}>Submitted photos: {photos.label}</p>
              {patient.daysTaken != null ? (
                <p className="mt-1 text-[13px] text-black/50">{patient.daysTaken} days of use reported</p>
              ) : null}
            </section>
          </div>
        </div>

        <section className="mt-4 rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-3 text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Doctor actions</h2>
          {error ? <p className="mb-3 text-[13px] font-medium text-[#a81d12]">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/doctor/messages?case=${patient.caseId}`}
              className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-semibold text-[#2b2a28] hover:bg-black/[0.02]"
            >
              Message patient
            </Link>
            <ActionButton active={action === "adjust"} onClick={() => setAction(action === "adjust" ? null : "adjust")} label="Adjust treatment" />
            <ActionButton active={action === "followup"} onClick={() => setAction(action === "followup" ? null : "followup")} label="Schedule follow-up" />
            <Link
              href={`/doctor/agenda?invite=${patient.caseId}`}
              className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-semibold text-[#2b2a28] hover:bg-black/[0.02]"
            >
              Invite to video call
            </Link>
          </div>

          {action === "adjust" ? (
            <div className="mt-4 space-y-3">
              <input
                value={treatmentName}
                onChange={(e) => setTreatmentName(e.target.value)}
                className="h-11 w-full rounded-[12px] border border-black/10 px-3.5 text-[13.5px] outline-none focus:border-[#8ea57a]"
              />
              <textarea
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                placeholder="Internal note"
                className="min-h-[80px] w-full rounded-[12px] border border-black/10 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#8ea57a]"
              />
              <button
                type="button"
                disabled={busy || !treatmentName.trim()}
                onClick={() => void run({ action: "adjust_treatment", treatmentName, notes: treatmentNotes })}
                className="rounded-[12px] bg-[#2f5f4f] px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50"
              >
                Save treatment
              </button>
            </div>
          ) : null}

          {action === "followup" ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-[13px] font-semibold text-[#1f241b]">
                Follow-up date
                <input
                  type="date"
                  value={followUpAt}
                  onChange={(e) => setFollowUpAt(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3.5 text-[13.5px] font-medium outline-none focus:border-[#8ea57a]"
                />
              </label>
              <button
                type="button"
                disabled={busy || !followUpAt}
                onClick={() => void run({ action: "schedule_followup", followUpAt })}
                className="rounded-[12px] bg-[#2f5f4f] px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50"
              >
                Save date
              </button>
            </div>
          ) : null}

          {patient.messages.length > 0 ? (
            <div className="mt-5 space-y-2 border-t border-black/[0.06] pt-4">
              {patient.messages.map((item) => (
                <div key={item.id} className="rounded-[12px] bg-[#f7f6f3] px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black/40">
                    {item.from === "doctor" ? "Doctor" : "Patient"} · {formatDate(item.createdAt)}
                  </p>
                  <p className="mt-1 text-[13.5px] text-[#1f241b]">{item.body}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="mt-4 rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-3 text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Visit notes</h2>
          {patient.visits.length === 0 ? (
            <p className="text-[13.5px] text-black/45">No video visits yet. Notes from a call will land here.</p>
          ) : (
            <div className="space-y-3">
              {patient.visits.map((visit) => (
                <div key={visit.id} className="rounded-[12px] border border-black/[0.05] px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#1f241b]">
                      {formatDate(visit.startsAt)} · {visit.status}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVisit(editingVisit === visit.id ? null : visit.id);
                        setVisitDraft(visit.notes ?? "");
                      }}
                      className="text-[12px] font-semibold text-[#3f5f35]"
                    >
                      {editingVisit === visit.id ? "Close" : visit.notes ? "Edit" : "Add note"}
                    </button>
                  </div>
                  {visit.reason ? <p className="mt-1 text-[12.5px] text-black/45">{visit.reason}</p> : null}
                  {editingVisit === visit.id ? (
                    <div className="mt-2">
                      <textarea
                        value={visitDraft}
                        onChange={(e) => setVisitDraft(e.target.value)}
                        placeholder="What you discussed, decided, next step…"
                        className="min-h-[80px] w-full rounded-[10px] border border-black/10 px-3 py-2 text-[13px] outline-none focus:border-[#8ea57a]"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setBusy(true);
                          setError("");
                          void patchAppointment(visit.id, "note", visitDraft)
                            .then(async () => {
                              const next = await fetchTreatmentPatient(params.caseId);
                              if (next) setPatient(next);
                              setEditingVisit(null);
                            })
                            .catch((err) => setError(err instanceof Error ? err.message : "Could not save notes"))
                            .finally(() => setBusy(false));
                        }}
                        className="mt-2 rounded-[10px] bg-[#2f5f4f] px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
                      >
                        Save note
                      </button>
                    </div>
                  ) : visit.notes ? (
                    <p className="mt-2 whitespace-pre-wrap text-[13.5px] text-[#1f241b]">{visit.notes}</p>
                  ) : (
                    <p className="mt-2 text-[13px] text-black/40">No note from this visit yet.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-4 rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-3 text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Check-ins</h2>
          {patient.checkIns.length === 0 ? (
            <p className="text-[13.5px] text-black/45">No check-ins submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {patient.checkIns.map((item) => (
                <div key={item.id} className="rounded-[12px] border border-black/[0.05] px-3 py-3">
                  <p className="text-[13px] font-semibold text-[#1f241b]">
                    {item.kind.replace("_", " ")} · {formatDate(item.createdAt)}
                  </p>
                  <p className="mt-1 text-[13px] text-black/55">
                    Meds: {yesNo(item.tookMedsThisMonth).label} · Photos: {yesNo(item.submittedPhotos, "Submitted", "Missing").label}
                    {item.sideEffects ? ` · ${item.sideEffects}` : ""}
                  </p>
                  {item.note ? <p className="mt-1 text-[13px] text-[#1f241b]">{item.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </DoctorChrome>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black/40">{label}</dt>
      <dd className="mt-0.5 text-[13.5px] font-medium text-[#1f241b]">{value}</dd>
    </div>
  );
}

function ActionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${
        active ? "bg-[#2f5f4f] text-white" : "border border-black/10 bg-white text-[#2b2a28] hover:bg-black/[0.02]"
      }`}
    >
      {label}
    </button>
  );
}
