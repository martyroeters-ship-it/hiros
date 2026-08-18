import Image from "next/image";
import Link from "next/link";
import { CheckInCard } from "@/components/dashboard/CheckInCard";
import { DoseCheckCard } from "@/components/dashboard/DoseCheckCard";
import { Greeting } from "@/components/dashboard/Greeting";
import { OrderProgressTracker } from "@/components/dashboard/OrderProgressTracker";
import { MessageUsButton } from "@/components/dashboard/MessageUsButton";

const notifications = [
  {
    title: "Treatment approved",
    detail: "Dr. Emre Yilmaz has approved your plan",
    time: "Today, 9:41 AM",
    badge: "NEW",
    badgeClass: "bg-[#dce8d6] text-[#3d5c35]",
    icon: "check",
  },
  {
    title: "Baseline photos needed",
    detail: "Upload photos to start tracking progress",
    time: "Today, 8:15 AM",
    badge: "ACTION REQUIRED",
    badgeClass: "bg-[#f3ddd0] text-[#a85f3f]",
    icon: "camera",
  },
] as const;


function NotificationIcon({ type }: { type: (typeof notifications)[number]["icon"] }) {
  const base = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full";
  if (type === "check") {
    return (
      <div className={`${base} bg-[#e4eddf] text-[#4a6b42]`}>
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.2">
          <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className={`${base} bg-[#f3ddd0] text-[#b86d52]`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.2" />
      </svg>
    </div>
  );
}

const titleLg = "font-title font-medium tracking-[-0.03em] text-black";
const titleMd = "font-title font-medium tracking-[0.01em] text-black";
const progressInner = "rounded-[14px] border border-[#e8e3db] bg-[#edeae5] p-2";
const progressSubTitle = "font-title text-[13px] font-medium tracking-[0.01em] text-[#3d4540]";
const cardSecondaryShell = "rounded-[20px] bg-white p-3 shadow-[0_1px_6px_rgba(31,51,41,0.03)] transition-transform duration-200 hover:scale-[1.003]";
const cardSecondaryTitle = "font-title text-[16px] font-medium tracking-[0.01em] text-[#3d4540]";
const cardSecondaryInner = "rounded-[12px] border border-[#f0ebe2] bg-[#f6f5f2]";

export default function DashboardPage() {
  return (
    <div className="grid min-h-0 gap-3 lg:h-full lg:grid-rows-[auto_minmax(0,1.1fr)_minmax(0,0.84fr)_minmax(0,0.84fr)]">
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className={`${titleLg} text-[24px] leading-[1.12] lg:text-[34px] lg:leading-[1.08]`}><Greeting /> 👋</h1>
          <p className="mt-1 text-[13px] text-[#6b7568] lg:text-[14px]">Everything is on track. We&apos;ll keep you updated.</p>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(31,51,41,0.06)]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-[#1f4033]" stroke="currentColor" strokeWidth="1.6">
            <path d="M15 17H9l-1 2h8l-1-2Z" strokeLinejoin="round" />
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" strokeLinejoin="round" />
          </svg>
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e8965a] px-1 text-[10px] font-bold text-white">
            2
          </span>
        </button>
      </div>

      {/* Status + Notifications */}
      <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-[1.55fr_1fr]">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] bg-[#1f4033] p-4 text-white shadow-[0_8px_32px_rgba(31,64,51,0.18)] transition-transform duration-200 hover:scale-[1.003]">
          <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
            <div className="flex min-w-0 flex-col justify-between lg:min-w-[170px]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">Current status</p>
                <p className={`${titleMd} mt-1 text-[20px] leading-tight text-white lg:text-[24px]`}>Preparing your treatment</p>
                <p className="mt-2 flex items-center gap-2 text-[13px] font-medium text-white/90">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#a8c49a]" />
                  Step 3 of 5
                </p>
                <p className="mt-1.5 max-w-[22ch] text-[12px] leading-snug text-white/70">
                  The pharmacy is preparing your prescription with care.
                </p>
              </div>
              <Link
                href="/dashboard/treatment"
                className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#1f4033]"
              >
                View treatment
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                  <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div className="flex flex-1 flex-col justify-center">
                <OrderProgressTracker />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2.5 rounded-[14px] bg-white/10 p-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white/85" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/55">Estimated delivery</p>
                    <p className="text-[12px] font-semibold leading-tight">Tuesday 14 June</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-[14px] bg-white/10 p-2.5">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/15">
                    <Image src="/why_hiros_doctors.png" alt="Dr. Emre Yilmaz" fill className="object-cover object-top" sizes="36px" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/55">Reviewed by</p>
                    <p className="truncate text-[12px] font-semibold leading-tight">Dr. Emre Yilmaz</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex h-full min-h-0 flex-col rounded-[24px] bg-white p-4 shadow-[0_2px_16px_rgba(31,51,41,0.05)] transition-transform duration-200 hover:scale-[1.003]">
          <div className="mb-2.5 flex shrink-0 items-center justify-between">
            <h2 className={`${titleMd} text-[20px]`}>Notifications</h2>
            <button type="button" className="text-[12px] font-semibold text-[#6b7568] hover:text-black">
              View all
            </button>
          </div>
          <ul className="flex min-h-0 flex-1 flex-col gap-2">
            {notifications.map((item) => (
              <li key={item.title} className="flex min-h-0 flex-1 gap-2.5 rounded-[16px] border border-[#f0ebe2] bg-[#faf8f4] p-3">
                <NotificationIcon type={item.icon} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-black">{item.title}</p>
                    {item.badge ? (
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${item.badgeClass}`}>{item.badge}</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-[#6b7568]">{item.detail}</p>
                  <p className="mt-auto text-[11px] text-[#9aa396]">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Doctor + Treatment + Next up */}
      <div className="grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <section className={`relative flex h-full min-h-0 flex-col overflow-hidden ${cardSecondaryShell}`}>
          <h2 className={`relative z-[1] ${cardSecondaryTitle}`}>Your doctor</h2>
          <div className="relative mt-1.5 min-h-[80px]">
            <div className="absolute left-0 top-0 z-0 h-[80px] w-[80px] overflow-hidden rounded-full bg-[#eee9df]">
              <Image src="/why_hiros_doctors.png" alt="Dr. Emre Yilmaz" fill className="object-cover object-top" sizes="80px" />
            </div>
            <div className="relative z-[1] pl-[92px]">
              <p className="text-[14px] font-semibold text-[#3d4540]">Dr. Emre Yilmaz</p>
              <p className="text-[12px] text-[#8a9288]">Dermatology</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#e4eddf] px-2 py-0.5 text-[10px] font-medium text-[#4a6b42]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4a6b42]" />
                Usually responds within 24h
              </span>
            </div>
          </div>
          <div className="mt-auto grid grid-cols-3 gap-1 pt-3">
            {[
              { label: "Message", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
              { label: "Book call", icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" },
              { label: "View notes", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                className={`relative z-10 flex flex-col items-center gap-1 px-1 py-1.5 transition-colors hover:bg-[#f0ede8] ${cardSecondaryInner}`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.6">
                    <path d={action.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[9px] font-semibold leading-none text-[#3d4540]">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={`relative flex h-full min-h-0 flex-col overflow-hidden ${cardSecondaryShell}`}>
          <h2 className={cardSecondaryTitle}>Your treatment</h2>
          <div className="mt-1.5">
            <p className={progressSubTitle}>Topical Finasteride 0.25%</p>
            <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#f0ebe2] bg-[#f6f5f2] px-2 py-0.5 text-[10px] font-medium text-[#3d4540]">
              <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
              </svg>
              Once daily
            </span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-[#8a9288]">Start date</p>
                <p className="mt-0.5 text-[13px] font-semibold text-[#3d4540]">June 12</p>
              </div>
              <div>
                <p className="text-[10px] text-[#8a9288]">Next review</p>
                <p className="mt-0.5 text-[13px] font-semibold text-[#3d4540]">July 12</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 flex items-center justify-between rounded-full border border-[#f0ebe2] bg-[#f6f5f2] px-3.5 py-2 text-[11px] font-semibold text-[#3d4540] transition-colors hover:bg-[#f0ede8] lg:mt-auto"
          >
            Learn why this was prescribed
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" stroke="currentColor" strokeWidth="2">
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </section>

        <section className="relative min-h-0 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#c4715a] to-[#b8654f] p-4 text-white shadow-[0_8px_28px_rgba(196,113,90,0.28)] transition-transform duration-200 hover:scale-[1.003]">
          <p className="relative text-[12px] font-medium text-white/75">Next up</p>
          <h2 className={`relative ${titleMd} mt-0.5 max-w-[12ch] text-[22px] leading-tight text-white`}>Take your baseline photos</h2>
          <p className="relative mt-1.5 text-[12px] leading-snug text-white/70">Help your physician track your<br />progress from the start.</p>
          <Link
            href="/dashboard/photos"
            className="relative mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#b8654f]"
          >
            Get started
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </section>
      </div>

      {/* Progress + Support */}
      <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-[1.65fr_0.9fr]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-[#f4f1ec] p-3 shadow-[0_1px_6px_rgba(31,51,41,0.03)] transition-transform duration-200 hover:scale-[1.003]">
          <div className="shrink-0">
            <h2 className="font-title text-[16px] font-medium tracking-[0.01em] text-[#3d4540]">Today's check-in</h2>
            <p className="mt-0.5 text-[11px] text-[#8a9288]">Small daily updates for your physician</p>
          </div>
          <div className="mt-2 grid min-h-0 flex-1 grid-cols-1 gap-1.5 sm:grid-cols-3">
            <DoseCheckCard titleClassName={progressSubTitle} cardClassName={progressInner} />

            <CheckInCard titleClassName={progressSubTitle} cardClassName={progressInner} compact />

            <div className={`flex min-h-0 min-w-0 flex-col ${progressInner}`}>
              <p className={progressSubTitle}>Side effects</p>
              <p className="text-[11px] text-[#8a9288]">Since starting treatment</p>
              <div className="mt-1 flex min-w-0 flex-1 items-center gap-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dde8d6] text-[#4a6b42]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-[#3d4540]">No concerns reported</p>
                  <p className="text-[11px] text-[#9aa396]">Keep it up</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative min-h-0 overflow-hidden rounded-[24px] bg-[#ebe6dc] shadow-[0_2px_16px_rgba(31,51,41,0.05)] transition-transform duration-200 hover:scale-[1.003]">
          <div className="relative z-10 flex h-full flex-col justify-center p-4 lg:pr-[38%]">
            <h2 className={`${titleMd} text-[22px] leading-tight`}>We&apos;re with you<br />all the way</h2>
            <p className="mt-2 text-[13px] leading-snug text-[#5a6458]">Questions? Our care team is here<br />to help.</p>
            <MessageUsButton />
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-[42%] overflow-hidden lg:block">
            <Image src="/plant.png" alt="" fill className="object-cover object-center" sizes="200px" />
            <div className="absolute inset-0 bg-[#ebe6dc]/40" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#ebe6dc] to-transparent" />
          </div>
        </section>
      </div>
    </div>
  );
}
