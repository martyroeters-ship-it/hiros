"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DOCTOR_SETTINGS_EVENT, loadDoctorSettings } from "./settings-store";

type BadgeCounts = { now: number; cases: number; agenda: number; messages: number };

const emptyBadges: BadgeCounts = { now: 0, cases: 0, agenda: 0, messages: 0 };
let lastBadges: BadgeCounts = emptyBadges;
const DoctorNavBadgesContext = createContext<BadgeCounts>(emptyBadges);

export function DoctorNavBadgesProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<BadgeCounts>(lastBadges);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/doctor/badges", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as Partial<BadgeCounts>;
        if (cancelled) return;
        const next = {
          now: data.now ?? 0,
          cases: data.cases ?? 0,
          agenda: data.agenda ?? 0,
          messages: data.messages ?? 0,
        };
        lastBadges = next;
        setBadges(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return <DoctorNavBadgesContext.Provider value={badges}>{children}</DoctorNavBadgesContext.Provider>;
}

export type DoctorSection = "now" | "cases" | "patients" | "agenda" | "messages" | "settings";

const navItems: { key: DoctorSection; title: string; href: string }[] = [
  { key: "now", title: "Recent activity", href: "/doctor" },
  { key: "cases", title: "Cases", href: "/doctor/cases" },
  { key: "patients", title: "Patients", href: "/doctor/patients" },
  { key: "agenda", title: "Agenda", href: "/doctor/agenda" },
  { key: "messages", title: "Messages", href: "/doctor/messages" },
  { key: "settings", title: "Settings", href: "/doctor/settings" },
];

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d92d20] px-1 text-[9px] font-bold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function DoctorNavIcon({ tab }: { tab: DoctorSection }) {
  const className = "h-6 w-6 text-white";
  if (tab === "now") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.5V12l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
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
      <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2" />
    </svg>
  );
}

export function DoctorChrome({
  active,
  title,
  children,
}: {
  active: DoctorSection;
  title: string;
  children: ReactNode;
}) {
  const badges = useContext(DoctorNavBadgesContext);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<"en" | "tr">("en");

  useEffect(() => {
    const apply = () => {
      const next = loadDoctorSettings();
      setTheme(next.theme);
      setLanguage(next.language);
    };
    apply();
    window.addEventListener(DOCTOR_SETTINGS_EVENT, apply);
    return () => window.removeEventListener(DOCTOR_SETTINGS_EVENT, apply);
  }, []);

  const badgeFor = (key: DoctorSection) =>
    key === "now"
      ? badges.now
      : key === "cases"
        ? badges.cases
        : key === "agenda"
          ? badges.agenda
          : key === "messages"
            ? badges.messages
            : 0;

  return (
    <div
      data-doctor-theme={theme}
      className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#f4f5f3] font-[var(--font-dm-sans)] text-[#2b2a28]"
    >
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[90px] flex-col border-r border-black/8 bg-[#2f5f4f] lg:flex">
        <div className="flex flex-1 flex-col items-center gap-2 py-8">
          <Link href="/doctor" className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-white/10" title="Recent activity">
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
          </Link>
          {navItems
            .filter((item) => item.key !== "settings")
            .map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex h-14 w-14 items-center justify-center rounded-[12px] transition-colors ${
                  active === item.key ? "bg-white/20" : "hover:bg-white/10"
                }`}
                title={item.title}
              >
                <span className="relative inline-flex">
                  <DoctorNavIcon tab={item.key} />
                  <NavBadge count={badgeFor(item.key)} />
                </span>
              </Link>
            ))}
        </div>
        <div className="border-t border-white/10 py-4">
          <Link
            href="/doctor/settings"
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-[12px] transition-colors ${
              active === "settings" ? "bg-white/20" : "hover:bg-white/10"
            }`}
            title="Settings"
          >
            <DoctorNavIcon tab="settings" />
          </Link>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-black/8 bg-[#2f5f4f] px-1 pb-[env(safe-area-inset-bottom)] pt-1 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[12px] px-1 py-2 transition-colors ${
              active === item.key ? "bg-white/20" : "hover:bg-white/10"
            }`}
          >
            <span className="relative">
              <DoctorNavIcon tab={item.key} />
              <NavBadge count={badgeFor(item.key)} />
            </span>
            <span className="text-[10px] font-medium text-white/85">{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="w-full min-w-0 max-w-full lg:pl-[90px]">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5">
            <div className="min-w-0 leading-tight">
              <p className="font-title text-[16px] font-semibold tracking-[-0.03em] text-[#1f241b] sm:text-[18px]">
                {title}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              <button className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-medium text-[#2b2a28] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-black/[0.02] md:flex">
                <span className="text-black/45">View as:</span>
                <span className="font-semibold">Doctor Portal</span>
              </button>
              <span className="flex items-center gap-1.5 rounded-full px-2 py-2 text-[13px] font-semibold text-[#2b2a28] sm:px-2.5">
                {language === "tr" ? "TR" : "EN"}
              </span>
              <button className="flex items-center gap-1.5 rounded-full px-2 py-2 text-[13px] font-medium text-black/55 hover:bg-black/[0.04] sm:px-2.5">
                Logout
              </button>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
