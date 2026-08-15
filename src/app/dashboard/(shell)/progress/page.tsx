"use client";

import Image from "next/image";
import Link from "next/link";

/* ─── style tokens ──────────────────────────────────────────────── */
const titleMd = "font-title font-medium tracking-[0.01em]";
const card = "rounded-[24px] bg-white shadow-[0_2px_16px_rgba(31,51,41,0.05)]";
const cardInner = "rounded-[14px] border border-[#f0ebe2] bg-[#faf9f6] p-3";

/* ─── photo timeline months ─────────────────────────────────────── */
const MONTHS = [
  { label: "Baseline", date: "Jun 12", src: "/example.jpg", locked: false, status: "reviewed", statusText: "Reviewed by Dr. Yilmaz" },
  { label: "Month 1",  date: "Jul 12", src: null,           locked: true,  status: "awaiting",  statusText: "Awaiting upload"         },
  { label: "Month 2",  date: "Aug 12", src: null,           locked: true,  status: "scheduled", statusText: "Scheduled Aug 12"         },
  { label: "Month 3",  date: "Sep 12", src: null,           locked: true,  status: "scheduled", statusText: "Scheduled Sep 12"         },
];

/* ─── physician notes ───────────────────────────────────────────── */
const NOTES = [
  {
    date: "Aug 14, 2025",
    text: "Early signs of thickening visible in the frontal area. Hairline appears more defined compared to baseline. Continue treatment at current dosage.",
    positive: true,
  },
  {
    date: "Jul 12, 2025",
    text: "Hair density appears stable. No adverse effects reported. Continue treatment as prescribed.",
    positive: true,
  },
];

/* ─── timeline events ────────────────────────────────────────────── */
const TIMELINE = [
  { date: "Aug 14", label: "Physician review", sub: "Early signs of improvement noted", type: "physician" },
  { date: "Aug 12", label: "Progress photos uploaded", sub: "Month 2 photos submitted", type: "photo" },
  { date: "Jul 12", label: "1-month review completed", sub: "All looks on track", type: "physician" },
  { date: "Jun 12", label: "Baseline photos uploaded", sub: "Starting point captured", type: "photo" },
  { date: "Jun 12", label: "Treatment started", sub: "Topical Finasteride 0.25%", type: "start" },
];


export default function ProgressPage() {

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pb-4 pr-1">

      {/* ── Header ── */}
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-medium text-[#8a9288]">Your journey</p>
          <h1 className="font-title text-[28px] font-medium tracking-[-0.03em] text-[#1f3329]">Progress</h1>
        </div>
        <span className="rounded-full bg-[#dce8d6] px-3 py-1 text-[12px] font-semibold text-[#3d5c35]">Month 3</span>
      </div>


      {/* ── 1. Progress Photos — dark green hero ── */}
      <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Progress photos</h2>
            <p className="mt-0.5 text-[12px] text-[#8a9288]">Baseline → now</p>
          </div>
          <span className="text-[12px] text-[#8a9288]">3 months in</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {MONTHS.map((m) => (
            <div key={m.label} className="flex flex-col gap-2">
              <div className="relative w-full overflow-hidden rounded-[14px] bg-[#edeae5]" style={{ aspectRatio: "3/4" }}>
                {m.src ? (
                  <Image src={m.src} alt={m.label} fill className="object-cover object-top" sizes="200px" />
                ) : m.status === "awaiting" ? (
                  <Link href="/dashboard/photos" className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 text-center transition-colors hover:bg-[#d8ddd6]" style={{ background: "#eaf0e7", outline: "1.5px solid #cad9c5", outlineOffset: "-1.5px", borderRadius: "14px" }}>
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-[#7a9e72]" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="2.5" />
                    </svg>
                    <p className="text-[11px] font-medium text-[#7a9e72]">Take progress photos</p>
                  </Link>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b0aba3]">Upcoming</p>
                    <p className="text-[12px] font-medium text-[#9aa396]">{m.date}</p>
                  </div>
                )}
              </div>
              <div>
                <p className={`text-[12px] font-semibold ${m.locked ? "text-[#b0aba3]" : "text-[#3d4540]"}`}>{m.label}</p>
                <p className={`mt-0.5 text-[11px] leading-snug ${
                  m.status === "reviewed" ? "text-[#4a6b42]" :
                  m.status === "awaiting" ? "text-[#e8965a]" :
                  "text-[#9aa396]"
                }`}>
                  {m.status === "reviewed" ? "✓ " : m.status === "awaiting" ? "⏳ " : ""}{m.statusText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2 + 3: Consistency + Physician Notes ── */}
      <div className="grid grid-cols-[1fr_1.2fr] gap-4">

        {/* Treatment Consistency */}
        <div className={`${card} p-5`}>
          <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Treatment consistency</h2>
          <p className="mt-0.5 text-[12px] text-[#8a9288]">Adherence & streak</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className={`${cardInner} col-span-2`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">Adherence</p>
              <p className="mt-1 font-title text-[40px] font-medium leading-none text-[#4a6b42]">92%</p>
              <p className="mt-0.5 text-[12px] text-[#9aa396]">This month</p>
            </div>
            <div className={cardInner}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">Streak</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-[18px]">🔥</span>
                <p className="font-title text-[22px] font-medium text-[#1f3329]">17</p>
              </div>
              <p className="text-[11px] text-[#9aa396]">days</p>
            </div>
            <div className={cardInner}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">Missed</p>
              <p className="mt-1 font-title text-[22px] font-medium text-[#1f3329]">3</p>
              <p className="text-[11px] text-[#9aa396]">this month</p>
            </div>
          </div>
        </div>

        {/* Physician Notes — sand */}
        <div className="rounded-[24px] bg-[#ebe6dc] p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
          <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Physician observations</h2>
          <p className="mt-0.5 text-[12px] text-[#8a9288]">Notes from Dr. Emre Yilmaz</p>

          <div className="mt-4 space-y-3">
            {NOTES.map((note) => (
              <div key={note.date} className={`${cardInner} p-4`}>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#8a9288]">{note.date}</p>
                  {note.positive && (
                    <span className="rounded-full bg-[#dce8d6] px-2 py-0.5 text-[10px] font-semibold text-[#3d5c35]">Positive</span>
                  )}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#3d4540]">
                  &ldquo;{note.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Progress Timeline ── */}
      <div className={`${card} p-5`}>
        <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Progress timeline</h2>
        <p className="mt-0.5 text-[12px] text-[#8a9288]">Your treatment journey so far</p>

        <div className="relative mt-5 pl-6">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#e4e0d8]" />

          <div className="space-y-5">
            {TIMELINE.map((event, i) => {
              const isPhysician = event.type === "physician";
              const isPhoto = event.type === "photo";
              return (
                <div key={i} className="relative flex gap-4">
                  {/* Dot */}
                  <div className={`absolute -left-6 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${isPhysician ? "bg-[#4a6b42]" : isPhoto ? "bg-[#e8965a]" : "bg-[#1f4033]"}`}>
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
      </div>
    </div>
  );
}
