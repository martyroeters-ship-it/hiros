"use client";

import Link from "next/link";
import type { HairHabitCategory, HairHabitTip } from "@/data/hairHabits";

export default function HabitTipView({
  category,
  tip,
  heading = "Action Plan",
}: {
  category: HairHabitCategory;
  tip: HairHabitTip;
  heading?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col">
      <header className="relative mb-5 flex items-center justify-center py-1">
        <Link
          href={`/care/habits/${category.slug}`}
          aria-label={`Back to ${category.title}`}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white backdrop-blur-md"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p className="rounded-full border border-white/10 bg-black/30 px-8 py-2.5 font-title text-[15px] font-semibold tracking-[-0.02em] text-white backdrop-blur-md">
          {heading}
        </p>
      </header>

      <article className="care-plan-card rounded-[28px] px-5 py-6">
        <p className="text-[13px] font-medium text-[var(--care-faint,#8a9288)]">{category.title}</p>
        <h1 className="care-plan-card-title mt-2 font-title text-[24px] font-semibold leading-snug tracking-[-0.03em]">
          {tip.title}
        </h1>
        <p className="care-plan-card-copy mt-3 text-[16px] font-medium leading-relaxed">{tip.summary}</p>
        <p className="mt-2 text-[14px] font-medium text-[#c4715a]">{tip.support}</p>
        <p className="mt-5 text-[14px] leading-relaxed text-[var(--care-muted,#5a6458)]">{tip.why}</p>
        <ul className="care-plan-card-copy mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          {tip.how.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}
