"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CareThemeProvider, useCareTheme } from "@/components/care/CareTheme";
import { careCopy } from "@/i18n/careCopy";
import { useHydratedLocale } from "@/i18n/LanguageProvider";

const navItems = [
  { id: "insights", labelKey: "insights", href: "/care", icon: "home" },
  { id: "treatment", labelKey: "treatment", href: "/care/treatment", icon: "treatment" },
  { id: "habits", labelKey: "habits", href: "/care/habits", icon: "habits" },
  { id: "progress", labelKey: "progress", href: "/care/progress", icon: "progress" },
  { id: "messages", labelKey: "messages", href: "/care/messages", icon: "messages" },
  { id: "doctor", labelKey: "doctor", href: "/care/doctor", icon: "doctor" },
  { id: "settings", labelKey: "settings", href: "/care/settings", icon: "settings" },
] as const;

function NavIcon({ name }: { name: (typeof navItems)[number]["icon"] }) {
  const className = "h-[18px] w-[18px] shrink-0";
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="8.25" />
          <path d="M12 8v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "habits":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <path d="M8 4.75h8A2.25 2.25 0 0 1 18.25 7v13L12 16.5 5.75 20V7A2.25 2.25 0 0 1 8 4.75Z" strokeLinejoin="round" />
        </svg>
      );
    case "treatment":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M9 8h6M9 12h6" strokeLinecap="round" />
        </svg>
      );
    case "progress":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <path d="M4 18V6M4 18h16M8 14v-4M12 14V8M16 14v-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "messages":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
        </svg>
      );
    case "doctor":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M7 20c.6-2.5 2.6-4 5-4s4.4 1.5 5 4" strokeLinecap="round" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] shrink-0" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  unreadCount,
  logoPriority = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  unreadCount: number;
  logoPriority?: boolean;
}) {
  const locale = useHydratedLocale();
  const care = careCopy[locale];
  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--care-faint)]">
        {care.brand}
      </p>
      <Link href="/" onClick={onNavigate} className="mb-6 inline-flex px-2">
        <Image
          src="/hiros_logo.png"
          alt="Hiros"
          width={111}
          height={46}
          priority={logoPriority}
          className="care-logo h-auto w-[72px]"
        />
      </Link>

      <nav className="min-h-0 flex-1 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/care" ? pathname === "/care" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badge = item.id === "messages" && unreadCount > 0 ? unreadCount : 0;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 rounded-full px-3 py-2.5 text-[14px] font-medium transition-colors ${
                    isActive
                      ? "care-nav-link-active"
                      : "text-[var(--care-nav)] hover:bg-[var(--care-nav-hover)] hover:text-[var(--care-nav-active-ink)]"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  <span className="flex-1">{care[item.labelKey]}</span>
                  {badge > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e8965a] px-1.5 text-[11px] font-semibold text-white">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void fetch("/api/auth/logout", { method: "POST" }).then(() => {
              window.location.href = "/";
            });
          }}
          className="mt-0.5 flex w-full items-center gap-2.5 rounded-full px-3 py-2.5 text-[14px] font-medium text-[var(--care-nav)] transition-colors hover:bg-[var(--care-nav-hover)] hover:text-[var(--care-nav-active-ink)]"
        >
          <LogoutIcon />
          <span>{care.logOut}</span>
        </button>
      </nav>

      <div className="mt-4 rounded-[22px] border border-[var(--care-hairline)] bg-[var(--care-help)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[20px]">
        <p className="text-[13px] font-semibold text-[var(--care-ink)]">{care.needHelp}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-[var(--care-muted)]">{care.helpBody}</p>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            document.getElementById("dashboard-care-chat-trigger")?.click();
          }}
          className="mt-2.5 w-full rounded-full border border-[var(--care-hairline)] bg-[var(--care-surface)] px-3 py-2 text-[13px] font-semibold text-[var(--care-surface-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[12px] transition-colors"
        >
          {care.messageUs}
        </button>
      </div>
    </div>
  );
}

function SidebarBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-tr-[36px] rounded-br-[36px] bg-[url('/plant_menu.jpg')] bg-cover bg-bottom bg-left"
      />
      <div
        aria-hidden="true"
        className="care-sidebar-overlay pointer-events-none absolute inset-0 rounded-tr-[36px] rounded-br-[36px]"
      />
    </>
  );
}

