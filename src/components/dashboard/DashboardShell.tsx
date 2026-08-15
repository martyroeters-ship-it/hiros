"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
  { id: "treatment", label: "Treatment", href: "/dashboard/treatment", icon: "treatment" },
  { id: "progress", label: "Progress", href: "/dashboard/progress", icon: "progress" },
  { id: "messages", label: "Messages", href: "/dashboard/messages", icon: "messages", badge: 2 },
  { id: "doctor", label: "Doctor", href: "/dashboard/doctor", icon: "doctor" },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: "profile" },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: "settings" },
] as const;

function NavIcon({ name }: { name: (typeof navItems)[number]["icon"] }) {
  const className = "h-[18px] w-[18px] shrink-0";
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
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
    case "profile":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" strokeLinecap="round" />
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

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={`flex h-screen overflow-hidden ${pathname === "/dashboard/messages" ? "bg-white" : "bg-gradient-to-br from-[#e8ece6] via-[#e2e7e0] to-[#d8ddd4]"}`}>
      <aside className="relative flex h-full w-[228px] shrink-0 flex-col overflow-hidden rounded-tr-[36px] rounded-br-[36px] bg-[#f8f5ef] px-4 py-5 shadow-[4px_0_24px_rgba(31,51,41,0.04)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-tr-[36px] rounded-br-[36px] bg-[url('/plant_menu.jpg')] bg-cover bg-bottom bg-left"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-tr-[36px] rounded-br-[36px] bg-gradient-to-b from-[#f8f5ef] from-35% via-[#f8f5ef]/88 via-60% to-[#f8f5ef]/55"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <Link href="/" className="mb-6 inline-flex px-2">
          <Image src="/hiros_logo.png" alt="Hiros" width={111} height={46} priority className="h-auto w-[72px]" />
        </Link>

        <nav className="min-h-0 flex-1">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-[14px] font-medium transition-colors ${
                      isActive ? "bg-[#dde8d4] text-black" : "text-[#5a6458] hover:bg-[#eee9df] hover:text-black"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    <span className="flex-1">{item.label}</span>
                    {"badge" in item && item.badge ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e8965a] px-1.5 text-[11px] font-semibold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-4 rounded-[16px] bg-[#f0ebe2]/90 p-3 backdrop-blur-[1px]">
          <p className="text-[13px] font-semibold text-black">Need help?</p>
          <p className="mt-0.5 text-[12px] leading-snug text-[#6b7568]">Our care team is here for you.</p>
          <button
            type="button"
            onClick={() => document.getElementById("dashboard-care-chat-trigger")?.click()}
            className="mt-2.5 w-full rounded-full border border-black/10 bg-white px-3 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-[#faf8f4]"
          >
            Message us
          </button>
        </div>
        </div>
      </aside>

      <main className={`min-h-0 min-w-0 flex-1 overflow-hidden ${pathname === "/dashboard/messages" ? "bg-white" : "bg-gradient-to-br from-[#e8ece6] via-[#e2e7e0] to-[#d8ddd4]"}`}>
        <div className={`flex h-full flex-col ${pathname === "/dashboard/messages" ? "" : "px-6 pb-5 pt-10"}`}>{children}</div>
      </main>
    </div>
  );
}
