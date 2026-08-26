"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { faqCategories } from "@/data/faqCategories";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";

function CategoryIcon({ slug }: { slug: string }) {
  const className = "h-6 w-6 text-[#2a412c]";

  switch (slug) {
    case "how-hiros-works":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "assessment-and-care":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M8 4.75h8A2.25 2.25 0 0 1 18.25 7v13L12 16.5 5.75 20V7A2.25 2.25 0 0 1 8 4.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "account-and-privacy":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="6.75" y="10.75" width="10.5" height="8.5" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.75 10.75V8.5a3.25 3.25 0 0 1 6.5 0v2.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "prescriptions-and-pharmacy":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="4.75" y="5.75" width="14.5" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "orders-and-delivery":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M3.75 7.75h11.5v8.5H3.75z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M15.25 11.25h3.2L20.25 14v2.25h-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="7.25" cy="18.25" r="1.25" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17.25" cy="18.25" r="1.25" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.5 10.25a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2.9-1.2 1.8V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="17.25" r=".8" fill="currentColor" />
        </svg>
      );
  }
}

export default function FaqHub() {
  const [query, setQuery] = useState("");

  const visibleCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return faqCategories;

    return faqCategories.filter(
      (category) =>
        category.title.toLowerCase().includes(needle) ||
        category.description.toLowerCase().includes(needle) ||
        category.items.some(
          (item) => item.question.toLowerCase().includes(needle) || item.answer.toLowerCase().includes(needle),
        ),
    );
  }, [query]);

  return (
    <>
      <section
        className={`relative flex min-h-[440px] items-center bg-[linear-gradient(115deg,#9aaf8c_0%,#e4dfd3_48%,#d2b09a_100%)] sm:min-h-[560px] ${HOME_PAGE_GUTTER_CLASS}`}
      >
        <div className="w-full max-w-2xl">
          <h1 className="font-title text-left text-[40px] font-normal leading-[1.02] tracking-[-0.06em] text-white sm:text-[56px] lg:text-[72px] lg:leading-[1] lg:tracking-[-0.07em]">
            How can we help?
          </h1>
          <p className="mt-1 text-[16px] font-medium text-white/90 sm:mt-1.5 sm:text-[18px]">
            Find answers about Hiros, your account and how the process works.
          </p>
          <label className="relative mt-8 block w-full">
            <span className="sr-only">Search FAQs</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.7" />
              <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for answers..."
              className="w-full rounded-2xl border border-white/20 bg-white/15 py-4 pl-12 pr-4 text-[16px] font-medium text-white outline-none placeholder:text-white/65 focus:border-white/40"
            />
          </label>
        </div>
      </section>

      <section className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-[#f7f4ee] pb-28 pt-16 sm:pb-36 sm:pt-20 ${HOME_PAGE_GUTTER_CLASS}`}>
        <div className="mx-auto max-w-7xl">
          {visibleCategories.length === 0 ? (
            <p className="text-[16px] font-medium text-[#1f241b]/70">No matching topics. Try a different search.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {visibleCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/faq/${category.slug}`}
                  className="flex min-h-[220px] flex-col rounded-[20px] border border-[rgba(80,90,70,0.16)] bg-white p-6 shadow-[0_8px_28px_rgba(40,45,35,0.04)] transition-transform duration-200 hover:scale-[1.01] sm:p-7"
                >
                  <CategoryIcon slug={category.slug} />
                  <h2 className="mt-5 text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-[#11110f] sm:text-[24px]">
                    {category.title}
                  </h2>
                  <p className="mt-3 text-[16px] font-medium leading-[1.5] text-[#1f241b]/70">{category.description}</p>
                  <span className="mt-auto pt-6 text-[14px] font-semibold text-[#3f5f35]">View questions</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
