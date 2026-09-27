"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type HairHabitCategory } from "@/data/hairHabits";
import type { LifestyleCheckInCard } from "@/lib/habitPlan";

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="care-plan-card-chevron h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryIcon({ name }: { name: HairHabitCategory["icon"] }) {
  const className = "care-plan-card-icon h-[22px] w-[22px] shrink-0";
  switch (name) {
    case "nutrition":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M14.55 5.05c.55-.7.95-1.7.85-2.7-1 .05-2.15.65-2.85 1.45-.6.65-1.1 1.65-.9 2.65 1.05.05 2.05-.6 2.9-1.4Z" />
          <path d="M16.35 8.2c-.9-.05-1.7.5-2.25.5-.6 0-1.5-.48-2.5-.48-1.3 0-2.5.75-3.15 1.9-1.35 2.3-.35 5.8.95 7.7.65.9 1.4 1.95 2.4 1.9.95-.05 1.3-.7 2.5-.7s1.5.7 2.55.7c1.05 0 1.75-1 2.4-1.95.5-.75.85-1.55 1.1-2.05-1.85-.7-2.15-2.55-2.1-3.7.05-1.65 1.1-2.7 1.15-2.75-.9-1.3-2.3-1.45-3.05-1.47Z" />
        </svg>
      );
    case "scalp":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <path d="M12 3.6c2.4 3.2 5.2 6.6 5.2 9.4a5.2 5.2 0 1 1-10.4 0C6.8 10.2 9.6 6.8 12 3.6Z" strokeLinejoin="round" />
        </svg>
      );
    case "sleep":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M13.2 4.4a8.2 8.2 0 1 0 6.4 11.6A7.1 7.1 0 0 1 13.2 4.4Z" />
        </svg>
      );
    case "styling":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <path d="M7.2 4.5h3.1v15H7.2v-15Z" strokeLinejoin="round" />
          <path d="M10.3 8.2H18l-2.2 2.8L18 13.8h-7.7" strokeLinejoin="round" />
        </svg>
      );
    case "stress":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <path d="M4 13h3.4l1.8-5.2 2.6 8.4L14.6 9 16.4 13H20" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function ExpandedCategory({ category }: { category: HairHabitCategory }) {
  return (
    <section className="care-plan-card overflow-hidden rounded-[28px] px-5 pt-5">
      <div className="flex items-center gap-2.5 px-1 pb-4 pt-1">
        <CategoryIcon name={category.icon} />
        <h2 className="care-plan-card-title font-title text-[22px] font-semibold tracking-[-0.03em]">{category.title}</h2>
      </div>
      <ul className="care-plan-card-items -mx-5">
        {category.tips.map((tip, index) => (
          <li key={tip.slug}>
            <Link
              href={`/care/habits/${category.slug}/${tip.slug}`}
              className={`flex items-center gap-3 px-5 py-4 ${
                index < category.tips.length - 1 ? "care-plan-card-rule border-b" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="care-plan-card-copy text-[16px] font-medium leading-snug tracking-[-0.02em]">{tip.summary}</p>
                <p className="mt-1.5 text-[14px] font-medium text-[#c4715a]">{tip.support}</p>
              </div>
              <Chevron />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CollapsedCategory({
  category,
  onOpen,
}: {
  category: HairHabitCategory;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="care-plan-card flex w-full items-center gap-3 rounded-[28px] px-5 py-[22px] text-left"
    >
      <CategoryIcon name={category.icon} />
      <span className="care-plan-card-title min-w-0 flex-1 font-title text-[22px] font-semibold tracking-[-0.03em]">
        {category.title}
      </span>
      <Chevron />
    </button>
  );
}

function CheckInCategory({ item }: { item: LifestyleCheckInCard }) {
  return (
    <Link href={item.href} className="care-plan-card flex w-full items-center gap-3 rounded-[28px] px-5 py-[22px] text-left">
      <CategoryIcon name={item.slug} />
      <span className="min-w-0 flex-1">
        <span className="care-plan-card-title block font-title text-[22px] font-semibold tracking-[-0.03em]">
          {item.title}
        </span>
        <span className="mt-1 block text-[14px] font-medium text-[var(--care-muted)]">{item.eyebrow}</span>
      </span>
      <span className="rounded-full bg-[var(--care-chip)] px-2.5 py-1 text-[11px] font-semibold text-[var(--care-chip-ink)]">
        Check in
      </span>
      <Chevron />
    </Link>
  );
}

export default function ActionPlan({
  openSlug,
  variant = "page",
  categories,
  checkIns = [],
  heading = "Action Plan",
  empty,
}: {
  openSlug?: string;
  variant?: "page" | "embed";
  categories: HairHabitCategory[];
  checkIns?: LifestyleCheckInCard[];
  heading?: string;
  empty?: string;
}) {
  const router = useRouter();
  const fallback = openSlug && categories.some((category) => category.slug === openSlug)
    ? openSlug
    : categories[0]?.slug ?? "";
  const [expanded, setExpanded] = useState(fallback);
  const categoryKey = categories.map((category) => category.slug).join(",");

  useEffect(() => {
    setExpanded((current) => {
      const slugs = categoryKey ? categoryKey.split(",") : [];
      if (openSlug && slugs.includes(openSlug)) return openSlug;
      if (current && slugs.includes(current)) return current;
      return slugs[0] ?? "";
    });
  }, [openSlug, categoryKey]);

  const openCategory = (slug: string) => {
    setExpanded(slug);
    if (variant === "page") {
      router.push(`/care/habits/${slug}`, { scroll: false });
    }
  };

  return (
    <div className={`flex w-full flex-col ${variant === "page" ? "mx-auto max-w-[430px]" : ""}`}>
      {variant === "page" ? (
        <header className="relative mb-5 flex items-center justify-center py-1">
          <Link
            href="/care"
            aria-label="Back to Insights"
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
      ) : (
        <div className="mb-4">
          <h2 className="font-title text-[22px] font-medium tracking-[-0.03em] text-[var(--care-ink)]">{heading}</h2>
          <p className="mt-1 text-[14px] font-medium text-[var(--care-muted)]">
            Small habits next to your medication. None of these replace the prescription.
          </p>
        </div>
      )}

      {categories.length === 0 && checkIns.length === 0 ? (
        <p className="care-plan-card rounded-[28px] px-5 py-6 text-[15px] font-medium leading-relaxed text-[var(--care-muted)]">
          {empty || "Nothing here yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {checkIns.map((item) => (
            <CheckInCategory key={item.slug} item={item} />
          ))}
          {categories.map((category) =>
            category.slug === expanded ? (
              <ExpandedCategory key={category.slug} category={category} />
            ) : (
              <CollapsedCategory key={category.slug} category={category} onOpen={() => openCategory(category.slug)} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
