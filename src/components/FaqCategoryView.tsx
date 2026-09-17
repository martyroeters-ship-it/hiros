"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { faqCategories, type FaqCategory } from "@/data/faqCategories";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { secondaryCopy } from "@/i18n/secondaryCopy";
import { loc } from "@/i18n/localeText";
import { useHydratedLocale } from "@/i18n/LanguageProvider";

function AnswerText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!match) {
          return <span key={index}>{part}</span>;
        }

        const [, label, href] = match;
        return (
          <Link key={index} href={href} className="font-semibold text-[#3f5f35] underline underline-offset-[3px]">
            {label}
          </Link>
        );
      })}
    </>
  );
}

export default function FaqCategoryView({ category }: { category: FaqCategory }) {
  const locale = useHydratedLocale();
  const copy = secondaryCopy[locale].faq;
  const [query, setQuery] = useState("");
  const categoryTitle = loc(category.title, locale);

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return category.items;

    return category.items.filter(
      (item) =>
        loc(item.question, locale).toLowerCase().includes(needle) ||
        loc(item.answer, locale).toLowerCase().includes(needle),
    );
  }, [category.items, locale, query]);

  return (
    <div className={`pb-28 pt-10 sm:pb-36 sm:pt-14 ${HOME_PAGE_GUTTER_CLASS}`}>
      <p className="text-[13px] font-medium text-[#b77a61] sm:text-[14px]">
        <Link href="/" className="transition-colors hover:text-[#60382b]">
          {copy.home}
        </Link>
        {" / "}
        <Link href="/faq" className="transition-colors hover:text-[#60382b]">
          {copy.faqs}
        </Link>
        {" / "}
        <span>{categoryTitle}</span>
      </p>

      <div className="mt-8 flex flex-col gap-6 lg:mt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <h1 className="font-title text-[36px] font-normal leading-[1.08] tracking-[-0.06em] text-[#11110f] sm:text-[48px] lg:text-[56px]">
            {categoryTitle}
          </h1>
          <p className="mt-2 text-[16px] font-medium text-[#1f241b]/70 sm:text-[18px]">
            {copy.subtitle}
          </p>
        </div>
        <label className="relative w-full max-w-md shrink-0">
          <span className="sr-only">{copy.topicSearchAria}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#11110f]/45"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.7" />
            <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.topicSearchPlaceholder}
            className="w-full rounded-lg border border-black/15 bg-transparent py-2.5 pl-10 pr-4 text-[15px] font-medium text-[#11110f] outline-none placeholder:text-[#11110f]/40 focus:border-[#2a412c]/40"
          />
        </label>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20 xl:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label={copy.topicsNav} className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-x-6 gap-y-3 overflow-x-auto pb-1 text-[16px] font-medium text-[#11110f] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:gap-4 lg:overflow-visible lg:pb-0">
            {faqCategories.map((item) => {
              const isActive = item.slug === category.slug;

              return (
                <li key={item.slug} className="shrink-0">
                  <Link
                    href={`/faq/${item.slug}`}
                    className={`whitespace-nowrap transition-colors hover:text-[#2a412c] ${
                      isActive ? "underline decoration-[#11110f] decoration-1 underline-offset-[6px]" : ""
                    }`}
                  >
                    {loc(item.title, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          {visibleItems.length === 0 ? (
            <p className="text-[16px] font-medium text-[#1f241b]/70">{copy.emptyQuestions}</p>
          ) : (
            <div className="divide-y divide-black/10">
              {visibleItems.map((item) => (
                <article key={item.question.en} className="py-8 first:pt-0">
                  <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#11110f] sm:text-[18px]">
                    {loc(item.question, locale)}
                  </h2>
                  <p className="mt-3 max-w-[46rem] text-[15px] font-medium leading-[1.7] text-[#2b2a28]/80 sm:text-[16px] sm:leading-[1.75]">
                    <AnswerText text={loc(item.answer, locale)} />
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
