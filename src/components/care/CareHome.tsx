"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ActionPlan from "@/components/care/ActionPlan";
import { NextPhotoSlot } from "@/components/care/NextPhotoSlot";
import { hairHabitCategories } from "@/data/hairHabits";
import type { CareLifestyleSnapshot } from "@/lib/care-lifestyle";
import { actionPlanCategories, pendingLifestyleCheckIns } from "@/lib/habitPlan";
import type { PatientDashboardSnapshot } from "@/lib/patient-dashboard-types";
import { getPhotoCheckIn } from "@/lib/photoCheckIn";
import { displayName, useSessionUser } from "@/lib/use-session-user";

function CareGreeting() {
  const user = useSessionUser();
  const [text, setText] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    const prefix =
      hour >= 6 && hour < 12
        ? "Good morning"
        : hour >= 12 && hour < 18
          ? "Good afternoon"
          : hour >= 18 && hour < 24
            ? "Good evening"
            : "Good night";
    const name = user ? displayName(user) : "";
    setText(name ? `${prefix}, ${name}` : prefix);
  }, [user]);

  return <>{text}</>;
}

function careHref(href: string) {
  if (href.startsWith("/dashboard/progress")) return "/care/progress";
  if (href.startsWith("/dashboard/treatment")) return "/care/treatment";
  if (href.startsWith("/dashboard/messages")) return "/care/messages";
  if (href.startsWith("/dashboard/doctor")) return "/care/doctor";
  return href;
}

type HealthCard = {
  key: string;
  href: string;
  title: string;
  eyebrow: string;
  intro: string;
  status: "ok" | "attention" | "check-in";
};

function healthCards(snapshot: PatientDashboardSnapshot, health: CareLifestyleSnapshot): HealthCard[] {
  const hasPhotos = snapshot.photos.length > 0;
  const photoCheck = getPhotoCheckIn(snapshot.photos, snapshot.treatmentStartedAt);
  const nutrition = hairHabitCategories.find((item) => item.slug === "nutrition");
  const sleep = hairHabitCategories.find((item) => item.slug === "sleep");
  const cards: HealthCard[] = [];

  cards.push({
    key: "nutrition-check-in",
    href: "/care/check-in/nutrition",
    title: nutrition?.title || "Nutrition",
    eyebrow: health.nutrition === null ? "3 short questions" : "Retake the test",
    intro: "Protein, crash diets, and iron-rich food. If something looks off, Nutrition moves into your Action Plan.",
    status: health.nutrition === "needs_attention" ? "attention" : health.nutrition === "on_track" ? "ok" : "check-in",
  });

  cards.push({
    key: "sleep-check-in",
    href: "/care/check-in/sleep",
    title: sleep?.title || "Sleep",
    eyebrow: health.sleep === null ? "3 short questions" : "Retake the test",
    intro: "Short or chaotic nights add load that hair can feel weeks later. If nights look rough, Sleep moves into your Action Plan.",
    status: health.sleep === "needs_attention" ? "attention" : health.sleep === "on_track" ? "ok" : "check-in",
  });

  if (health.reportedStress) {
    cards.push({
      key: "stress",
      href: "/care/habits/stress",
      title: "Stress",
      eyebrow: "You mentioned this in intake",
      intro: "A hard stretch can push more hairs into a resting phase. That extra shedding often shows up two or three months later.",
      status: "attention",
    });
  }

  cards.push({
    key: "photos",
    href: "/care/progress",
    title: "Monthly photos",
    eyebrow: photoCheck.overdue
      ? "Update due"
      : photoCheck.dueAt
        ? "One month from the start"
        : "See if treatment is working",
    intro: "Same light, same angles, once a month. That is how you tell whether medicine is doing anything.",
    status: !hasPhotos || photoCheck.overdue ? "attention" : "ok",
  });

  return cards.sort((a, b) => Number(a.status === "ok") - Number(b.status === "ok"));
}

function statusLabel(status: HealthCard["status"]) {
  if (status === "ok") return "On track";
  if (status === "check-in") return "Check in";
  return "Needs attention";
}

