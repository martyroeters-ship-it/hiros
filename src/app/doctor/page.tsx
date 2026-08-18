"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { confidenceFromScore, countFlags, getRelativeTime, riskStyles, tabs, type PatientCase, type TabKey } from "./data";
import { getStoredCases, subscribeStoredCases } from "./store";

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
type SidebarTab = "cases" | "patients" | "agenda" | "messages" | "settings";

const doctorNavItems: { key: SidebarTab; title: string }[] = [
  { key: "cases", title: "Cases" },
  { key: "patients", title: "Patients" },
  { key: "agenda", title: "Agenda" },
  { key: "messages", title: "Messages" },
  { key: "settings", title: "Settings" },
];

function DoctorNavIcon({ tab }: { tab: SidebarTab }) {
  const className = "h-6 w-6 text-white";
  if (tab === "cases") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tab === "patients") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tab === "agenda") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      </svg>
    );
  }
  if (tab === "messages") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2" strokeLinecap="round" />
    </svg>
  );
}

export default function DoctorPortalPage() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("cases");
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [allCases, setAllCases] = useState<PatientCase[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const load = () => setAllCases(getStoredCases());
    load();
    return subscribeStoredCases(load);
  }, []);

  // Update time display every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Update browser tab title with pending count
  useEffect(() => {
    const pendingCount = allCases.filter((c) => c.tab === "pending").length;
    if (pendingCount > 0) {
      document.title = `Hiros (${pendingCount} new)`;
    } else {
      document.title = "Hiros - Doctor Dashboard";
    }
  }, [allCases]);

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = { pending: 0, approved: 0, declined: 0 };
    for (const c of allCases) result[c.tab] += 1;
    return result;
  }, [allCases]);

  const visibleCases = allCases.filter((c) => {
    // Filter by tab
    if (c.tab !== activeTab) return false;
    
    // Filter by search query
    if (query && !c.id.toLowerCase().includes(query.toLowerCase())) return false;
    
    // Filter by quick filter
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
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#f4f5f3] font-[var(--font-dm-sans)] text-[#2b2a28]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[90px] flex-col border-r border-black/8 bg-[#2f5f4f] lg:flex">
        <div className="flex flex-1 flex-col items-center gap-2 py-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-white/10">
            <span
              aria-label="Hiros"
              role="img"
              style={{
                WebkitMaskImage: "url('/hiros_h.png')",
                maskImage: "url('/hiros_h.png')",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
              className="h-6 w-6 bg-white"
            />
          </div>

          {doctorNavItems
            .filter((item) => item.key !== "settings")
            .map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSidebarTab(item.key)}
                className={`flex h-14 w-14 items-center justify-center rounded-[12px] transition-colors ${
                  sidebarTab === item.key ? "bg-white/20" : "hover:bg-white/10"
                }`}
                title={item.title}
              >
                <DoctorNavIcon tab={item.key} />
              </button>
            ))}
        </div>

        <div className="border-t border-white/10 py-4">
          <button
            type="button"
            onClick={() => setSidebarTab("settings")}
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-[12px] transition-colors ${
              sidebarTab === "settings" ? "bg-white/20" : "hover:bg-white/10"
            }`}
            title="Settings"
          >
            <DoctorNavIcon tab="settings" />
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-black/8 bg-[#2f5f4f] px-1 pb-[env(safe-area-inset-bottom)] pt-1 lg:hidden">
        {doctorNavItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSidebarTab(item.key)}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[12px] px-1 py-2 transition-colors ${
              sidebarTab === item.key ? "bg-white/20" : "hover:bg-white/10"
            }`}
          >
            <DoctorNavIcon tab={item.key} />
            <span className="text-[10px] font-medium text-white/85">{item.title}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <div className="w-full min-w-0 max-w-full lg:pl-[90px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-black/5 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5">
          <div className="min-w-0 leading-tight">
            <p className="font-title text-[16px] font-semibold tracking-[-0.03em] text-[#1f241b] sm:text-[18px]">Doctor Dashboard</p>
            <p className="text-[12px] font-medium text-black/45 sm:text-[13px]">Dr. Bülent (Demo)</p>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-medium text-[#2b2a28] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-black/[0.02] md:flex">
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
            <button className="flex items-center gap-1.5 rounded-full px-2 py-2 text-[13px] font-semibold text-[#2b2a28] hover:bg-black/[0.04] sm:px-2.5">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-black/45" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21M12 3C9.5 5.4 8.2 8.6 8.2 12S9.5 18.6 12 21" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              TR
            </button>
            <button className="flex items-center gap-1.5 rounded-full px-2 py-2 text-[13px] font-medium text-black/55 hover:bg-black/[0.04] sm:px-2.5">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 8 6 12l4 4M6 12h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
        {/* Search */}
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

        {/* Tabs + Filter + Refresh */}
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
            {/* Filter Dropdown */}
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

            {/* Refresh Button */}
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

        {/* Cases */}
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
                      {c.ageRange}
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
      </div>
    </div>
  );
}
