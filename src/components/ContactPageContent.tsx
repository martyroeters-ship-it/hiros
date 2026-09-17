"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import FloatingChat from "@/components/FloatingChat";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { secondaryCopy } from "@/i18n/secondaryCopy";
import { useHydratedLocale } from "@/i18n/LanguageProvider";

const linkClassName = "font-semibold text-[#3f5f35] underline underline-offset-[3px]";

function ContactSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#11110f] sm:text-[22px]">{title}</h3>
      {children}
    </section>
  );
}

export default function ContactPageContent() {
  const locale = useHydratedLocale();
  const copy = secondaryCopy[locale].contact;

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

        <section className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-[#fbfaf5] pb-28 pt-16 sm:pb-36 sm:pt-20 ${HOME_PAGE_GUTTER_CLASS}`}>
          <article className="max-w-[42rem] text-left">
            <p className="text-[13px] font-medium text-[#11110f]/45 sm:text-[14px]">
              <Link href="/" className="transition-colors hover:text-[#11110f]/70">
                {copy.home}
              </Link>
              {" / "}
              <span className="font-semibold text-[#3f5f35]">{copy.crumb}</span>
            </p>

            <h2 className="mt-10 font-title text-[32px] font-bold leading-[1.1] tracking-[-0.04em] text-[#11110f] sm:mt-12 sm:text-[40px]">
              {copy.heading}
            </h2>

            <div className="mt-12 space-y-12 text-[16px] font-medium leading-[1.7] text-[#2b2a28]/88 sm:mt-14 sm:space-y-14 sm:text-[17px] sm:leading-[1.75]">
              <ContactSection title={copy.faqTitle}>
                <p>{copy.faqBody}</p>
                <p>
                  <Link href="/faq" className={linkClassName}>
                    {copy.faqLink}
                  </Link>
                </p>
                <p>{copy.faqFollowUp}</p>
              </ContactSection>

              <ContactSection title={copy.helpTitle}>
                <p>
                  {copy.helpBeforeEmail}
                  <a href="mailto:support@hiros.com.tr" className={linkClassName}>
                    support@hiros.com.tr
                  </a>
                  {copy.helpAfterEmail}
                </p>
                <p>{copy.helpChat}</p>
              </ContactSection>

              <ContactSection title={copy.hoursTitle}>
                <p>
                  <span className="font-bold text-[#11110f]">{copy.hours}</span>
                </p>
              </ContactSection>

              <ContactSection title={copy.medicalTitle}>
                <p>{copy.medicalIntro}</p>
                <p>
                  {copy.medicalBeforeAccount}
                  <Link href="/dashboard" className={linkClassName}>
                    {copy.medicalAccount}
                  </Link>
                  {copy.medicalAfterAccount}
                </p>
                <p>{copy.medicalClose}</p>
              </ContactSection>
            </div>
          </article>
        </section>

        <SiteFooter />
        <FloatingChat />
      </main>
    </>
  );
}