export function CareHome({
  initial,
  health: initialHealth,
}: {
  initial: PatientDashboardSnapshot;
  health: CareLifestyleSnapshot;
}) {
  const [snapshot, setSnapshot] = useState(initial);
  const [health, setHealth] = useState(initialHealth);

  useEffect(() => {
    const load = () => {
      void fetch("/api/dashboard", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) return;
          setSnapshot((await res.json()) as PatientDashboardSnapshot);
        })
        .catch(() => undefined);
      void fetch("/api/care/lifestyle", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) return;
          setHealth((await res.json()) as CareLifestyleSnapshot);
        })
        .catch(() => undefined);
    };
    const refreshIfVisible = () => {
      if (document.visibilityState !== "visible") return;
      load();
    };
    const interval = window.setInterval(refreshIfVisible, 8000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
    };
  }, []);

  const cards = healthCards(snapshot, health);
  const planCategories = actionPlanCategories(health);
  const checkIns = pendingLifestyleCheckIns(health);
  const next = snapshot.nextUp;
  const treatmentLabel = snapshot.treatmentApproved
    ? snapshot.treatmentName || "Active"
    : snapshot.caseId
      ? "In review"
      : "Not started";

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-[var(--care-faint)]">Care preview · original stays at /dashboard</p>
          <h1 className="mt-1 font-title text-[28px] font-medium leading-[1.1] tracking-[-0.04em] text-[var(--care-ink)] lg:text-[36px]">
            Insights
          </h1>
          <p className="mt-1 text-[15px] font-medium text-[var(--care-muted)]">
            <CareGreeting />
          </p>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 rounded-full border border-[var(--care-hairline)] bg-[var(--care-surface)] px-3.5 py-2 text-[12px] font-semibold text-[var(--care-surface-ink)]"
        >
          Original
        </Link>
      </div>

      <section className="care-hero-panel overflow-hidden px-6 py-6 sm:px-8 sm:py-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Next</p>
        <p className="mt-2 font-title text-[22px] font-medium leading-snug tracking-[-0.03em] sm:text-[26px]">
          {next.title}
        </p>
        <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-white/70">{next.detail}</p>
        <Link
          href={careHref(next.href)}
          className="mt-5 inline-flex rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-[#1f4033]"
        >
          {next.cta}
        </Link>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium text-white/45">Treatment</dt>
            <dd className="mt-1 text-[14px] font-semibold text-white">{treatmentLabel}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-white/45">Photos</dt>
            <dd className="mt-1 text-[14px] font-semibold text-white">
              {snapshot.photos.length ? `${snapshot.photos.length} on file` : "None yet"}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-[11px] font-medium text-white/45">Physician</dt>
            <dd className="mt-1 text-[14px] font-semibold text-white">{snapshot.doctorName || "Not assigned yet"}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="font-title text-[22px] font-medium tracking-[-0.03em] text-[var(--care-ink)]">Hair health</h2>
        <p className="mt-1 text-[14px] font-medium text-[var(--care-muted)]">
          Keep your treatment on track with better sleep, nutrition, and monthly photos.
        </p>
        <div className="care-health-grid mt-4 space-y-3">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="care-area-card group relative block rounded-[24px] bg-[var(--care-surface)] px-5 py-5 shadow-[var(--care-card-shadow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="origin-left font-title text-[20px] font-medium tracking-[-0.03em] text-[var(--care-surface-ink)] transition-transform duration-200 group-hover:scale-[1.03]">
                    {card.title}
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-[var(--care-faint)]">{card.eyebrow}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    card.status === "ok"
                      ? "bg-[var(--care-chip-ok)] text-[var(--care-chip-ok-ink)]"
                      : "bg-[var(--care-chip)] text-[var(--care-chip-ink)]"
                  }`}
                >
                  {statusLabel(card.status)}
                </span>
              </div>
              <p className="mt-3 max-w-[48ch] pr-8 text-[14px] leading-relaxed text-[var(--care-muted)]">{card.intro}</p>
              {card.key === "photos" ? (
                <div className="mt-4">
                  <NextPhotoSlot
                    photos={snapshot.photos}
                    treatmentStartedAt={snapshot.treatmentStartedAt}
                    variant="banner"
                    disableLink
                  />
                </div>
              ) : null}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-5 right-5 text-[var(--care-surface-ink)] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <ActionPlan
          variant="embed"
          heading="Action plan"
          categories={planCategories}
          checkIns={checkIns}
          empty="Finish the Hair health check-ins. Topics that need attention will show up here. Everything else stays in Habits."
        />
        <Link href="/care/habits" className="mt-3 inline-block text-[13px] font-semibold text-[var(--care-accent)]">
          Open Habits
        </Link>
      </section>

      <section className="care-area-card rounded-[24px] bg-[var(--care-surface)] px-5 py-5 shadow-[var(--care-card-shadow)]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--care-faint)]">Treatment</p>
        <p className="mt-1 font-title text-[20px] font-medium tracking-[-0.03em] text-[var(--care-surface-ink)]">
          {snapshot.treatmentName || "Waiting for physician review"}
        </p>
        <p className="mt-1 text-[14px] font-medium text-[var(--care-muted)]">{snapshot.statusDetail}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/care/treatment"
            className="rounded-full bg-[#1f4033] px-4 py-2 text-[13px] font-semibold text-white"
          >
            Open treatment
          </Link>
          {snapshot.paymentDue ? (
            <Link href="/dashboard#pay" className="rounded-full bg-[#c4715a] px-4 py-2 text-[13px] font-semibold text-white">
              Payment is on the original dashboard
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
