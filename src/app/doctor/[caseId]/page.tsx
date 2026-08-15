"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  confidenceFromScore,
  countFlags,
  riskStyles,
  type FlagLevel,
  type PatientCase,
  type PatientPhoto,
} from "../data";
import { getStoredCase, subscribeStoredCases, updateStoredCase } from "../store";
import { generateIntakeSummary } from "../triage";
import { useRouter } from "next/navigation";

/* ---------------- Top bar ---------------- */

function TopBar({ caseItem }: { caseItem: PatientCase }) {
  const styles = riskStyles[caseItem.risk];
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-4">
          <Link
            href="/doctor"
            className="flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[13.5px] font-semibold text-black/55 transition hover:bg-black/[0.04] hover:text-[#2b2a28]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="font-[var(--font-geist-mono)] text-[15px] font-semibold tracking-[-0.01em] text-[#1f241b]">
              {caseItem.id}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles.badge}`}>
              {caseItem.risk}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-medium text-[#2b2a28] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-black/[0.02]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M12 5c4.5 0 8 4 9 7-1 3-4.5 7-9 7s-8-4-9-7c1-3 4.5-7 9-7Z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span className="text-black/45">View as:</span>
            <span className="font-semibold">Doctor Portal</span>
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-black/40" aria-hidden="true">
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] font-semibold text-[#2b2a28] hover:bg-black/[0.04]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-black/45" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21M12 3C9.5 5.4 8.2 8.6 8.2 12S9.5 18.6 12 21" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            TR
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Small building blocks ---------------- */

function SectionCard({
  title,
  icon,
  children,
  right,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-black/70">{icon}</span>
          <h2 className="font-title text-[17px] font-semibold tracking-[-0.02em] text-[#1f241b]">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function FlagPill({ level, count, onClick }: { level: FlagLevel; count: number; onClick?: () => void }) {
  const styles =
    level === "red"
      ? "bg-[#fbcec5] text-[#a81d12]"
      : "bg-[#fbe0b8] text-[#9a4e07]";
  
  const content = (
    <>
      <span className={`h-1.5 w-1.5 rounded-full ${level === "red" ? "bg-[#d6342c]" : "bg-[#ec8a1e]"}`} />
      {count} {level === "red" ? "high-risk" : count === 1 ? "Item Requires Review" : "Items Require Review"}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition hover:brightness-95 ${styles}`}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${styles}`}>
      {content}
    </span>
  );
}

function SummaryField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-black/[0.05] bg-[#fafbf9] px-4 py-3.5">
      <div className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-black/40">
        <span className="text-black/35">{icon}</span>
        {label}
      </div>
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1f241b]">{value}</p>
    </div>
  );
}

/* ---------------- Icons ---------------- */

const icons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19c.8-3.2 3.6-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 3v5h5M9 13h6M9 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  pill: (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(45 12 12)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 9l6 6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M12 3 5 6v6c0 4 3 6.5 7 9 4-2.5 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="m4 17 4.5-4 3 2.5L16 11l4 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  reason: (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  age: (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19c.8-3 3.6-4.8 7-4.8s6.2 1.8 7 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ---------------- Medical Answers (collapsible) ---------------- */

function MedicalAnswers({ caseItem }: { caseItem: PatientCase }) {
  const [open, setOpen] = useState(false);
  const flags = countFlags(caseItem);
  const totalFlags = flags.red + flags.orange;

  return (
    <section className="overflow-hidden rounded-[18px] border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-black/70">{icons.doc}</span>
          <h2 className="font-title text-[17px] font-semibold tracking-[-0.02em] text-[#1f241b]">Medical Answers</h2>
          <span className="text-[13px] font-medium text-black/40">({caseItem.answers.length} questions)</span>
        </div>
        <div className="flex items-center gap-2.5">
          {flags.red > 0 ? <FlagPill level="red" count={flags.red} /> : null}
          {flags.orange > 0 ? <FlagPill level="orange" count={flags.orange} /> : null}
          {totalFlags === 0 ? (
            <span className="rounded-full bg-[#e6f1e2] px-2.5 py-1 text-[11.5px] font-semibold text-[#3f5f35]">
              No flags
            </span>
          ) : null}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`h-5 w-5 text-black/40 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open ? (
        <div className="border-t border-black/[0.06] px-6 py-2">
          {caseItem.answers.map((a, i) => (
            <div
              key={a.question}
              className={`py-4 ${i !== caseItem.answers.length - 1 ? "border-b border-black/[0.05]" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[12.5px] font-medium text-black/40">{a.question}</p>
                {a.flag ? (
                  <span
                    className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${a.flag === "red" ? "bg-[#d6342c]" : "bg-[#ec8a1e]"}`}
                  />
                ) : null}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[15px] font-medium text-[#1f241b]">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-black/30" aria-hidden="true">
                  <path d="M5 12h13M13 7l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {a.answer}
              </div>
              {a.flagNote ? (
                <p className={`mt-1.5 text-[12.5px] font-medium ${a.flag === "red" ? "text-[#b8503a]" : "text-[#bd7637]"}`}>
                  {a.flagNote}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* ---------------- Triage Assessment ---------------- */

function TriageAssessment({ caseItem, highlight }: { caseItem: PatientCase; highlight: boolean }) {
  const styles = riskStyles[caseItem.risk];
  const redFindings = caseItem.findings.filter((f) => f.level === "red");
  const orangeFindings = caseItem.findings.filter((f) => f.level === "orange");

  return (
    <SectionCard
      title="Triage Assessment"
      icon={icons.shield}
      right={
        <span className="text-[13px] font-medium text-black/45">
          AGA Score: <span className="font-bold text-[#1f241b]">{caseItem.agaScore}/20</span>
        </span>
      }
    >
      <div className="mb-5 flex items-center gap-2.5">
        <span className={`rounded-full px-3.5 py-1 text-[13px] font-semibold ${styles.badge}`}>{caseItem.risk}</span>
        <span className="rounded-full border border-black/10 px-3 py-1 text-[12px] font-semibold text-black/55">
          Confidence: {confidenceFromScore(caseItem.agaScore)}
        </span>
      </div>

      {redFindings.length > 0 ? (
        <div className="mb-4 rounded-[14px] border-2 border-[#e8917f] bg-[#fde7e2] p-4">
          <div className="mb-2 flex items-center gap-2 text-[14px] font-bold text-[#a81d12]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M12 3 2.5 19.5h19L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M12 10v3.5M12 16.5h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            High-Risk Findings (require escalation)
          </div>
          <ul className="space-y-2 border-l-[3px] border-[#d6342c] pl-3">
            {redFindings.map((f) => (
              <li key={f.point}>
                <p className="text-[13.5px] font-semibold text-[#1f241b]">• {f.point}</p>
                <p className="text-[12.5px] font-medium text-[#a81d12]">{f.note}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {orangeFindings.length > 0 ? (
        <div className={`mb-4 rounded-[14px] border-2 border-[#eac06a] bg-[#fdf3da] p-4 transition-all duration-500 ${highlight ? "ring-4 ring-[#ec8a1e]/30" : ""}`}>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-bold text-[#9a4e07]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M12 3 2.5 19.5h19L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M12 10v3.5M12 16.5h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Findings Requiring Physician Review
          </div>
          <ul className="space-y-2 border-l-[3px] border-[#ec8a1e] pl-3">
            {orangeFindings.map((f) => (
              <li key={f.point}>
                <p className="text-[13.5px] font-semibold text-[#1f241b]">• {f.point}</p>
                <p className="text-[12.5px] font-medium text-[#9a4e07]">{f.note}</p>
              </li>
            ))}
          </ul>
          {caseItem.triageNote ? (
            <p className="mt-3 border-t border-[#efe2bf] pt-3 text-[12px] font-medium italic text-black/45">
              Note: {caseItem.triageNote}
            </p>
          ) : null}
        </div>
      ) : null}

      {caseItem.findings.length === 0 ? (
        <div className="mb-4 flex items-center gap-2.5 rounded-[14px] border border-[#cfe2c5] bg-[#eef5e9] p-4 text-[13.5px] font-medium text-[#3f5f35]">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          No concerns flagged. Pattern is consistent with androgenetic alopecia.
        </div>
      ) : (
        <p className="text-[12.5px] font-medium italic text-black/45">
          System flags indicate additional physician review is required.
        </p>
      )}

      <div className="mt-5 border-t border-black/[0.06] pt-4">
        <p className="mb-1 text-[12px] font-semibold text-black/55">System Notice:</p>
        <p className="text-[12px] leading-[1.5] text-black/40">
          This assessment is generated automatically from patient-reported information and images. It does not constitute
          a diagnosis or treatment recommendation. Final clinical decisions are made solely by the reviewing physician.
        </p>
      </div>
    </SectionCard>
  );
}

/* ---------------- Doctor Actions (sticky) ---------------- */

type ActionKey = "approve" | "info" | "decline";

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoctorActions({ caseItem }: { caseItem: PatientCase }) {
  const router = useRouter();
  const [active, setActive] = useState<ActionKey | null>(null);

  // Approve
  const [treatmentType, setTreatmentType] = useState("");
  const [otherTreatment, setOtherTreatment] = useState("");
  const [followUpSchedule, setFollowUpSchedule] = useState("");
  const [approveNote, setApproveNote] = useState("");

  // Request more info
  const [infoReason, setInfoReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Decline
  const [declineReason, setDeclineReason] = useState("");
  const [declineNextStep, setDeclineNextStep] = useState("");

  const toggle = (key: ActionKey) => setActive((cur) => (cur === key ? null : key));

  const handleApprove = () => {
    updateStoredCase(caseItem.id, {
      tab: "approved",
      status: "Approved",
    });
    router.push("/doctor");
  };

  const handleRequestInfo = () => {
    updateStoredCase(caseItem.id, {
      status: "Requested more info",
    });
    router.push("/doctor");
  };

  const handleDecline = () => {
    updateStoredCase(caseItem.id, {
      tab: "declined",
      status: "Declined",
    });
    router.push("/doctor");
  };

  const actionBtn = (key: ActionKey, idle: string, activeCls: string) =>
    `flex w-full items-center gap-2.5 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition ${
      active === key ? activeCls : idle
    }`;

  const fieldLabel = "mb-1.5 block text-[13px] font-semibold text-[#1f241b]";
  const textarea =
    "min-h-[88px] w-full resize-y rounded-[12px] border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-[#2b2a28] outline-none placeholder:text-black/35 focus:border-[#8ea57a]";
  const selectCls =
    "h-11 w-full appearance-none rounded-[12px] border border-black/10 bg-white px-3.5 pr-9 text-[13.5px] font-medium text-[#2b2a28] outline-none focus:border-[#8ea57a]";

  return (
    <aside className="lg:sticky lg:top-[84px] lg:self-start">
      <div className="rounded-[18px] border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="mb-5 font-title text-[17px] font-semibold tracking-[-0.02em] text-[#1f241b]">Doctor Actions</h2>
        <div className="space-y-2.5">
          {/* Approve */}
          <button
            onClick={() => toggle("approve")}
            className={actionBtn("approve", "bg-[#dff0d8] text-[#3f5f35] hover:bg-[#d3ebc9]", "bg-[#1f9d63] text-white")}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
              <path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Approve for Treatment
          </button>

          {active === "approve" ? (
            <div className="space-y-4 rounded-[14px] border border-[#cfe6d3] bg-[#eaf5ec] p-4">
              <div>
                <label className={fieldLabel}>Treatment Type *</label>
                <div className="relative">
                  <select value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)} className={selectCls}>
                    <option value="" disabled>
                      Select treatment…
                    </option>
                    <option>Topical Finasteride</option>
                    <option>Topical Minoxidil</option>
                    <option>Topical Finasteride + Minoxidil</option>
                    <option>Oral Finasteride</option>
                    <option>Other</option>
                  </select>
                  <Chevron />
                </div>
              </div>

              {treatmentType === "Other" ? (
                <div>
                  <label className={fieldLabel}>Specify treatment *</label>
                  <input
                    value={otherTreatment}
                    onChange={(e) => setOtherTreatment(e.target.value)}
                    placeholder="Enter treatment…"
                    className="h-11 w-full rounded-[12px] border border-black/10 bg-white px-3.5 text-[13.5px] font-medium text-[#2b2a28] outline-none placeholder:text-black/35 focus:border-[#8ea57a]"
                  />
                </div>
              ) : null}

              <div>
                <label className={fieldLabel}>Follow-up *</label>
                <div className="relative">
                  <select value={followUpSchedule} onChange={(e) => setFollowUpSchedule(e.target.value)} className={selectCls}>
                    <option value="" disabled>
                      Select follow-up schedule…
                    </option>
                    <option>1 month</option>
                    <option>3 months</option>
                    <option>6 months</option>
                  </select>
                  <Chevron />
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Note (optional)</label>
                <textarea
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  placeholder="Optional note…"
                  className={textarea}
                />
              </div>

              <button
                onClick={handleApprove}
                disabled={!treatmentType || (treatmentType === "Other" && !otherTreatment.trim()) || !followUpSchedule}
                className="w-full rounded-[12px] bg-[#1f9d63] py-3 text-[14px] font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm Approval
              </button>
            </div>
          ) : null}

          {/* Request more info */}
          <button
            onClick={() => toggle("info")}
            className={actionBtn("info", "bg-[#dde8f6] text-[#3a5a86] hover:bg-[#cfe0f2]", "bg-[#3b6fe0] text-white")}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
              <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            Request More Info
          </button>

          {active === "info" ? (
            <div className="space-y-4 rounded-[14px] border border-[#cdddf5] bg-[#eef3fb] p-4">
              <div>
                <label className={fieldLabel}>Reason *</label>
                <div className="relative">
                  <select value={infoReason} onChange={(e) => setInfoReason(e.target.value)} className={selectCls}>
                    <option value="" disabled>
                      Select reason…
                    </option>
                    <option>Better photos needed</option>
                    <option>Clarify medications</option>
                    <option>Clarify symptoms</option>
                    <option>Clarify medical history</option>
                    <option>Other</option>
                  </select>
                  <Chevron />
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Additional message (optional)</label>
                <textarea
                  value={infoMessage}
                  onChange={(e) => setInfoMessage(e.target.value)}
                  placeholder="Optional message to patient…"
                  className={textarea}
                />
              </div>

              <button
                onClick={handleRequestInfo}
                disabled={!infoReason}
                className="w-full rounded-[12px] bg-[#3b6fe0] py-3 text-[14px] font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send Request
              </button>
            </div>
          ) : null}

          {/* Decline */}
          <button
            onClick={() => toggle("decline")}
            className={actionBtn("decline", "bg-[#f8dcd6] text-[#b8503a] hover:bg-[#f3cec6]", "bg-[#d6342c] text-white")}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
              <path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Decline Case
          </button>

          {active === "decline" ? (
            <div className="space-y-4 rounded-[14px] border border-[#f1cabf] bg-[#fdf1ee] p-4">
              <div>
                <label className={fieldLabel}>Decline reason (internal notes) *</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Reason…"
                  className={textarea}
                />
              </div>

              <div>
                <label className={fieldLabel}>Recommended next step *</label>
                <div className="relative">
                  <select value={declineNextStep} onChange={(e) => setDeclineNextStep(e.target.value)} className={selectCls}>
                    <option value="" disabled>
                      Select…
                    </option>
                    <option>In-person medical consultation</option>
                    <option>Video consultation</option>
                    <option>Phone consultation</option>
                    <option>Written explanation only</option>
                  </select>
                  <Chevron />
                </div>
              </div>

              <button
                onClick={handleDecline}
                disabled={!declineReason.trim() || !declineNextStep}
                className="w-full rounded-[12px] bg-[#d6342c] py-3 text-[14px] font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-6 border-t border-black/[0.06] pt-5">
          <p className="mb-2 text-[13px] font-semibold text-black/55">Override Triage</p>
          <div className="relative">
            <select defaultValue="" className={selectCls}>
              <option value="" disabled>
                Override to…
              </option>
              <option value="Green">Green — low risk</option>
              <option value="Orange">Orange — needs review</option>
              <option value="Red">Red — escalate</option>
            </select>
            <Chevron />
          </div>
        </div>
      </div>

      <p className="mt-3 px-1 text-[11.5px] font-medium text-black/35">
        Case {caseItem.id} · {caseItem.status} {caseItem.date}
      </p>
    </aside>
  );
}

/* ---------------- Patient photos (thumbnails + lightbox) ---------------- */

function PatientPhotos({ photos }: { photos: PatientPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const open = openIndex !== null;

  const prev = () => {
    setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };
  const next = () => {
    setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.5, 3));
  const zoomOut = () => {
    setZoom((z) => {
      const newZoom = Math.max(z - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") {
        setOpenIndex(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      } else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, photos.length]);

  return (
    <div className="mt-5 border-t border-black/[0.06] pt-4">
      <p className="mb-2.5 text-[12px] font-medium text-black/40">Photos</p>
      <div className="flex flex-wrap gap-4">
        {photos.map((p, i) => (
          <button key={p.label} onClick={() => setOpenIndex(i)} className="group flex flex-col items-center gap-1.5">
            <div className="relative h-14 w-14 overflow-hidden rounded-[10px] border border-black/10">
              <Image src={p.src} alt={p.label} fill unoptimized className="object-cover transition group-hover:scale-105" sizes="56px" />
            </div>
            <span className="text-[11px] font-medium text-black/45">{p.label}</span>
          </button>
        ))}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          onClick={() => {
            setOpenIndex(null);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
          }}
        >
          <button
            onClick={() => {
              setOpenIndex(null);
              setZoom(1);
            }}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="absolute left-5 top-5 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={zoomIn}
              disabled={zoom >= 3}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={zoomOut}
              disabled={zoom <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              disabled={zoom === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-[11px] font-semibold transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Reset zoom"
            >
              1:1
            </button>
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-[11px] font-semibold">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-8"
            aria-label="Previous photo"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
              <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <div 
              className="relative h-[85vh] w-[90vw] max-w-[1400px] overflow-hidden rounded-[18px] border border-white/10 bg-black/20"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <div 
                className="h-full w-full flex items-center justify-center"
                style={{ 
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.2s',
                  transformOrigin: 'center',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Image 
                  src={photos[openIndex].src} 
                  alt={photos[openIndex].label} 
                  width={1400}
                  height={1400}
                  unoptimized 
                  className="max-h-full max-w-full object-contain pointer-events-none select-none" 
                  draggable={false}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[15px] font-semibold text-white">
                {photos[openIndex].label}
              </p>
              <span className="text-[13px] font-medium text-white/55">
                {openIndex + 1} / {photos.length}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8"
            aria-label="Next photo"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
              <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Clinical Record ---------------- */

function RecordCard({
  title,
  icon,
  subtitle,
  right,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-black/70">{icon}</span>
          <h2 className="font-title text-[17px] font-semibold tracking-[-0.02em] text-[#1f241b]">{title}</h2>
        </div>
        {right}
      </div>
      {subtitle ? <p className="mb-4 text-[12.5px] font-medium text-black/40">{subtitle}</p> : <div className="mb-4" />}
      {children}
    </section>
  );
}

function RecordRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-[10px] bg-[#f7f8f6] px-4 py-2.5">
      <p className="text-[12px] font-medium text-black/45">{label}</p>
      <p className={`text-[14px] ${muted ? "font-medium italic text-black/40" : "font-semibold text-[#1f241b]"}`}>{value}</p>
    </div>
  );
}

function SubHeading({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="mb-2.5 mt-5 flex items-center gap-2 text-[13.5px] font-semibold text-[#1f241b] first:mt-0">
      <span aria-hidden="true">{icon}</span>
      {children}
    </p>
  );
}

function ClinicalRecord({ caseItem }: { caseItem: PatientCase }) {
  const confidence = confidenceFromScore(caseItem.agaScore);
  const styles = riskStyles[caseItem.risk];

  const firstSubmitted = `${caseItem.date}, 1:59:42 PM`;
  const lastActivity = `${caseItem.date}, 11:59:42 AM`;

  const likelihoodLabel =
    caseItem.agaScore >= 20 ? "High likelihood" : caseItem.agaScore >= 15 ? "Moderate likelihood" : "Low likelihood";
  const triageProcessing =
    caseItem.risk === "Green" ? "Routine processing" : caseItem.risk === "Orange" ? "Needs physician review" : "Escalate for review";

  const keyFactors = [
    "Multiple findings consistent with classic androgenetic alopecia pattern",
    "Strong family history present",
    "Typical AGA pattern (temples/crown)",
  ];

  const consents = [
    { key: "emergency_notice", version: "v1.0", ts: "5/21/2026, 8:13:41 PM" },
    { key: "telehealth_informed", version: "v1.0", ts: "5/21/2026, 8:13:40 PM" },
    { key: "kvkk_data_processing", version: "v1.0", ts: "5/21/2026, 8:13:39 PM" },
  ];

  const recordPhotoLabels = ["front_hairline", "crown_top", "scalp_parting"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <RecordCard
        title="Patient Clinical Record"
        icon={icons.shield}
        subtitle="Generated from immutable system records."
        right={
          <button className="flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-[#3f5f35] to-[#5f7f4f] px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_6px_16px_rgba(63,95,53,0.25)] transition hover:brightness-105">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M12 4v10m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 18h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Download Full Patient Record
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-medium text-black/45">Case Number</p>
            <p className="font-[var(--font-geist-mono)] text-[15px] font-semibold tracking-[-0.01em] text-[#1f241b]">{caseItem.id}</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-black/45">Status</p>
            <span className="mt-0.5 inline-block rounded-full bg-[#1f241b] px-2.5 py-0.5 text-[11px] font-semibold text-white">
              {caseItem.status}
            </span>
          </div>
          <div>
            <p className="text-[12px] font-medium text-black/45">First Submitted</p>
            <p className="text-[14px] font-semibold text-[#1f241b]">{firstSubmitted}</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-black/45">Last Activity</p>
            <p className="text-[14px] font-semibold text-[#1f241b]">{lastActivity}</p>
          </div>
        </div>
      </RecordCard>

      {/* Patient-Reported Intake */}
      <RecordCard title="Patient-Reported Intake (at submission)" icon={icons.user}>
        <div className="mb-4 rounded-[12px] border border-[#cdddf5] bg-[#eef3fb] px-4 py-3">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3a5a86]">🔒 Immutable Record</p>
          <p className="mt-0.5 text-[12.5px] font-medium text-[#3a5a86]/80">
            This information was reported by the patient and is immutable after submission. Physician decision is based on this data.
          </p>
        </div>

        <SubHeading icon="📋">Hair Loss History</SubHeading>
        <div className="space-y-2">
          {caseItem.answers.map((a) => (
            <RecordRow key={a.question} label={a.question} value={a.answer} />
          ))}
        </div>

        <SubHeading icon="🔗">Medical Conditions & Medications</SubHeading>
        <div className="space-y-2">
          <RecordRow
            label="Current medications"
            value={caseItem.currentMedications?.length ? caseItem.currentMedications.join(", ") : "None reported"}
            muted={!caseItem.currentMedications?.length}
          />
          <RecordRow
            label="Medical conditions"
            value={caseItem.medicalConditions?.length ? caseItem.medicalConditions.join(", ") : "None reported"}
            muted={!caseItem.medicalConditions?.length}
          />
        </div>

        <SubHeading icon="💊">Previous Treatments</SubHeading>
        {caseItem.previousTreatments?.length ? (
          <div className="space-y-2">
            {caseItem.previousTreatments.map((t) => (
              <RecordRow key={t.category} label={t.category} value={t.detail ?? "Reported"} />
            ))}
          </div>
        ) : (
          <div className="rounded-[10px] bg-[#f7f8f6] px-4 py-2.5 text-[13.5px] font-medium italic text-black/40">
            No previous treatments reported
          </div>
        )}

        <SubHeading icon="🧠">Psychosocial Factors</SubHeading>
        <div className="rounded-[10px] bg-[#f7f8f6] px-4 py-2.5 text-[13.5px] font-medium italic text-black/40">
          None reported
        </div>
      </RecordCard>

      {/* Triage Basis */}
      <RecordCard
        title="Triage Basis (System-Derived)"
        icon={icons.shield}
        subtitle="This assessment is automated scoring and flagging based on patient-reported data."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] border border-black/[0.06] bg-[#fafbf9] p-4">
            <p className="text-[12px] font-medium text-black/45">AGA Likelihood Score</p>
            <p className="my-0.5 text-[26px] font-bold tracking-[-0.02em] text-[#1f241b]">{caseItem.agaScore}/20</p>
            <p className="text-[12px] font-medium text-black/45">{likelihoodLabel}</p>
          </div>
          <div className="rounded-[14px] border border-black/[0.06] bg-[#fafbf9] p-4">
            <p className="text-[12px] font-medium text-black/45">Triage Color</p>
            <span className={`my-1 inline-block rounded-[8px] px-3 py-1 text-[15px] font-bold ${styles.badge}`}>{caseItem.risk}</span>
            <p className="text-[12px] font-medium text-black/45">{triageProcessing}</p>
          </div>
          <div className="rounded-[14px] border border-black/[0.06] bg-[#fafbf9] p-4">
            <p className="text-[12px] font-medium text-black/45">System Confidence</p>
            <p className="my-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#1f241b]">{confidence}</p>
            <p className="text-[12px] font-medium text-black/45">Pattern consistency</p>
          </div>
        </div>

        <div className="mt-4 rounded-[14px] border border-black/[0.06] bg-white p-4">
          <p className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold text-[#1f241b]">🔍 Key Contributing Factors (Plain Language)</p>
          <ul className="space-y-1.5">
            {keyFactors.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13.5px] font-medium text-[#2b2a28]">
                <span className="mt-0.5 text-[#3f5f35]">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </RecordCard>

      {/* Consents */}
      <RecordCard title="Consents & Legal Acknowledgements" icon={icons.doc} subtitle="All patient consents with timestamps.">
        <div className="space-y-2">
          {consents.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-3 rounded-[10px] bg-[#f7f8f6] px-4 py-2.5">
              <div>
                <p className="font-[var(--font-geist-mono)] text-[13.5px] font-semibold text-[#1f241b]">{c.key}</p>
                <p className="text-[11.5px] font-medium text-black/40">{c.version}</p>
              </div>
              <div className="text-right">
                <p className="text-[12.5px] font-semibold text-[#3f5f35]">✓ Accepted</p>
                <p className="text-[11.5px] font-medium text-black/40">{c.ts}</p>
              </div>
            </div>
          ))}
        </div>
      </RecordCard>

      {/* Photos */}
      <RecordCard
        title="Patient-Submitted Photos"
        icon={icons.photo}
        subtitle="Photos uploaded at time of submission. Physician decision is based on these images."
      >
        <div className="flex flex-wrap gap-3">
          {caseItem.photos.map((p, i) => (
            <div key={p.label} className="relative h-36 w-36 overflow-hidden rounded-[14px] border border-black/[0.06]">
              <Image src={p.src} alt={p.label} fill unoptimized className="object-cover" sizes="144px" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 py-2 font-[var(--font-geist-mono)] text-[12px] font-semibold text-white">
                {recordPhotoLabels[i] ?? p.label}
              </span>
            </div>
          ))}
        </div>
      </RecordCard>

      {/* Audit Trail */}
      <RecordCard
        title="Audit Trail (Immutable)"
        icon={icons.shield}
        subtitle="Chronological, append-only record of all actions related to this case. This record is immutable and cannot be deleted."
      >
        <div className="space-y-3">
          <div className="rounded-[12px] border border-[#cfe6d3] border-l-[3px] border-l-[#5f7f4f] bg-[#f1f8ef] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-[#1f241b]">
                <span className="text-black/35">#2</span> Intake submitted
              </p>
              <p className="text-[12px] font-medium text-black/40">{caseItem.date}, 11:59:43 AM</p>
            </div>
            <span className="mt-1.5 inline-block rounded-full bg-black/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-black/55">Patient</span>
            <div className="mt-3 rounded-[10px] border border-black/[0.05] bg-white p-3 font-[var(--font-geist-mono)] text-[12.5px] leading-relaxed text-[#2b2a28]">
              <p>aga_score: {caseItem.agaScore}</p>
              <p>triage_color: {caseItem.risk}</p>
              <p>system_confidence: {confidence}</p>
              <p>snapshot_created: true</p>
              <p>total_answers: {caseItem.answers.length}</p>
              <p>total_photos: {caseItem.photos.length}</p>
            </div>
          </div>

          <div className="rounded-[12px] border border-black/10 border-l-[3px] border-l-black/25 bg-[#f7f8f6] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-[#1f241b]">
                <span className="text-black/35">#1</span> Case created
              </p>
              <p className="text-[12px] font-medium text-black/40">5/21/2026, 6:13:05 PM</p>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-black/55">Patient</span>
              <span className="font-[var(--font-geist-mono)] text-[11.5px] font-medium text-black/35">6a0f4b3088e28cbc94ac887b</span>
            </div>
            <div className="mt-3 rounded-[10px] border border-black/[0.05] bg-white p-3 font-[var(--font-geist-mono)] text-[12.5px] text-[#2b2a28]">
              <p>demo: true</p>
            </div>
          </div>
        </div>
      </RecordCard>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function CaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const [activeTab, setActiveTab] = useState<"review" | "record">("review");
  const [caseItem, setCaseItem] = useState<PatientCase | null | undefined>(undefined);
  const [highlightTriage, setHighlightTriage] = useState(false);

  useEffect(() => {
    const load = () => setCaseItem(getStoredCase(params.caseId) ?? null);
    load();
    return subscribeStoredCases(load);
  }, [params.caseId]);

  if (caseItem === undefined) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f5f3] text-[14px] font-medium text-black/40">
        Loading case…
      </div>
    );
  }

  if (caseItem === null) {
    notFound();
  }

  const flags = countFlags(caseItem);
  const totalFlags = flags.red + flags.orange;
  const styles = riskStyles[caseItem.risk];

  const scrollToTriage = () => {
    const triageSection = document.getElementById("triage-assessment");
    if (triageSection) {
      triageSection.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightTriage(true);
      setTimeout(() => setHighlightTriage(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f3] font-[var(--font-dm-sans)] text-[#2b2a28]">
      <TopBar caseItem={caseItem} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Sub tabs */}
        <div className="mb-6 flex items-center gap-2.5">
          {(["review", "record"] as const).map((t) => {
            const active = t === activeTab;
            const label = t === "review" ? "Case Review" : "Clinical Record";
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
                  active
                    ? "bg-gradient-to-r from-[#3f5f35] to-[#5f7f4f] text-white shadow-[0_6px_16px_rgba(63,95,53,0.25)]"
                    : "border border-black/10 bg-white text-[#2b2a28] hover:bg-black/[0.02]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === "record" ? (
          <ClinicalRecord caseItem={caseItem} />
        ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Patient Summary */}
            <SectionCard
              title="Patient Summary"
              icon={icons.user}
              right={
                <div className="flex items-center gap-2">
                  {flags.red > 0 ? <FlagPill level="red" count={flags.red} onClick={scrollToTriage} /> : null}
                  {flags.orange > 0 ? <FlagPill level="orange" count={flags.orange} onClick={scrollToTriage} /> : null}
                </div>
              }
            >
              <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[14px] border border-black/[0.05] bg-[#fafbf9] px-4 py-3.5">
                <span className={`h-9 w-1.5 rounded-full ${styles.bar}`} />
                <div className="flex-1">
                  <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1f241b]">{caseItem.firstName}</p>
                  <p className="text-[12.5px] font-medium text-black/45">
                    Patient · {caseItem.ageRange === "Not provided" ? "Age unknown" : `${caseItem.ageRange} years`}
                  </p>
                  <p className="mt-2 text-[12px] leading-[1.5] text-black/55">{generateIntakeSummary(caseItem)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-black/40">Triage score</p>
                  <p className="text-[15px] font-bold text-[#1f241b]">
                    {caseItem.agaScore}/20{" "}
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles.badge}`}>
                      {caseItem.risk}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SummaryField icon={icons.reason} label="Reason for consultation" value={caseItem.reason} />
                <SummaryField icon={icons.age} label="Age group" value={caseItem.ageRange === "Not provided" ? "Unknown" : `${caseItem.ageRange} years`} />
                <SummaryField icon={icons.pin} label="Location" value={caseItem.location} />
                <SummaryField icon={icons.clock} label="Reported onset" value={caseItem.reportedOnset} />
                <div className="rounded-[14px] border border-black/[0.05] bg-[#fafbf9] px-4 py-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-black/40">
                    <span className="text-black/35">{icons.pill}</span>
                    Current medications
                  </div>
                  <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1f241b]">
                    {caseItem.currentMedications && caseItem.currentMedications.length > 0
                      ? caseItem.currentMedications.join(", ")
                      : "None reported"}
                  </p>
                </div>
                <div className="rounded-[14px] border border-black/[0.05] bg-[#fafbf9] px-4 py-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-black/40">
                    <span className="text-black/35">{icons.doc}</span>
                    Medical conditions
                  </div>
                  <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1f241b]">
                    {caseItem.medicalConditions && caseItem.medicalConditions.length > 0
                      ? caseItem.medicalConditions.join(", ")
                      : "None reported"}
                  </p>
                </div>
              </div>

              <PatientPhotos photos={caseItem.photos} />
            </SectionCard>

            {/* Patient-specific medical info */}
            {caseItem.medicalConditions?.length ? (
              <SectionCard title="Medical Conditions" icon={icons.doc}>
                <div className="space-y-2">
                  {caseItem.medicalConditions.map((m) => (
                    <div key={m} className="rounded-[12px] border border-black/[0.05] bg-[#fafbf9] px-4 py-3 text-[14px] font-medium text-[#1f241b]">
                      {m}
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : null}

            {caseItem.currentMedications?.length ? (
              <SectionCard title="Current Medications" icon={icons.pill}>
                <div className="space-y-2">
                  {caseItem.currentMedications.map((m) => (
                    <div key={m} className="rounded-[12px] border border-black/[0.05] bg-[#fafbf9] px-4 py-3 text-[14px] font-medium text-[#1f241b]">
                      {m}
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : null}

            {caseItem.previousTreatments?.length ? (
              <SectionCard title="Previous Hair Loss Treatments" icon={icons.doc}>
                <div className="rounded-[12px] border border-black/[0.05] bg-[#fafbf9] px-4 py-3.5">
                  <p className="mb-1.5 text-[12.5px] font-medium text-black/45">Treatments tried:</p>
                  <ul className="space-y-1.5">
                    {caseItem.previousTreatments.map((t) => (
                      <li key={t.category}>
                        <p className="text-[14px] font-medium text-[#1f241b]">• {t.category}</p>
                        {t.detail ? <p className="pl-3 text-[12.5px] font-medium italic text-black/45">{t.detail}</p> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionCard>
            ) : null}

            {/* Medical Answers (collapsible) */}
            <MedicalAnswers caseItem={caseItem} />

            {/* Triage Assessment */}
            <div id="triage-assessment">
              <TriageAssessment caseItem={caseItem} highlight={highlightTriage} />
            </div>

<p className="px-1 text-[12px] font-medium text-black/35">
              {totalFlags === 0
                ? "No flags raised during intake."
                : `${totalFlags} item${totalFlags > 1 ? "s" : ""} flagged for physician review.`}
            </p>
          </div>

          {/* Sticky actions */}
          <DoctorActions caseItem={caseItem} />
        </div>
        )}
      </main>
    </div>
  );
}
