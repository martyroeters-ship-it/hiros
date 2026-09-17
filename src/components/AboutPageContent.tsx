"use client";

import Link from "next/link";
import FloatingChat from "@/components/FloatingChat";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { secondaryCopy } from "@/i18n/secondaryCopy";
import { useHydratedLocale } from "@/i18n/LanguageProvider";

export default function AboutPageContent() {
  const locale = useHydratedLocale();
  const copy = secondaryCopy[locale].about;

  return (
    <>
      <LegalHeader />
      <main className="min-h-screen overflow-x-clip bg-[#fbfaf5] text-[#11110f]">
        <section
          className={`relative flex min-h-[440px] items-center bg-[linear-gradient(115deg,#9aaf8c_0%,#e4dfd3_48%,#d2b09a_100%)] sm:min-h-[560px] ${HOME_PAGE_GUTTER_CLASS}`}
        >
          <div>
            <h1 className="font-title text-left text-[40px] font-normal leading-[1.02] tracking-[-0.06em] text-white sm:text-[56px] lg:text-[72px] lg:leading-[1] lg:tracking-[-0.07em]">
              {copy.heroTitle}
            </h1>
            <p className="mt-1 text-[16px] font-medium text-white/90 sm:mt-1.5 sm:text-[18px]">{copy.heroSubtitle}</p>
          </div>
        </section>

        <section className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-[#f7f4ee] pb-16 pt-16 sm:pb-24 sm:pt-20 ${HOME_PAGE_GUTTER_CLASS}`}>
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-title text-[36px] font-normal leading-[1.08] tracking-[-0.06em] text-[#1f241b] sm:text-[52px] lg:text-[64px] lg:leading-[1.06] lg:tracking-[-0.07em]">
                {copy.missionBefore}<span className="text-[#3f5f35]">{copy.simpler}</span>
                {copy.missionMid1}<span className="text-[#60382b]">{copy.morePrivate}</span>
                {copy.missionMid2}<span className="text-[#2a412c]">{copy.easier}</span>
                {copy.missionAfter}
              </p>
              <h2 className="mt-16 font-title text-[32px] font-normal leading-[1.08] tracking-[-0.06em] text-[#1f241b] sm:mt-20 sm:text-[44px] lg:text-[55px]">
                {copy.trustHeading}
              </h2>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-3">
              {copy.cards.map((card) => (
                <article
                  key={card.title}
                  className="flex min-h-[300px] flex-col rounded-[28px] bg-white p-7 shadow-[0_8px_28px_rgba(40,45,35,0.04)] sm:rounded-[32px] sm:p-8"
                >
                  <h3 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.04em] text-[#2a412c] sm:text-[28px]">
                    {card.title}
                  </h3>
                  <p className="mt-auto text-[18px] font-medium leading-[1.5] tracking-[-0.02em] text-[#1f241b]/70">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`relative z-10 flex min-h-[640px] items-center overflow-hidden rounded-t-[34px] bg-[#6f8759] bg-[url('/header_banner4.webp')] bg-cover bg-[position:72%_center] sm:min-h-[800px] ${HOME_PAGE_GUTTER_CLASS}`}
        >
          <div className="flex flex-col items-start">
            <h2 className="font-title max-w-[18ch] text-left text-[40px] font-normal leading-[1.02] tracking-[-0.06em] text-white sm:text-[56px] lg:text-[72px] lg:leading-[1] lg:tracking-[-0.07em]">
              {copy.bannerTitleLine1}
              <br />
              {copy.bannerTitleLine2}
            </h2>
            <Link
              href="/#how"
              className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-[rgba(62,48,38,0.42)] px-8 py-3.5 text-[16px] font-medium text-white backdrop-blur-md transition-colors hover:bg-[rgba(62,48,38,0.55)] sm:mt-8 sm:px-10 sm:py-4 sm:text-[18px]"
            >
              {copy.bannerCta}
              <span aria-hidden="true">+</span>
            </Link>
          </div>
        </section>

        <section className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-[#fbfaf5] pb-20 pt-16 sm:pb-28 sm:pt-24 ${HOME_PAGE_GUTTER_CLASS}`}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-title text-[32px] font-normal leading-[1.08] tracking-[-0.06em] text-[#1f241b] sm:text-[44px] lg:text-[55px]">
              {copy.closeHeadingLine1}
              <br />
              {copy.closeHeadingLine2}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[16px] font-medium leading-[1.55] text-[#1f241b]/75 sm:text-[18px]">
              {copy.closeBody}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/intake"
                className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[#11110f] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
              >
                {copy.startAssessment}
              </Link>
              <span className="inline-flex rounded-full bg-[linear-gradient(115deg,#9aaf8c_0%,#e4dfd3_48%,#d2b09a_100%)] p-[1.5px]">
                <Link
                  href="/#how"
                  className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[#fbfaf5] px-7 py-3.5 text-[15px] font-semibold text-[#11110f] transition-colors hover:bg-[#f3f0e8]"
                >
                  {copy.howItWorks}
                </Link>
              </span>
            </div>
          </div>
        </section>

        <SiteFooter />
        <FloatingChat />
      </main>
    </>
  );
}
