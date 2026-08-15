"use client";

import { useEffect, useRef, useState, useCallback } from "react";

function TimePicker({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [hStr, mStr] = value.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const isPM = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;

  const update = (newH24: number, newM: number) => onChange(`${String(newH24).padStart(2, "0")}:${String(newM).padStart(2, "0")}`);

  const stepH = (dir: 1 | -1) => { const newH = ((h + dir + 24) % 24); update(newH, m); };
  const stepM = (dir: 1 | -1) => { const newM = ((m + dir * 5 + 60) % 60); update(h, newM); };
  const toggleAMPM = () => { update(isPM ? h - 12 : h + 12, m); };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const display = `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;

  return (
    <div ref={ref} className="relative mt-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-[12px] border border-[#e4e0d8] bg-white px-4 py-3 text-left transition-colors hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="font-title text-[24px] font-medium text-[#1f3329]">{display}</span>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#9aa396]" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-[20px] border border-[#e4e0d8] bg-white shadow-[0_12px_40px_rgba(31,51,41,0.14)]">
          <div className="flex items-center justify-center gap-1 p-4">

            {/* Hour */}
            <div className="flex flex-col items-center gap-1">
              <button type="button" onClick={() => stepH(1)} className="flex h-9 w-12 items-center justify-center rounded-xl bg-[#f0ede8] text-[#3d4540] hover:bg-[#e4e0d8]">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6" strokeLinecap="round" /></svg>
              </button>
              <span className="font-title text-[36px] font-medium leading-none text-[#1f3329] w-14 text-center">{String(h12).padStart(2, "0")}</span>
              <button type="button" onClick={() => stepH(-1)} className="flex h-9 w-12 items-center justify-center rounded-xl bg-[#f0ede8] text-[#3d4540] hover:bg-[#e4e0d8]">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" strokeLinecap="round" /></svg>
              </button>
            </div>

            <span className="font-title text-[32px] font-medium text-[#c8c3ba] pb-1">:</span>

            {/* Minute */}
            <div className="flex flex-col items-center gap-1">
              <button type="button" onClick={() => stepM(1)} className="flex h-9 w-12 items-center justify-center rounded-xl bg-[#f0ede8] text-[#3d4540] hover:bg-[#e4e0d8]">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6" strokeLinecap="round" /></svg>
              </button>
              <span className="font-title text-[36px] font-medium leading-none text-[#1f3329] w-14 text-center">{String(m).padStart(2, "0")}</span>
              <button type="button" onClick={() => stepM(-1)} className="flex h-9 w-12 items-center justify-center rounded-xl bg-[#f0ede8] text-[#3d4540] hover:bg-[#e4e0d8]">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* AM/PM */}
            <div className="ml-2 flex flex-col gap-1.5">
              <button
                type="button" onClick={() => { if (isPM) toggleAMPM(); }}
                className={`w-14 rounded-xl py-2 text-[14px] font-semibold transition-colors ${!isPM ? "bg-[#1f4033] text-white" : "bg-[#f0ede8] text-[#6b7568] hover:bg-[#e4e0d8]"}`}
              >AM</button>
              <button
                type="button" onClick={() => { if (!isPM) toggleAMPM(); }}
                className={`w-14 rounded-xl py-2 text-[14px] font-semibold transition-colors ${isPM ? "bg-[#1f4033] text-white" : "bg-[#f0ede8] text-[#6b7568] hover:bg-[#e4e0d8]"}`}
              >PM</button>
            </div>
          </div>

          <div className="border-t border-[#f0ebe2] p-3">
            <button type="button" onClick={() => setOpen(false)} className="w-full rounded-[12px] bg-[#1f4033] py-2.5 text-[13px] font-semibold text-white hover:bg-[#2a5444]">
              Set reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const titleMd = "font-title font-medium tracking-[0.01em]";
const card = "rounded-[24px] bg-white shadow-[0_2px_16px_rgba(31,51,41,0.05)]";
const cardInner = "rounded-[14px] border border-[#f0ebe2] bg-[#faf9f6] p-3";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// Build dates for 5 weeks ending this week (Mon–Sun)
function buildCalendar(): { date: Date; taken: boolean | null }[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay(); // 0=Sun..6=Sat
  const daysFromMon = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysFromMon);

  const adherence = [true, true, true, true, true, false, true,
                     true, false, true, true, true, true, true,
                     true, true, true, false, true, true, true,
                     true, true, true, true, true, true, false];

  return Array.from({ length: 5 }, (_, w) => {
    const weekMon = new Date(thisMonday);
    weekMon.setDate(thisMonday.getDate() - (4 - w) * 7);
    return Array.from({ length: 7 }, (_, d) => {
      const date = new Date(weekMon);
      date.setDate(weekMon.getDate() + d);
      const isFuture = date > today;
      const isToday = date.getTime() === today.getTime();
      const idx = w * 7 + d;
      return {
        date,
        taken: isFuture ? null : (isToday ? null : (adherence[idx] ?? true)),
      };
    });
  });
}

const CALENDAR = buildCalendar();

function getMonthLabel(): string {
  const months = new Set<string>();
  CALENDAR.forEach((week) =>
    week.forEach(({ date }) =>
      months.add(date.toLocaleString("en-US", { month: "long", year: "numeric" }))
    )
  );
  if (months.size === 1) return [...months][0];
  const first = CALENDAR[0][0].date;
  const last = CALENDAR[4][6].date;
  const m1 = first.toLocaleString("en-US", { month: "long" });
  const m2 = last.toLocaleString("en-US", { month: "long", year: "numeric" });
  return `${m1} – ${m2}`;
}

const THINGS = [
  {
    id: "side-effects",
    label: "Common side effects",
    content: "Topical Finasteride 0.25% is generally well-tolerated. Some patients report mild scalp irritation, dryness, or itching at the application site. Systemic side effects are rare due to the low dose and topical application.",
  },
  {
    id: "contact",
    label: "When to contact your physician",
    content: "Contact Dr. Emre Yilmaz if you experience persistent scalp rash, sexual side effects, chest pain, or mood changes. Also reach out before starting or stopping any other medication.",
  },
  {
    id: "timeline",
    label: "Expected treatment timeline",
    content: "Most patients begin to see reduced hair shedding within 3–6 months. Visible regrowth typically appears between 6–12 months of consistent use. Your next physician review is scheduled for July 12.",
  },
];

const LIFESTYLE = [
  { icon: "🍺", label: "Alcohol",         note: "Moderate consumption is fine. Avoid excess as it can affect treatment efficacy." },
  { icon: "💊", label: "Supplements",     note: "Biotin, zinc, and vitamin D may complement your treatment. Discuss with Dr. Yilmaz before adding." },
  { icon: "🩸", label: "Blood donation",  note: "Inform donation centres you are taking Finasteride. Restrictions may apply." },
];

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TreatmentPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState("21:00");
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState<Set<string>>(new Set(ALL_DAYS));
  const [reminderDropdownOpen, setReminderDropdownOpen] = useState(false);
  const [medications, setMedications] = useState<string[]>(["St. John's Wort"]);
  const [newMed, setNewMed] = useState("");
  const [addingMed, setAddingMed] = useState(false);

  const toggle = (id: string) => setOpenSection((c) => (c === id ? null : id));

  const toggleDay = (day: string) =>
    setReminderDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });

  const reminderLabel =
    reminderDays.size === 7 ? "Every day" :
    reminderDays.size === 0 ? "No days selected" :
    reminderDays.size <= 3
      ? [...reminderDays].join(", ")
      : `${reminderDays.size} days a week`;

  const reminderRef = useRef<HTMLDivElement>(null);
  const closeReminder = useCallback(() => setReminderDropdownOpen(false), []);
  useEffect(() => {
    if (!reminderDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (reminderRef.current && !reminderRef.current.contains(e.target as Node)) closeReminder();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [reminderDropdownOpen, closeReminder]);
  const addMed = () => {
    if (newMed.trim()) {
      setMedications((m) => [...m, newMed.trim()]);
      setNewMed("");
      setAddingMed(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pb-4 pr-1">

      {/* ── Header ── */}
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[12px] font-medium text-[#8a9288]">My Treatment</p>
          <h1 className="font-title text-[28px] font-medium tracking-[-0.03em] text-[#1f3329]">Topical Finasteride</h1>
        </div>
        <span className="rounded-full bg-[#dce8d6] px-3 py-1 text-[12px] font-semibold text-[#3d5c35]">Active</span>
      </div>

      {/* ── Row 1: Overview + Schedule ── */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">

        {/* Overview — dark green hero */}
        <div className="rounded-[24px] bg-[#1f4033] p-5 text-white shadow-[0_8px_32px_rgba(31,64,51,0.18)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">Current prescription</p>
              <h2 className={`${titleMd} mt-1 text-[20px] text-white`}>Topical Finasteride 0.25%</h2>
              <p className="mt-0.5 text-[13px] text-white/60">Approved by Dr. Emre Yilmaz · Jun 6, 2025</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white/80" stroke="currentColor" strokeWidth="1.6">
                <rect x="7" y="3" width="10" height="18" rx="2" />
                <path d="M9 8h6M9 12h6" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Adherence",   value: "92%",   sub: "last 30 days" },
              { label: "Last dose",   value: "Today", sub: "08:15 AM"     },
              { label: "Next review", value: "Jul 12",sub: "Dr. Yilmaz"   },
            ].map((s) => (
              <div key={s.label} className="rounded-[14px] bg-white/10 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">{s.label}</p>
                <p className="mt-1 font-title text-[18px] font-medium text-white">{s.value}</p>
                <p className="text-[11px] text-white/50">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[14px] bg-white/10 p-3">
            <p className="text-[12px] font-semibold text-white/70">Instructions</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">
              Apply a small amount to the affected scalp area once daily. Massage gently until absorbed. Wash hands after application. For best results, apply at the same time each day.
            </p>
          </div>
        </div>

        {/* Schedule — sand */}
        <div className="rounded-[24px] bg-[#ebe6dc] p-5 shadow-[0_2px_16px_rgba(31,51,41,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Treatment schedule</h2>
            <button
              type="button"
              onClick={() => setScheduleEnabled((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${scheduleEnabled ? "bg-[#1f4033]" : "bg-[#d4d0c8]"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${scheduleEnabled ? "left-6" : "left-1"}`} />
            </button>
          </div>
          <p className="mt-1 text-[12px] text-[#8a9288]">Get a daily reminder to take your treatment</p>

          <div ref={reminderRef} className="relative mt-4">
            <div className={`${cardInner} flex items-center justify-between`}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">Reminder days</p>
                <p className="mt-0.5 text-[13px] font-medium text-[#3d4540]">{reminderLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setReminderDropdownOpen((o) => !o)}
                className="rounded-full bg-[#1f4033] px-3 py-1.5 text-[12px] font-semibold text-white"
              >
                Change
              </button>
            </div>

            {reminderDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[16px] border border-[#e4e0d8] bg-white shadow-[0_12px_40px_rgba(31,51,41,0.14)]">
                {ALL_DAYS.map((day, i) => {
                  const checked = reminderDays.has(day);
                  return (
                    <div key={day}>
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[#faf9f6]"
                      >
                        <span className="text-[13px] font-medium text-[#1f3329]">Every {day}</span>
                        {checked && (
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1f4033]" stroke="currentColor" strokeWidth="2.5">
                            <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      {i < ALL_DAYS.length - 1 && <div className="ml-4 h-px bg-[#f0ebe2]" />}
                    </div>
                  );
                })}
                <div className="border-t border-[#f0ebe2] p-3">
                  <button
                    type="button"
                    onClick={() => setReminderDropdownOpen(false)}
                    className="w-full rounded-[12px] bg-[#1f4033] py-2.5 text-[13px] font-semibold text-white hover:bg-[#2a5444]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={`mt-3 ${cardInner}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">Reminder time</p>
            <TimePicker value={scheduleTime} onChange={setScheduleTime} disabled={!scheduleEnabled} />
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-[#9aa396]">
            Hiros will send a notification at this time as a reminder to apply your treatment.
          </p>
        </div>
      </div>

      {/* ── Row 2: Things to Know + Right column ── */}
      <div className="grid grid-cols-[1fr_1fr] gap-4">

        {/* Things to know */}
        <div className={`${card} p-5`}>
          <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Treatment information</h2>
          <p className="mt-0.5 text-[12px] text-[#8a9288]">About Topical Finasteride 0.25%</p>

          <div className="mt-4 space-y-2">
            {THINGS.map((t) => (
              <div key={t.id} className="overflow-hidden rounded-[16px] border border-[#f0ebe2]">
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  className="flex w-full items-center gap-3 bg-[#faf9f6] px-4 py-3 text-left transition-colors hover:bg-[#f4f1ec]"
                >
                  <span className="flex-1 text-[13px] font-semibold text-[#3d4540]">{t.label}</span>
                  <svg
                    viewBox="0 0 24 24" fill="none"
                    className={`h-4 w-4 shrink-0 text-[#9aa396] transition-transform ${openSection === t.id ? "rotate-180" : ""}`}
                    stroke="currentColor" strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openSection === t.id && (
                  <div className="border-t border-[#f0ebe2] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#5a6458]">
                    {t.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          <h3 className={`${titleMd} mt-5 text-[15px] text-[#1f3329]`}>Lifestyle considerations</h3>
          <div className="mt-3 space-y-2">
            {LIFESTYLE.map((l) => (
              <div key={l.label} className={`${cardInner} flex gap-3`}>
                <span className="text-[18px]">{l.icon}</span>
                <div>
                  <p className="text-[12px] font-semibold text-[#3d4540]">{l.label}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-[#6b7568]">{l.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Interactions */}
          <div className={`${card} p-5`}>
            <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Interactions & Precautions</h2>
            <p className="mt-0.5 text-[12px] text-[#8a9288]">Are you taking any other medications?</p>

            <div className="mt-3 space-y-2">
              {medications.map((med) => {
                const flagged = med === "St. John's Wort";
                return (
                  <div key={med} className={`flex items-start gap-2.5 rounded-[14px] border p-3 ${flagged ? "border-[#f5d8c8] bg-[#fdf4ef]" : "border-[#f0ebe2] bg-[#faf9f6]"}`}>
                    <span className="mt-0.5 text-[14px]">{flagged ? "⚠️" : "✓"}</span>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#3d4540]">{med}</p>
                      {flagged && <p className="mt-0.5 text-[12px] text-[#a85f3f]">May reduce effectiveness. Inform your physician.</p>}
                    </div>
                    <button type="button" onClick={() => setMedications((m) => m.filter((x) => x !== med))} className="text-[#c0bab2] hover:text-[#a85f3f]">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {addingMed ? (
              <div className="mt-3 flex gap-2">
                <input
                  type="text" value={newMed} onChange={(e) => setNewMed(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMed()}
                  placeholder="Medication name…" autoFocus
                  className="flex-1 rounded-[12px] border border-[#e4e0d8] bg-[#faf9f6] px-3 py-2 text-[13px] text-[#3d4540] outline-none placeholder:text-[#b0aba3]"
                />
                <button type="button" onClick={addMed} className="rounded-[12px] bg-[#1f4033] px-3 py-2 text-[13px] font-semibold text-white">Add</button>
                <button type="button" onClick={() => setAddingMed(false)} className="rounded-[12px] border border-[#e4e0d8] px-3 py-2 text-[13px] text-[#6b7568]">✕</button>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button" onClick={() => setAddingMed(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-[#c8c3ba] py-2.5 text-[13px] font-medium text-[#6b7568] transition-colors hover:border-[#1f4033] hover:text-[#1f4033]"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                  Add another medication
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-1.5 rounded-[14px] bg-[#edeae5] py-2.5 text-[13px] font-medium text-[#3d4540] transition-colors hover:bg-[#e4e0d8]"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" strokeLinecap="round" /></svg>
                  Check medication interactions
                </button>
              </div>
            )}
          </div>

          {/* Dose log */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`${titleMd} text-[18px] text-[#1f3329]`}>Treatment history</h2>
                <p className="mt-0.5 text-[12px] text-[#8a9288]">{getMonthLabel()}</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#8a9288]">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#4a6b42]" />Taken</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f3ddd0]" />Missed</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 grid grid-cols-7 gap-1.5">
                {DAYS.map((d, i) => (
                  <div key={i} className="text-center text-[11px] font-semibold text-[#9aa396]">{d}</div>
                ))}
              </div>
              <div className="space-y-1.5">
                {CALENDAR.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1.5">
                    {week.map(({ date, taken }, di) => (
                      <div
                        key={di}
                        className={`flex h-8 items-center justify-center rounded-lg text-[10px] font-semibold ${
                          taken === true
                            ? "bg-[#4a6b42] text-white"
                            : taken === false
                            ? "border border-[#e8c8b8] bg-[#f3ddd0] text-[#a85f3f]"
                            : "bg-[#edeae5] text-[#b0aba3]"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 text-[11px] text-[#9aa396]">Showing last 5 weeks · 92% adherence</p>
          </div>
        </div>
      </div>
    </div>
  );
}
