"use client";

import Image from "next/image";
import Header from "@/components/Header";
import PrivacyCarousel from "@/components/PrivacyCarousel";
import FloatingChat from "@/components/FloatingChat";
import { HOME_PAGE_GUTTER_CLASS, HOME_PAGE_PEEK_CAROUSEL_CLASS } from "@/constants/homeHeaderLayout";
import { useHomeCopy } from "@/i18n/LanguageProvider";
import SiteFooter from "@/components/SiteFooter";

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
                  {copy.hero.cards.map((card) => {
                    const isHairLoss = card.href.includes("hair-loss");

                    return (
                    <a
                      key={card.href}
                      href={card.href}
                      className={`group relative flex min-h-[92px] w-full items-center overflow-hidden rounded-[28px] border border-[rgba(80,90,70,0.20)] px-5 py-5 text-left shadow-[0_4px_16px_rgba(40,45,35,0.035)] transition-[background,transform] duration-200 transform-gpu hover:scale-[1.01] lg:h-[168px] lg:min-h-0 lg:flex-col lg:items-start lg:rounded-2xl lg:px-6 lg:py-6 ${
                        isHairLoss ? "bg-[#F1F2EA] hover:bg-[#eceee5]" : "bg-[#F3F0E9] hover:bg-[#eeeae2]"
                      }`}
                    >
                      <div className="flex w-full min-w-0 items-center justify-between gap-3 lg:items-end">
                        <h3 className="text-[20px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1f241b] lg:text-[26px]">{card.title}</h3>
                        <div className="flex shrink-0 items-center gap-3">
                          {card.badge ? (
                            <span className="rounded-full bg-[#dce4d6] px-3 py-1 text-[11px] font-medium text-[#3f5f35] lg:-translate-y-1">{card.badge}</span>
                          ) : null}
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a412c] text-white lg:hidden">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" aria-hidden="true">
                              <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="mt-auto hidden w-full items-end justify-between gap-3 lg:flex">
                        <p className="text-[13px] font-medium leading-[1.35] tracking-[-0.03em] text-[#1f241b]/70">{card.description}</p>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2a412c] text-white transition-transform group-hover:translate-x-0.5">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" aria-hidden="true">
                            <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </a>
                    );
                  })}
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

      <section id="faq" className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-[#fbfaf5] pb-16 pt-12 sm:pb-20 sm:pt-16 ${HOME_PAGE_GUTTER_CLASS}`}>
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

      <SiteFooter />
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
