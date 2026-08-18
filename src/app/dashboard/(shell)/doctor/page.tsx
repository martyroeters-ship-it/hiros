"use client";

import Link from "next/link";
import Image from "next/image";

const REVIEWS = [
  {
    date: "Aug 14, 2025",
    notes: ["Hair density appears stable.", "Continue treatment.", "Early signs of thickening visible in frontal area."],
  },
  {
    date: "Jul 12, 2025",
    notes: ["No significant side effects reported.", "Adherence excellent at 94%."],
  },
  {
    date: "Jun 6, 2025",
    notes: ["Treatment approved.", "Topical Finasteride 0.25% prescribed."],
  },
];

const HOW_REVIEWS = [
  "Progress photos",
  "Side effect reports",
  "Treatment adherence",
  "Questions submitted through messages",
];

export default function DoctorPage() {
  return (
    <div className="overflow-y-auto pb-6 pr-1">

      {/* ── Header ── */}
      <div className="mb-6">
        <p className="text-[12px] font-medium text-[#8a9288]">Your care team</p>
        <h1 className="font-title text-[24px] font-medium tracking-[-0.03em] text-[#1f3329] lg:text-[28px]">Your physician</h1>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Doctor hero card ── */}
        <div className="rounded-[24px] bg-[#1f4033] p-6 text-white shadow-[0_8px_32px_rgba(31,64,51,0.18)]">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            {/* Avatar */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white/15 sm:h-32 sm:w-32">
              <Image src="/why_hiros_doctors.png" alt="Dr. Emre Yılmaz" fill className="object-cover object-top" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-title text-[20px] font-medium text-white sm:text-[22px]">Dr. Emre Yılmaz</h2>
                  <p className="mt-0.5 text-[13px] text-white/60">Dermatologist · Hair & Scalp</p>
                </div>
                <span className="w-fit rounded-full bg-[#4a9b5f]/30 px-3 py-1 text-[11px] font-semibold text-[#9cc796]">Active</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {[
                  { label: "Experience", value: "12 yrs" },
                  { label: "License",    value: "NL-4821" },
                  { label: "Focus",      value: "Hair & Scalp" },
                ].map((s) => (
                  <div key={s.label} className="rounded-[10px] bg-white/10 px-2 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-white/50">{s.label}</p>
                    <p className="mt-0.5 font-title text-[13px] font-medium text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/messages"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
              </svg>
              Message physician
            </Link>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-2.5 text-[13px] font-semibold text-[#1f4033] transition-colors hover:bg-white/90"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
              Book consultation
            </button>
          </div>
        </div>

        {/* ── Two-column row ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">

          {/* Bio */}
          <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">About</p>
            <p className="mt-3 text-[14px] leading-relaxed text-[#3d4540]">
              Dr. Emre Yılmaz is a dermatologist with a focus on hair loss, scalp conditions and preventive care.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[#3d4540]">
              He reviews treatment plans, monitors progress photos and provides ongoing guidance throughout your treatment.
            </p>

            <div className="mt-5 border-t border-[#f0ebe2] pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">Your treatment relationship</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Physician since", value: "Jun 6, 2025" },
                  { label: "Last review",     value: "Aug 14, 2025" },
                  { label: "Next review",     value: "Sep 12, 2025" },
                  { label: "Patients",        value: "324 under care" },
                ].map((s) => (
                  <div key={s.label} className="rounded-[12px] bg-[#faf9f6] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">{s.label}</p>
                    <p className="mt-0.5 text-[13px] font-medium text-[#1f3329]">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">

            {/* How reviews work */}
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

            {/* Contact & availability */}
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
              <p className="mt-3 text-[11px] leading-relaxed text-[#9aa396]">
                For urgent medical concerns, contact local emergency services.
              </p>
            </div>

          </div>
        </div>

        {/* ── Treatment reviews ── */}
        <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9aa396]">Treatment reviews</p>
          <p className="mt-0.5 text-[12px] text-[#8a9288]">Physician activity history</p>

          <div className="relative mt-5 pl-6">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#f0ebe2]" />
            <div className="space-y-6">
              {REVIEWS.map((review, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1f4033]">
                    <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" stroke="white" strokeWidth="2.5">
                      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[11px] font-semibold text-[#8a9288]">{review.date}</p>
                  <ul className="mt-1.5 space-y-1">
                    {review.notes.map((note) => (
                      <li key={note} className="text-[13px] leading-relaxed text-[#3d4540]">{note}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
