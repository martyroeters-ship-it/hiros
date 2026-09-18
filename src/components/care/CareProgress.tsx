"use client";

import Image from "next/image";
import Link from "next/link";
import { NextPhotoSlot } from "@/components/care/NextPhotoSlot";
import { usePatientDashboard } from "@/lib/use-patient-dashboard";

const titleMd = "font-title font-medium tracking-[0.01em]";
const card = "rounded-[24px] bg-white shadow-[0_2px_16px_rgba(31,51,41,0.05)]";
const cardInner = "rounded-[14px] border border-[#f0ebe2] bg-[#faf9f6] p-3";

export default function CareProgress() {
  const { snapshot, loading } = usePatientDashboard();
  const photos = snapshot?.photos ?? [];
  const notes = snapshot?.physicianNotes ?? [];
  const timeline = snapshot?.timeline ?? [];
  const doctorName = snapshot?.doctorName || "your physician";
  const treatmentStartedAt = snapshot?.treatmentStartedAt ?? null;

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pb-4 pr-1">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-medium text-[#8a9288]">Your journey</p>
          <h1 className="font-title text-[24px] font-medium tracking-[-0.03em] text-[#1f3329] lg:text-[28px]">Progress</h1>
        </div>
        {snapshot?.treatmentApproved ? (
          <span className="rounded-full bg-[#dce8d6] px-3 py-1 text-[12px] font-semibold text-[#3d5c35]">In treatment</span>
        ) : (
          <span className="rounded-full bg-[#edeae5] px-3 py-1 text-[12px] font-semibold text-[#6b7568]">Waiting</span>
        )}
      </div>

      <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Progress photos</h2>
            <p className="mt-0.5 text-[12px] text-[#8a9288]">
              {loading
                ? "Loading…"
                : photos.length
                  ? `${photos.length} photo${photos.length === 1 ? "" : "s"} on file`
                  : "No photos yet"}
            </p>
          </div>
          <Link href="/dashboard/photos" className="text-[12px] font-semibold text-[#1f4033]">
            Upload photos
          </Link>
        </div>

        {loading ? (
          <div className="mt-4 rounded-[16px] border border-dashed border-[#e4e0d8] bg-[#faf9f6] px-4 py-10 text-center text-[13px] text-[#8a9288]">
            Loading photos…
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="flex flex-col gap-2">
                <div className="relative w-full overflow-hidden rounded-[14px] bg-[#edeae5]" style={{ aspectRatio: "3/4" }}>
                  <Image src={photo.src} alt={photo.label} fill className="object-cover object-top" sizes="200px" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#3d4540]">{photo.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#8a9288]">{photo.date}</p>
                </div>
              </div>
            ))}
            <NextPhotoSlot photos={photos} treatmentStartedAt={treatmentStartedAt} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className={`${card} p-5`}>
          <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Treatment consistency</h2>
          <p className="mt-0.5 text-[12px] text-[#8a9288]">Adherence is logged from your check-ins</p>
          <div className="mt-4 rounded-[16px] border border-dashed border-[#e4e0d8] bg-[#faf9f6] px-4 py-6 text-center">
            <p className="text-[13px] font-semibold text-[#3d4540]">No adherence history yet</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#8a9288]">Daily dose logs will appear here once you start checking in.</p>
          </div>
        </div>

        <div className="rounded-[24px] bg-[#ebe6dc] p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
          <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Physician observations</h2>
          <p className="mt-0.5 text-[12px] text-[#8a9288]">Notes from {doctorName}</p>
          {notes.length === 0 ? (
            <div className="mt-4 rounded-[16px] border border-dashed border-[#d8d2c6] bg-white/50 px-4 py-6 text-center">
              <p className="text-[13px] font-semibold text-[#3d4540]">No physician notes yet</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#8a9288]">Observations will appear here after your physician reviews your case.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {notes.map((note) => (
                <div key={note.id} className={`${cardInner} p-4`}>
                  <p className="text-[11px] font-semibold text-[#8a9288]">{note.date}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#3d4540]">&ldquo;{note.text}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${card} p-5`}>
        <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Progress timeline</h2>
        <p className="mt-0.5 text-[12px] text-[#8a9288]">Your treatment journey so far</p>
        {timeline.length === 0 ? (
          <div className="mt-5 rounded-[16px] border border-dashed border-[#e4e0d8] bg-[#faf9f6] px-4 py-6 text-center">
            <p className="text-[13px] font-semibold text-[#3d4540]">Nothing to show yet</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#8a9288]">
              {snapshot?.signedIn ? "Complete your intake to start your journey." : "Sign in to see your progress."}
            </p>
          </div>
        ) : (
          <div className="relative mt-5 pl-6">
            <div className="absolute bottom-2 left-[9px] top-2 w-px bg-[#e4e0d8]" />
            <div className="space-y-5">
              {timeline.map((event, i) => {
                const isPhysician = event.type === "physician";
                const isPhoto = event.type === "photo";
                return (
                  <div key={`${event.label}-${event.date}-${i}`} className="relative flex gap-4">
                    <div
                      className={`absolute -left-6 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${
                        isPhysician ? "bg-[#4a6b42]" : isPhoto ? "bg-[#e8965a]" : "bg-[#1f4033]"
                      }`}
                    >
                      {isPhysician ? (
                        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" stroke="white" strokeWidth="2.5">
                          <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : isPhoto ? (
                        <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" stroke="white" strokeWidth="2">
                          <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
                          <circle cx="12" cy="13" r="2.5" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="white" className="h-2.5 w-2.5">
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[13px] font-semibold text-[#3d4540]">{event.label}</p>
                        <p className="shrink-0 text-[11px] text-[#9aa396]">{event.date}</p>
                      </div>
                      <p className="mt-0.5 text-[12px] text-[#8a9288]">{event.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
