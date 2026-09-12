"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DoctorChrome } from "../shell";
import { fetchTreatmentPatients } from "./store";
import type { ComplianceStatus, TreatmentPatient } from "./types";

type RosterFilter = "all" | "alerts" | "noncompliant" | "on_track";

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function complianceLabel(status: ComplianceStatus): string {
  if (status === "on_track") return "On track";
  if (status === "watch") return "Needs watch";
  return "Non-compliant";
}

function complianceClass(status: ComplianceStatus): string {
  if (status === "on_track") return "bg-[#e6f1e2] text-[#3f5f35]";
  if (status === "watch") return "bg-[#fbe0b8] text-[#9a4e07]";
  return "bg-[#fbcec5] text-[#a81d12]";
}

function yesNo(value: boolean | null, yes = "Yes", no = "No"): string {
  if (value === true) return yes;
  if (value === false) return no;
  return "Unknown";
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<TreatmentPatient[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RosterFilter>("all");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    void fetchTreatmentPatients()
      .then(setPatients)
      .catch(() => {
        setLoadError(true);
        setPatients([]);
      });
  }, []);

  const counts = useMemo(
    () => ({
      all: patients.length,
      alerts: patients.filter((p) => p.alerts.length > 0).length,
      noncompliant: patients.filter((p) => p.compliance === "alert").length,
      on_track: patients.filter((p) => p.compliance === "on_track").length,
    }),
    [patients],
  );

  const visible = patients.filter((patient) => {
    const haystack = `${patient.fullName} ${patient.city} ${patient.treatmentName} ${patient.prescriptionNumber ?? ""}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (filter === "alerts") return patient.alerts.length > 0;
    if (filter === "noncompliant") return patient.compliance === "alert";
    if (filter === "on_track") return patient.compliance === "on_track";
    return true;
  });

  return (
    <DoctorChrome active="patients" title="Patients in treatment">
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
        <div className="relative mb-5">
          <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black/35" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or treatment"
            className="h-12 w-full rounded-[14px] border border-black/8 bg-white pl-11 pr-4 text-[14px] font-medium text-[#2b2a28] shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none placeholder:text-black/35 focus:border-[#8ea57a]"
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {(
            [
              { key: "all" as const, label: "All" },
              { key: "alerts" as const, label: "Alerts" },
              { key: "noncompliant" as const, label: "Non-compliant" },
              { key: "on_track" as const, label: "On track" },
            ] as const
          ).map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold transition sm:px-4 ${
                  active
                    ? "bg-gradient-to-r from-[#3f5f35] to-[#5f7f4f] text-white shadow-[0_6px_16px_rgba(63,95,53,0.25)]"
                    : "border border-black/10 bg-white text-[#2b2a28] hover:bg-black/[0.02]"
                }`}
              >
                {item.label}
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-white/25 text-white" : "bg-black/[0.06] text-black/55"}`}>
                  {counts[item.key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3.5">
          {visible.map((patient) => (
            <Link
              key={patient.caseId}
              href={`/doctor/patients/${patient.caseId}`}
              className="group relative flex w-full min-w-0 flex-col gap-3 overflow-hidden rounded-[16px] border border-black/[0.06] bg-white px-4 py-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] sm:px-5"
            >
              <span
                className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-full ${
                  patient.compliance === "alert"
                    ? "bg-gradient-to-b from-[#e6604a] to-[#cf2f1e]"
                    : patient.compliance === "watch"
                      ? "bg-gradient-to-b from-[#f0a64d] to-[#e0851a]"
                      : "bg-gradient-to-b from-[#5f7f4f] to-[#4b6942]"
                }`}
              />
              <div className="flex flex-col gap-3 pl-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">{patient.fullName}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${complianceClass(patient.compliance)}`}>
                      {complianceLabel(patient.compliance)}
                    </span>
                    {patient.alerts.slice(0, 2).map((alert) => (
                      <span
                        key={alert.kind}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          alert.severity === "red" ? "bg-[#fbcec5] text-[#a81d12]" : "bg-[#fbe0b8] text-[#9a4e07]"
                        }`}
                      >
                        {alert.label}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-[13px] font-medium text-black/50">
                    {patient.treatmentName} · {patient.city}
                  </p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" className="hidden h-[18px] w-[18px] shrink-0 text-black/30 group-hover:text-black/50 sm:block" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 pl-3 sm:grid-cols-4">
                <Metric label="Filled prescription" value={yesNo(patient.filled, "Collected", "Not collected")} />
                <Metric label="Taking meds this month" value={yesNo(patient.tookMedsThisMonth)} />
                <Metric label="Photos this month" value={yesNo(patient.submittedPhotos, "Submitted", "Missing")} />
                <Metric label="Last check-in" value={formatDate(patient.lastCheckInAt)} />
              </div>
            </Link>
          ))}

          {visible.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-black/10 bg-white px-6 py-14 text-center text-[14px] font-medium text-black/40">
              {loadError
                ? "Could not load patients. Is the local database running?"
                : patients.length === 0
                  ? "No patients are in treatment yet. Approve a case to add someone here."
                  : "No patients match this filter."}
            </div>
          ) : null}
        </div>
      </main>
    </DoctorChrome>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-[#f7f6f3] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black/40">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold text-[#1f241b]">{value}</p>
    </div>
  );
}
