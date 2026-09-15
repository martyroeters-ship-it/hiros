"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { confidenceFromScore, countFlags, getRelativeTime, riskStyles, tabs, type PatientCase, type TabKey } from "../data";
import { fetchCases, subscribeStoredCases } from "../store";
import { DoctorChrome } from "../shell";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19c.8-3.2 3.6-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ConcernIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type QuickFilter = "all" | "flagged" | "red" | "orange" | "green" | "info-requested";

export default function DoctorCasesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [allCases, setAllCases] = useState<PatientCase[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const load = (initial = false) => {
      void fetchCases()
        .then(setAllCases)
        .catch((error) => {
          console.error(error);
          if (initial) setAllCases([]);
        });
    };
    load(true);
    return subscribeStoredCases(() => load());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = { pending: 0, approved: 0, declined: 0 };
    for (const c of allCases) result[c.tab] += 1;
    return result;
  }, [allCases]);

  const visibleCases = allCases.filter((c) => {
    if (c.tab !== activeTab) return false;
    if (query && !c.id.toLowerCase().includes(query.toLowerCase())) return false;
    if (quickFilter === "flagged") {
      const flags = countFlags(c);
      return flags.red > 0 || flags.orange > 0;
    } else if (quickFilter === "red") {
      return c.risk === "Red";
    } else if (quickFilter === "orange") {
      return c.risk === "Orange";
    } else if (quickFilter === "green") {
      return c.risk === "Green";
    } else if (quickFilter === "info-requested") {
      return c.status === "Requested more info";
    }
    return true;
  });

  return (
    <DoctorChrome active="cases" title="Cases overview">
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
        <div className="relative mb-5">
          <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black/35" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Case ID"
            className="h-12 w-full rounded-[14px] border border-black/8 bg-white pl-11 pr-4 text-[14px] font-medium text-[#2b2a28] shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none placeholder:text-black/35 focus:border-[#8ea57a]"
          />
        </div>

        <div className="mb-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-[13.5px] ${
                    active
                      ? "bg-gradient-to-r from-[#3f5f35] to-[#5f7f4f] text-white shadow-[0_6px_16px_rgba(63,95,53,0.25)]"
                      : "border border-black/10 bg-white text-[#2b2a28] hover:bg-black/[0.02]"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                      active ? "bg-white/25 text-white" : "bg-black/[0.06] text-black/55"
                    }`}
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative">
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-semibold text-[#2b2a28] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-black/[0.02]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-black/50" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {quickFilter === "all" && "All cases"}
              {quickFilter === "flagged" && "Flagged only"}
              {quickFilter === "red" && "Red only"}
              {quickFilter === "orange" && "Orange only"}
              {quickFilter === "green" && "Green only"}
              {quickFilter === "info-requested" && "Info requested"}
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-black/35" aria-hidden="true">
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {filterMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:left-0 sm:right-auto">
                  {[
                    { key: "all" as QuickFilter, label: "All cases" },
                    { key: "flagged" as QuickFilter, label: "Flagged only" },
                    { key: "info-requested" as QuickFilter, label: "Info requested" },
                    { key: "red" as QuickFilter, label: "Red only" },
                    { key: "orange" as QuickFilter, label: "Orange only" },
                    { key: "green" as QuickFilter, label: "Green only" },
                  ].map((filter) => {
                    const active = filter.key === quickFilter;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => {
                          setQuickFilter(filter.key);
                          setFilterMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium transition ${
                          active
                            ? "bg-[#f4f5f3] text-[#2b2a28]"
                            : "text-black/70 hover:bg-black/[0.02]"
                        }`}
                      >
                        {active && (
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#5f7f4f]" aria-hidden="true">
                            <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <span className={active ? "" : "ml-6"}>{filter.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              aria-label="Refresh"
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-[13px] font-semibold text-[#2b2a28] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-black/[0.02] sm:px-4 sm:text-[13.5px]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-black/50" aria-hidden="true">
                <path d="M20 11a8 8 0 1 0-.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M20 5v6h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          {visibleCases.map((c) => {
            const styles = riskStyles[c.risk];
            const flags = countFlags(c);
            const totalFlags = flags.red + flags.orange;
            return (
              <Link
                key={c.id}
                href={`/doctor/${c.id}`}
                className="group relative flex w-full min-w-0 max-w-full flex-col gap-3 overflow-hidden rounded-[16px] border border-black/[0.06] bg-white px-4 py-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
              >
                <span className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-full ${styles.bar}`} />
                <div className="min-w-0 max-w-full pl-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <span className="max-w-full break-all font-[var(--font-geist-mono)] text-[13px] font-semibold tracking-[-0.01em] text-[#1f241b] sm:text-[14px]">
                      {c.id}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles.badge}`}>
                      {c.risk}
                    </span>
                    {c.status === "Requested more info" && (
                      <span className="rounded-full bg-[#eef3fb] px-2.5 py-0.5 text-[11px] font-semibold text-[#3b6fe0]">
                        Requested more info
                      </span>
                    )}
                    <span className="text-[12.5px] font-semibold text-black/55">AGA: {c.agaScore}/20</span>
                    <span className="text-[12.5px] font-medium text-black/45">Confidence: {confidenceFromScore(c.agaScore)}</span>
                    <span className="flex items-center gap-1 text-[12.5px] font-medium text-black/45">
                      <ClockIcon />
                      {c.status} {getRelativeTime(c.submittedAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5 text-[12.5px] font-medium text-black/50 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <span className="flex items-center gap-1.5">
                      <UserIcon />
                      {c.answers.find((item) => item.question === "Affected areas")?.answer || "Area not reported"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ConcernIcon />
                      {c.reason}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <PinIcon />
                      {c.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClockIcon />
                      {c.date}
                    </span>
                  </div>
                  {totalFlags > 0 ? (
                    <div className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#bd7637]">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M12 3 2.5 19.5h19L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M12 10v3.5M12 16.5h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                      {totalFlags} flag{totalFlags > 1 ? "s" : ""}
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 pl-3 sm:justify-end sm:pl-0">
                  <span className="rounded-full border border-black/10 px-3.5 py-1.5 text-[12px] font-semibold text-[#2b2a28]">
                    {c.priority}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-black/30 transition group-hover:translate-x-0.5 group-hover:text-black/50" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            );
          })}

          {visibleCases.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-black/10 bg-white px-6 py-14 text-center text-[14px] font-medium text-black/40">
              {allCases.length === 0
                ? "No submitted intakes yet. Completed patient intakes will appear here."
                : "No cases to show in this tab."}
            </div>
          ) : null}
        </div>
      </main>
    </DoctorChrome>
  );
}
