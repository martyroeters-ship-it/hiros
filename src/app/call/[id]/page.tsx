"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { patchAppointment } from "@/app/doctor/agenda/store";
import type { VideoAppointment } from "@/app/doctor/agenda/types";
import type { PatientCase, PatientPhoto, TriageFinding } from "@/app/doctor/data";
import { PhotoCompare } from "@/app/doctor/photo-compare";
import type { TreatmentPatientDetail } from "@/app/doctor/patients/types";

type LastMessage = { from: "patient" | "doctor"; body: string };

export default function DemoCallPage() {
  const params = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<VideoAppointment | undefined>();
  const [flags, setFlags] = useState<TriageFinding[]>([]);
  const [photos, setPhotos] = useState<PatientPhoto[]>([]);
  const [plan, setPlan] = useState<string | undefined>();
  const [planNotes, setPlanNotes] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<LastMessage | undefined>();
  const [missing, setMissing] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [notesBusy, setNotesBusy] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    void fetch(`/api/appointments/${params.id}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 404) {
          setMissing(true);
          return;
        }
        if (!res.ok) throw new Error("Could not load visit");
        const item = (await res.json()) as VideoAppointment;
        setAppointment(item);
        setMeetingNotes(item.notes ?? "");

        void fetch(`/api/cases/${item.caseId}`, { cache: "no-store" })
          .then(async (caseRes) => {
            if (!caseRes.ok) return;
            const next = (await caseRes.json()) as PatientCase;
            setFlags(Array.isArray(next.findings) ? next.findings : []);
            setPhotos(Array.isArray(next.photos) ? next.photos : []);
          })
          .catch(() => undefined);

        void fetch(`/api/patients/${item.caseId}`, { cache: "no-store" })
          .then(async (patientRes) => {
            if (!patientRes.ok) return;
            const next = (await patientRes.json()) as TreatmentPatientDetail;
            setPlan(next.treatmentName);
            setPlanNotes(next.treatmentNotes);
            if (Array.isArray(next.photos) && next.photos.length) {
              setPhotos((current) => (current.length ? current : next.photos));
            }
            const last = next.messages[0];
            if (last) setLastMessage({ from: last.from, body: last.body });
          })
          .catch(() => undefined);
      })
      .catch(() => setMissing(true));
  }, [params.id]);

  if (missing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1f241b] px-6 text-white">
        <p>This video visit was not found.</p>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1f241b] px-6 text-white/60">
        Connecting…
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-row overflow-hidden bg-[#1f241b] text-white">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">Prototype video room</p>
        <h1 className="mt-3 font-title text-[28px] font-semibold tracking-[-0.03em]">{appointment.patientName}</h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/65">
          with {appointment.doctorName}. This is a scheduled visit placeholder — no camera stream is sent in the prototype.
        </p>
        {appointment.reason ? <p className="mt-4 text-[14px] text-white/80">{appointment.reason}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/doctor/agenda" className="rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#1f241b]">
            Back to agenda
          </Link>
          <button
            type="button"
            onClick={() => setChartOpen((open) => !open)}
            className="rounded-full border border-white/20 px-5 py-2.5 text-[13.5px] font-semibold text-white"
          >
            {chartOpen ? "Hide chart" : "Open patient profile"}
          </button>
        </div>
      </section>

      {chartOpen ? (
        <aside className="flex h-screen w-1/4 flex-none flex-col border-l border-white/10 bg-[#f4f5f3] text-[#2b2a28]">
          <div className="flex items-start justify-between gap-3 border-b border-black/5 bg-white/90 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[#1f241b]">{appointment.patientName}</p>
              <p className="text-[12px] text-black/45">{appointment.city}</p>
            </div>
            <Link href={`/doctor/patients/${appointment.caseId}`} className="shrink-0 text-[12px] font-semibold text-[#3f5f35]">
              Full profile
            </Link>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <section className="rounded-[12px] border border-black/[0.06] bg-white p-3">
              <h2 className="mb-1.5 text-[12px] font-semibold text-[#1f241b]">Intake flags</h2>
              {flags.length === 0 ? (
                <p className="text-[12.5px] text-black/45">No intake flags on this case.</p>
              ) : (
                <ul className="space-y-1.5">
                  {flags.map((flag) => (
                    <li key={flag.point} className="flex items-start gap-1.5 text-[12.5px] leading-snug">
                      <span className={`shrink-0 font-semibold capitalize ${flag.level === "red" ? "text-[#a81d12]" : "text-[#9a4e07]"}`}>
                        {flag.level}
                      </span>
                      <span>{flag.point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-[12px] border border-black/[0.06] bg-white p-3">
              <h2 className="mb-1.5 text-[12px] font-semibold text-[#1f241b]">Photos</h2>
              <PhotoCompare photos={photos} size="xs" />
            </section>

            <section className="rounded-[12px] border border-black/[0.06] bg-white p-3">
              <h2 className="mb-1.5 text-[12px] font-semibold text-[#1f241b]">Current plan</h2>
              <p className="text-[13px] font-medium text-[#1f241b]">{plan ?? "No treatment on file"}</p>
              {planNotes ? <p className="mt-1 text-[12.5px] text-black/50">{planNotes}</p> : null}
            </section>

            <section className="rounded-[12px] border border-black/[0.06] bg-white p-3">
              <h2 className="mb-1.5 text-[12px] font-semibold text-[#1f241b]">Last message</h2>
              {lastMessage ? (
                <p className="text-[12.5px] leading-snug text-[#1f241b]">
                  <span className="font-semibold">{lastMessage.from === "doctor" ? "You" : "Patient"}: </span>
                  {lastMessage.body}
                </p>
              ) : (
                <p className="text-[12.5px] text-black/45">No messages yet.</p>
              )}
            </section>

            <section className="rounded-[12px] border border-black/[0.06] bg-white p-3">
              <h2 className="mb-1.5 text-[12px] font-semibold text-[#1f241b]">Meeting notes</h2>
              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="What you discussed, decided, next step…"
                className="min-h-[120px] w-full resize-y rounded-[10px] border border-black/10 bg-white px-3 py-2 text-[12.5px] text-[#1f241b] outline-none placeholder:text-black/35 focus:border-[#8ea57a]"
              />
              {notesError ? <p className="mt-1.5 text-[12px] font-medium text-[#a81d12]">{notesError}</p> : null}
              <button
                type="button"
                disabled={notesBusy}
                onClick={() => {
                  setNotesBusy(true);
                  setNotesError("");
                  setNotesSaved(false);
                  void patchAppointment(appointment.id, "note", meetingNotes)
                    .then((next) => {
                      setAppointment(next);
                      setMeetingNotes(next.notes ?? "");
                      setNotesSaved(true);
                      window.setTimeout(() => setNotesSaved(false), 1600);
                    })
                    .catch((err) => setNotesError(err instanceof Error ? err.message : "Could not save notes"))
                    .finally(() => setNotesBusy(false));
                }}
                className="mt-2 w-full rounded-[10px] bg-[#2f5f4f] py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
              >
                {notesBusy ? "Saving…" : notesSaved ? "Saved" : "Save notes"}
              </button>
            </section>
          </div>

          <div className="border-t border-black/8 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => setChartOpen(false)}
              className="w-full rounded-[10px] border border-black/10 py-2.5 text-[13px] font-semibold text-[#2b2a28] hover:bg-black/[0.03]"
            >
              Close
            </button>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
