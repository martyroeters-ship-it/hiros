"use client";

import Image from "next/image";
import Header from "@/components/Header";
import PrivacyCarousel from "@/components/PrivacyCarousel";
import FloatingChat from "@/components/FloatingChat";
import { HOME_PAGE_GUTTER_CLASS, HOME_PAGE_PEEK_CAROUSEL_CLASS } from "@/constants/homeHeaderLayout";
import { useHomeCopy } from "@/i18n/LanguageProvider";

const assetVersion = "20260520-1637";

function HomeContent() {
  const { copy } = useHomeCopy();

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-clip bg-[#fbfaf5] text-[#11110f]">
      <section className="relative z-30 -mt-16 pb-0">
        <div className="relative">
          <div id="start" className="relative min-h-0 w-full overflow-hidden rounded-b-[34px] rounded-t-[0px] bg-[#718864] bg-[url('/hiros_hero_background.png')] bg-cover bg-[position:78%_center] sm:min-h-[700px] sm:bg-[position:20%_center] sm:bg-[length:100%_100%]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#fbfaf5_0%,#fbfaf5_38%,rgba(251,250,245,0.72)_58%,rgba(251,250,245,0.18)_78%,rgba(251,250,245,0)_100%)] sm:bg-[radial-gradient(ellipse_at_bottom_left,#fbfaf5_0%,#fbfaf5_18%,rgba(251,250,245,0.75)_30%,rgba(251,250,245,0.35)_43%,rgba(251,250,245,0)_58%)]" />
            <div className={`relative z-10 flex h-full w-full max-w-7xl flex-col justify-center pt-28 pb-12 sm:pt-40 sm:pb-20 ${HOME_PAGE_GUTTER_CLASS}`}>
              <div className="text-left">
                <h1 className="font-title text-[36px] font-normal leading-[1.08] tracking-[-0.06em] text-[#1f241b] sm:text-[48px] lg:text-[64px] lg:leading-[1.1] lg:tracking-[-0.07em]">
                  <span className="inline-block bg-gradient-to-r from-[#3f5f35] via-[#6f8759] to-[#6a8255] bg-clip-text text-transparent">
                    {copy.hero.titleLine1}
                  </span>
                  <br />
                  {copy.hero.titleLine2}
                </h1>
                <p className="mt-4 max-w-xl text-[15px] font-medium leading-[1.45] text-[#1f241b]/80 sm:mt-6 sm:text-lg">
                  {copy.hero.subtitle}
                </p>
              </div>
              <div className="mt-8 flex w-full max-w-3xl flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-6">
                  {copy.hero.cards.map((card) => (
                    <a
                      key={card.href}
                      href={card.href}
                      className="group relative flex min-h-[92px] w-full items-center rounded-[28px] bg-gradient-to-br from-[#a3b494] to-[#8fa07d] px-5 py-5 text-left transition-[background,transform] duration-200 transform-gpu hover:scale-[1.01] hover:from-[#97a888] hover:to-[#7f9870] lg:h-[168px] lg:min-h-0 lg:flex-col lg:items-start lg:rounded-2xl lg:px-6 lg:py-6"
                    >
                      <div className="flex w-full min-w-0 items-center justify-between gap-3 lg:items-end">
                        <h3 className="text-[20px] font-medium leading-[1.1] tracking-[-0.03em] text-white lg:text-[26px]">{card.title}</h3>
                        <div className="flex shrink-0 items-center gap-3">
                          {card.badge ? (
                            <span className="rounded-full bg-[#e6efe2] px-3 py-1 text-[11px] font-medium text-[#3f5f35] lg:-translate-y-1">{card.badge}</span>
                          ) : null}
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] text-white/80 lg:hidden" aria-hidden="true">
                            <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-auto hidden w-full items-end justify-between gap-3 lg:flex">
                        <p className="text-[13px] font-normal text-white/90">{card.description}</p>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0 text-white/80 transition-transform group-hover:translate-x-0.5">
                          <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              <p className="mt-5 text-[13px] text-[#1f241b]/60 sm:mt-6 sm:text-sm">
                {copy.hero.socialProof}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className={`bg-[#fbfaf5] pb-16 pt-12 sm:pb-24 sm:pt-20 ${HOME_PAGE_GUTTER_CLASS}`}>
        <div className="max-w-7xl">
          <div className="mb-8 flex items-center justify-between sm:mb-10">
            <h2 className="font-title max-w-5xl text-[32px] font-normal leading-[1.05] tracking-[-0.06em] sm:text-[44px] lg:text-[55px] lg:leading-[1] lg:tracking-[-0.07em]">
              {copy.about.titleLine1}
              <br />
              <span className="inline-block bg-gradient-to-r from-[#3f5f35] via-[#6f8759] to-[#9aa786] bg-clip-text pr-2 -mr-2 text-transparent">
                {copy.about.titleLine2}
              </span>
            </h2>
          </div>
          <PrivacyCarousel />
        </div>
      </section>

      <section id="how" className={`relative overflow-hidden rounded-t-[34px] bg-[#b77a61] bg-[url('/stay_control_background.png')] bg-cover bg-[position:20%_center] py-16 text-white sm:py-24 ${HOME_PAGE_GUTTER_CLASS}`}>
        <div className="max-w-7xl">
          <div className="lg:ml-auto lg:max-w-[54rem]">
            <h2 className="font-title mb-8 max-w-5xl text-[32px] font-normal leading-[1.05] tracking-[-0.06em] sm:mb-12 sm:text-[44px] lg:text-[55px] lg:leading-[1] lg:tracking-[-0.07em]">
              {copy.how.title}
            </h2>
            <div className={HOME_PAGE_PEEK_CAROUSEL_CLASS}>
              <div className="flex w-max gap-3 lg:grid lg:w-full lg:grid-cols-2 lg:gap-6">
                {copy.how.cards.map((card) => (
                  <article key={card.key} className="relative flex h-[22rem] w-[78vw] min-w-[78vw] snap-start flex-col justify-between overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-white/24 via-white/16 to-white/10 px-6 pb-8 pt-16 backdrop-blur lg:w-auto lg:min-w-0 lg:rounded-2xl lg:px-10 lg:pb-10 lg:pt-[94px]">
                    <Image
                      src={card.key === "understand-science" ? `/overlay1.png?v=${assetVersion}` : `/overlay2.png?v=${assetVersion}`}
                      alt=""
                      fill
                      unoptimized
                      style={
                        card.key === "stay-in-control"
                          ? { objectPosition: "center calc(50% + 10px)" }
                          : undefined
                      }
                      className="pointer-events-none object-cover brightness-105 contrast-110 saturate-110"
                    />
                    <div className="relative z-10">
                      <h3 className="mb-4 text-[24px] font-semibold leading-[1.05] tracking-[-0.05em] sm:mb-6 sm:text-[28px]">
                        {card.titleLine1}
                        <br />
                        <span className="inline-block bg-gradient-to-r from-[#60382b] via-[#6a4132] to-[#765040] bg-clip-text pr-2 -mr-2 text-transparent">
                          {card.titleLine2}
                        </span>
                      </h3>
                      <p className="max-w-[75%] text-[15px] font-medium leading-[1.35] tracking-[-0.03em] text-white/80 sm:text-[17px]">{card.description}</p>
                    </div>
                    <a href="#" className="relative z-10 ml-auto w-fit rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]">{card.cta}</a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-[#fbfaf5] pb-16 pt-12 sm:pb-20 sm:pt-16 ${HOME_PAGE_GUTTER_CLASS}`}>
        <div className="grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <h2 className="font-title mb-6 text-[32px] font-normal leading-[1.05] tracking-[-0.06em] sm:text-[44px] lg:text-[55px] lg:leading-[1] lg:tracking-[-0.07em]">
              {copy.faq.titleLine1}
              <br />
              {copy.faq.titleLine2}
            </h2>
            <a href="#" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]">{copy.faq.cta}</a>
          </div>
          <div className="divide-y divide-black/10">
            {copy.faq.items.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium sm:text-base">
                  {faq.question}
                  <span className="transition group-open:rotate-180">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0">
                      <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <p className="max-w-[48rem] pt-4 text-[15px] font-medium leading-[1.35] tracking-[-0.02em] text-black/55 sm:text-[16px]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-black pb-10 pt-12 text-white sm:pt-16 ${HOME_PAGE_GUTTER_CLASS}`}>
        <div className="grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-[1.1fr_2fr] md:gap-16">
          <div className="flex flex-col justify-start gap-6 self-stretch md:h-full md:justify-end">
            <div
              role="img"
              aria-label="Hiros"
              style={{
                WebkitMaskImage: "url('/hiros_logo.png')",
                maskImage: "url('/hiros_logo.png')",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "left center",
                maskPosition: "left center",
              }}
              className="h-10 w-28 bg-gradient-to-r from-[#3f5f35] via-[#6f8759] to-[#7f906d] sm:h-[72px] sm:w-44"
            />
            <div className="flex items-center gap-3 sm:gap-4">
              <a href="#" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a] sm:h-12 sm:w-12">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.5-.1-1.4-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4V11H7.5v3h2.4v7h3.6Z" />
                </svg>
              </a>
              <a href="#" aria-label="X" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a] sm:h-12 sm:w-12">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M18.9 3H21l-6.8 7.7L22 21h-6.1l-4.8-6.3L5.6 21H3.5l7.2-8.2L3 3h6.2l4.3 5.8L18.9 3Zm-1.1 16h1.2L8.5 4.9H7.2l10.6 14.1Z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a] sm:h-12 sm:w-12">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="TikTok" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a] sm:h-12 sm:w-12">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M14.6 3c.2 1.8 1.2 3.4 2.8 4.3 1 .6 2.1.9 3.3.9v3.1c-1.3 0-2.6-.3-3.8-.9l-.1-.1v5.9c0 1.4-.5 2.7-1.5 3.7s-2.3 1.5-3.7 1.5-2.7-.5-3.7-1.5-1.5-2.3-1.5-3.7.5-2.7 1.5-3.7 2.3-1.5 3.7-1.5c.3 0 .7 0 1 .1v3.2c-.3-.1-.6-.2-1-.2-.6 0-1.1.2-1.5.6s-.6.9-.6 1.5.2 1.1.6 1.5.9.6 1.5.6 1.1-.2 1.5-.6.6-.9.6-1.5V3h3.4Z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 sm:gap-14">
            {copy.footer.columns.map(([heading, ...links]) => (
              <div key={heading}>
                <h3 className="mb-4 font-semibold text-[#848484]">{heading}</h3>
                <ul className="space-y-2 text-[16px] font-bold text-white">
                  {links.map((link) => (
                    <li key={link}>{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex max-w-7xl flex-wrap gap-x-6 gap-y-3 text-[13px] font-medium text-white/80 sm:mt-20 sm:gap-x-8 sm:text-sm">
          {copy.footer.links.map((link) => (
            <a key={link} href="#" className="transition-colors hover:text-white">
              {link}
            </a>
          ))}
        </div>
        <div className="mt-8 max-w-7xl text-center text-sm font-medium text-white/60">© Hiros 2026</div>
      </footer>
      <FloatingChat />
      <style>{`
        @keyframes heroFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.04);
          }
        }

        @keyframes heroDrift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(26px, -14px, 0);
          }
        }

        @keyframes heroPulse {
          0%,
          100% {
            opacity: 0.45;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.75;
            transform: translateX(-50%) scale(1.08);
          }
        }
      `}</style>
    </main>
    </>
  );
}

export default function Home() {
  return <HomeContent />;
}
