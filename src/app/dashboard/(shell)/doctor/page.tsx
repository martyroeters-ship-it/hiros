"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createAppointmentRequest, fetchAppointments } from "@/app/doctor/agenda/store";
import type { VideoAppointment } from "@/app/doctor/agenda/types";
import { usePatientDashboard } from "@/lib/use-patient-dashboard";

const HOW_REVIEWS = [
  "Progress photos",
  "Side effect reports",
  "Treatment adherence",
  "Questions submitted through messages",
];

export default function DoctorPage() {
  const { snapshot, loading } = usePatientDashboard();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState<VideoAppointment[]>([]);

  const caseId = snapshot?.caseId ?? null;
  const doctorName = snapshot?.doctorName || "Your physician";
  const specialty = snapshot?.doctorSpecialty || "Physician";

  const loadVisits = (id: string) => {
    void fetchAppointments(id).then(setAppointments).catch(() => setAppointments([]));
  };

  useEffect(() => {
    if (!caseId) {
      setAppointments([]);
      return;
    }
    loadVisits(caseId);
  }, [caseId]);

  const upcoming = appointments.filter((item) => item.status === "requested" || item.status === "scheduled");

  const requestCall = async () => {
    if (!caseId) return;
    setBusy(true);
    setError("");
    try {
      await createAppointmentRequest({
        caseId,
        startsAt: new Date(startsAt).toISOString(),
        reason,
        requestedBy: "patient",
      });
      setBookingOpen(false);
      setReason("");
      loadVisits(caseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request a call");
    } finally {
      setBusy(false);
    }
  };

  const notes = snapshot?.physicianNotes ?? [];

  return (
    <div className="overflow-y-auto pb-6 pr-1">
      <div className="mb-6">
        <p className="text-[12px] font-medium text-[#8a9288]">Your care team</p>
        <h1 className="font-title text-[24px] font-medium tracking-[-0.03em] text-[#1f3329] lg:text-[28px]">Your physician</h1>
      </div>

      {!snapshot && loading ? (
        <div className="rounded-[24px] bg-white p-6 text-center shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
          <p className="text-[13px] text-[#8a9288]">Loading your physician…</p>
        </div>
      ) : !snapshot?.caseId ? (
        <div className="rounded-[24px] bg-white p-6 text-center shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
          <p className="text-[15px] font-semibold text-[#1f3329]">No physician assigned yet</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6b7568]">
            Complete your intake so a licensed physician can review your case.
          </p>
          <Link href="/intake" className="mt-4 inline-flex rounded-full bg-[#1f4033] px-4 py-2 text-[13px] font-semibold text-white">
            Start intake
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="rounded-[24px] bg-[#1f4033] p-6 text-white shadow-[0_8px_32px_rgba(31,64,51,0.18)]">
            <div className="flex flex-col items-start gap-5 sm:flex-row">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white/15 sm:h-32 sm:w-32">
                <Image src="/why_hiros_doctors.webp" alt={doctorName} fill className="object-cover object-top" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-title text-[20px] font-medium text-white sm:text-[22px]">{doctorName}</h2>
                    <p className="mt-0.5 text-[13px] text-white/60">{specialty}</p>
                  </div>
                  <span className="w-fit rounded-full bg-[#4a9b5f]/30 px-3 py-1 text-[11px] font-semibold text-[#9cc796]">
                    {snapshot.treatmentApproved ? "Assigned" : "Reviewing"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Physician since", value: snapshot.physicianSince || "—" },
                    { label: "License", value: snapshot.doctorLicense || "—" },
                    { label: "Focus", value: specialty },
                  ].map((s) => (
                    <div key={s.label} className="rounded-[10px] bg-white/10 px-2 py-2">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-white/50">{s.label}</p>
                      <p className="mt-0.5 font-title text-[13px] font-medium text-white">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {snapshot.isPremium ? (
                <Link
                  href="/dashboard/messages"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
                  </svg>
                  Message physician
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Messaging your physician is included in Hiros Premium"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 py-2.5 text-[13px] font-semibold text-white/55"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
                  </svg>
                  Message physician
                </button>
              )}
              <button
                type="button"
                onClick={() => setBookingOpen((open) => !open)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-2.5 text-[13px] font-semibold text-[#1f4033] transition-colors hover:bg-white/90"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                </svg>
                Request video call
              </button>
            </div>
            {snapshot.isPremium ? null : (
              <div className="mt-3">
                <p className="text-[12px] leading-relaxed text-white/70">
                  Messaging your physician is included in Hiros Premium. You can still request a video call or reach the Hiros care team.
                </p>
              </div>
            )}
            {bookingOpen ? (
              <div className="mt-4 space-y-3 rounded-[16px] bg-white/10 p-4">
                <label className="block text-left text-[12px] font-semibold text-white/80">
                  Preferred time
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[12px] border-0 bg-white px-3.5 text-[13.5px] font-medium text-[#1f3329] outline-none"
                  />
                </label>
                <label className="block text-left text-[12px] font-semibold text-white/80">
                  Why would you like a call?
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="A flagged answer, a new symptom, something unclear…"
                    className="mt-1.5 h-11 w-full rounded-[12px] border-0 bg-white px-3.5 text-[13.5px] font-medium text-[#1f3329] outline-none"
                  />
                </label>
                {error ? <p className="text-[12px] text-[#ffd0c8]">{error}</p> : null}
                <button
                  type="button"
                  disabled={busy || !startsAt}
                  onClick={() => void requestCall()}
                  className="w-full rounded-full bg-white py-2.5 text-[13px] font-semibold text-[#1f4033] disabled:opacity-50"
                >
                  Send request
                </button>
              </div>
            ) : null}
          </div>

          {upcoming.length > 0 ? (
            <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">Video visits</p>
              <div className="mt-3 space-y-3">
                {upcoming.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded-[14px] bg-[#faf9f6] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#1f3329]">
                        {new Date(item.startsAt).toLocaleString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-[12px] text-[#6b7568]">
                        {item.status === "requested" ? "Waiting for physician confirmation" : "Confirmed video call"}
                        {item.reason ? ` · ${item.reason}` : ""}
                      </p>
                    </div>
                    {item.status === "scheduled" ? (
                      <Link href={`/call/${item.id}`} className="rounded-full bg-[#1f4033] px-3.5 py-2 text-center text-[12px] font-semibold text-white">
                        Join call
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">About</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#3d4540]">
                {doctorName} is your assigned Hiros physician{specialty ? `, with a focus on ${specialty}.` : "."}
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#3d4540]">
                They review your intake, monitor progress photos and share next steps throughout treatment.
              </p>
              <div className="mt-5 border-t border-[#f0ebe2] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">Your treatment relationship</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: "Physician since", value: snapshot.physicianSince || "—" },
                    { label: "Last review", value: snapshot.lastReviewAt || "—" },
                    { label: "Next review", value: snapshot.treatmentFollowUp || "—" },
                    { label: "Treatment", value: snapshot.treatmentName || "Waiting" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-[12px] bg-[#faf9f6] px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">{s.label}</p>
                      <p className="mt-0.5 text-[13px] font-medium text-[#1f3329]">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-[24px] bg-[#ebe6dc] p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">How reviews work</p>
                <p className="mt-1.5 text-[13px] text-[#6b7568]">Your physician reviews:</p>
                <ul className="mt-3 space-y-2">
                  {HOW_REVIEWS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1f4033]">
                        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" stroke="white" strokeWidth="2.5">
                          <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <p className="text-[13px] text-[#3d4540]">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">Contact & availability</p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between rounded-[12px] bg-[#faf9f6] px-3 py-2.5">
                    <p className="text-[12px] font-medium text-[#6b7568]">Response time</p>
                    <p className="text-[12px] font-semibold text-[#1f3329]">Within 24h</p>
                  </div>
                  <div className="flex items-center justify-between rounded-[12px] bg-[#faf9f6] px-3 py-2.5">
                    <p className="text-[12px] font-medium text-[#6b7568]">Available</p>
                    <p className="text-[12px] font-semibold text-[#1f3329]">Mon – Fri</p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#9aa396]">For urgent medical concerns, contact local emergency services.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">Treatment reviews</p>
            <p className="mt-0.5 text-[12px] text-[#8a9288]">Physician activity history</p>
            {notes.length === 0 ? (
              <div className="mt-5 rounded-[16px] border border-dashed border-[#e4e0d8] bg-[#faf9f6] px-4 py-6 text-center">
                <p className="text-[13px] font-semibold text-[#3d4540]">No physician notes yet</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#8a9288]">
                  Review notes will appear here after your physician reviews your case.
                </p>
              </div>
            ) : (
              <div className="relative mt-5 pl-6">
                <div className="absolute bottom-2 left-[9px] top-2 w-px bg-[#f0ebe2]" />
                <div className="space-y-6">
                  {notes.map((review) => (
                    <div key={review.id} className="relative">
                      <div className="absolute -left-6 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1f4033]">
                        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" stroke="white" strokeWidth="2.5">
                          <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold text-[#8a9288]">{review.date}</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[#3d4540]">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