export default function CareShell({
  children,
  unreadCount = 0,
}: {
  children: React.ReactNode;
  unreadCount?: number;
}) {
  return (
    <CareThemeProvider>
      <CareShellInner unreadCount={unreadCount}>{children}</CareShellInner>
    </CareThemeProvider>
  );
}

function CareShellInner({
  children,
  unreadCount = 0,
}: {
  children: React.ReactNode;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const { theme } = useCareTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDark = theme === "dark";
  const isMessages = pathname === "/care/messages";
  const isActionPlan = pathname === "/care/habits" || pathname.startsWith("/care/habits/");
  const isCheckIn = pathname.startsWith("/care/check-in");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const canvasClass = isDark
    ? isActionPlan
      ? "care-plan-fill"
      : "care-canvas-fill"
    : isActionPlan
      ? "care-plan-fill"
      : isMessages
        ? "bg-white"
        : "bg-[var(--care-canvas)]";

  return (
    <div
      data-care-theme={theme}
      suppressHydrationWarning
      className={`care-app relative flex h-dvh min-w-0 flex-col overflow-hidden lg:h-screen lg:flex-row ${canvasClass}`}
    >
      {isDark ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[12%] top-[-8%] h-[42vh] w-[42vh] rounded-full bg-[radial-gradient(circle,rgba(154,196,168,0.34)_0%,transparent_70%)] blur-2xl" />
          <div className="absolute -right-[8%] top-[18%] h-[34vh] w-[34vh] rounded-full bg-[radial-gradient(circle,rgba(90,140,124,0.28)_0%,transparent_72%)] blur-2xl" />
          <div className="absolute bottom-[-10%] left-[28%] h-[40vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(36,72,64,0.55)_0%,transparent_70%)] blur-3xl" />
        </div>
      ) : null}
      <header
        className={`relative z-10 shrink-0 items-center gap-3 px-4 py-3 lg:hidden ${isActionPlan || isCheckIn ? "hidden" : "flex"}`}
      >
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--care-hairline)] bg-[var(--care-surface)] text-[var(--care-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[18px]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/hiros_logo.png"
            alt="Hiros"
            width={111}
            height={46}
            priority
            className="care-logo h-auto w-[72px]"
          />
        </Link>
      </header>

      <aside className="relative z-10 hidden h-full w-[236px] shrink-0 flex-col overflow-hidden rounded-tr-[36px] rounded-br-[36px] border-r border-[var(--care-hairline)] bg-[var(--care-sidebar)] px-4 py-5 shadow-[4px_0_32px_rgba(0,0,0,0.12)] backdrop-blur-[28px] lg:flex">
        <SidebarBackdrop />
        <SidebarContent pathname={pathname} unreadCount={unreadCount} logoPriority />
      </aside>

      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(288px,86vw)] flex-col overflow-hidden rounded-tr-[36px] rounded-br-[36px] border-r border-[var(--care-hairline)] bg-[var(--care-sidebar)] px-4 py-5 shadow-[4px_0_32px_rgba(0,0,0,0.2)] backdrop-blur-[28px] lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute right-4 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--care-hairline)] bg-[var(--care-surface)] text-[var(--care-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[12px]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
            <SidebarBackdrop />
            <SidebarContent pathname={pathname} onNavigate={() => setMenuOpen(false)} unreadCount={unreadCount} />
          </aside>
        </>
      ) : null}

      <main
        className={`relative z-10 min-h-0 min-w-0 flex-1 ${
          isMessages ? "overflow-hidden" : "overflow-y-auto"
        } ${isDark || isActionPlan || !isMessages ? "bg-transparent" : "bg-white"}`}
      >
        <div
          className={`flex flex-col ${isMessages ? "h-full" : "min-h-full"} ${
            isMessages
              ? ""
              : isCheckIn
                ? "px-4 pb-10 pt-4 lg:px-8 lg:pb-12 lg:pt-6"
                : isActionPlan
                  ? "px-4 pb-10 pt-3 lg:px-8 lg:pt-6"
                  : "px-4 pb-10 pt-4 lg:px-8 lg:pb-12 lg:pt-8"
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
