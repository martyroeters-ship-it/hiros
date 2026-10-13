"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Header from "@/components/Header";
import PrivacyCarousel, { type PrivacyCarouselHandle } from "@/components/PrivacyCarousel";
import LogoCarousel from "@/components/LogoCarousel";
import FloatingChat from "@/components/FloatingChat";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { useHomeCopy } from "@/i18n/LanguageProvider";
import SiteFooter from "@/components/SiteFooter";

function GalleryArrowButtons({
  onPrev,
  onNext,
  previousLabel,
  nextLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  previousLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        aria-label={previousLabel}
        onClick={onPrev}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f241b]/8 text-[#1f241b] transition-colors hover:bg-[#1f241b]/12"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M10 3.5 5.5 8 10 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        onClick={onNext}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f241b]/8 text-[#1f241b] transition-colors hover:bg-[#1f241b]/12"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function HomeContent() {
  const { copy } = useHomeCopy();
  const startCarouselRef = useRef<PrivacyCarouselHandle>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-clip bg-white text-[#11110f]">
      <section className="relative z-30 pb-0">
        <div className="relative">
          <div
            id="start"
            className="relative min-h-0 w-full overflow-hidden bg-white"
          >
            <div className={`relative z-10 flex w-full flex-col pt-6 pb-8 sm:pb-10 sm:pt-9 ${HOME_PAGE_GUTTER_CLASS}`}>
              <div className="text-left">
                <h1 className="font-title text-[32px] font-normal leading-[1.08] tracking-[-0.06em] text-[#1f241b] sm:text-[43px] lg:text-[58px] lg:leading-[1.1] lg:tracking-[-0.07em]">
                  <span className="inline-block bg-gradient-to-r from-[#3f5f35] via-[#6f8759] to-[#6a8255] bg-clip-text text-transparent">
                    {copy.hero.titleLine1}
                  </span>
                  <br />
                  {copy.hero.titleLine2}
                </h1>
              </div>
              <div className="mt-[15px]">
                <div className="mb-0 grid w-full grid-cols-1 gap-3 sm:mb-5 lg:grid-cols-2 lg:gap-4">
                  {copy.hero.steps.map((step, index) => (
                      <a
                        key={step.step}
                        href={step.href}
                        className="group relative flex aspect-[1938/920] min-h-0 overflow-hidden rounded-[28px] bg-[#e8e0d4] transition-colors duration-200 hover:bg-[#e0d8cc]"
                      >
                        {index === 0 || index === 1 ? (
                          <div
                            className={`pointer-events-none absolute bottom-0 ${index === 1 ? "right-0 min-[734px]:right-[6%]" : "right-[6%]"} ${index === 0 ? "h-[90%] w-[38%]" : "h-[99%] w-[63%]"}`}
                          >
                            <Image
                              src={index === 0 ? "/phone_intro_cut.png" : "/intro_doctor.png"}
                              alt=""
                              fill
                              sizes="(max-width: 1024px) 50vw, 22vw"
                              className="object-contain object-bottom"
                              priority
                              unoptimized
                            />
                          </div>
                        ) : null}
                        <div className="relative z-10 flex w-full flex-col justify-between px-6 py-6 text-[#1f241b] sm:px-8 sm:py-8">
                          <h3 className="max-w-[16ch] font-title text-[22px] font-medium leading-[1.15] tracking-[-0.04em] text-[#1f241b] sm:text-[28px] sm:leading-[1.12]">
                            {step.title}
                          </h3>
                          <div className="mt-6 flex items-center justify-start gap-3">
                            <span className="text-[14px] font-medium tracking-[-0.01em] text-[#1f241b]">
                              {step.cta}
                            </span>
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f241b]/10 text-[#1f241b] transition-transform duration-200 group-hover:translate-x-0.5">
                              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                                <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                </div>
                <div aria-hidden="true" className="flex h-[50px] items-center sm:hidden">
                  <div className="h-px w-full bg-[#E8E8E5]" />
                </div>
                <div id="get-started" className="grid w-full scroll-mt-28 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 lg:items-stretch">
                  {copy.hero.cards.map((card) => {
                    const cardImageSrc = card.href.includes("condition=hair-loss")
                      ? "/intro_hair.png"
                      : card.href.includes("premature-ejaculation")
                        ? "/intro_ejaculation.png"
                        : card.href.includes("condition=erection")
                          ? "/intro_erection.png"
                          : card.href.includes("intimate-skin")
                            ? "/intro_intimate.png"
                            : null;

                    if (cardImageSrc) {
                      const isHairCard = cardImageSrc === "/intro_hair.png";
                      const isEjaculationCard = cardImageSrc === "/intro_ejaculation.png";

                      return (
                        <a
                          key={card.href}
                          href={card.href}
                          className="flex h-full flex-col overflow-hidden rounded-[18px] bg-[#f7f6f3] text-left text-[#1f241b] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-200 hover:bg-[#efeee9]"
                        >
                          <div className="relative aspect-[2048/768] w-full overflow-hidden bg-[#ebe8e1]">
                            <Image
                              src={cardImageSrc}
                              alt=""
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className={
                                isHairCard
                                  ? "object-contain object-bottom scale-[1.12] origin-bottom"
                                  : isEjaculationCard
                                    ? "object-contain translate-y-[10%]"
                                    : "object-contain"
                              }
                              unoptimized
                            />
                          </div>
                          <div className="flex flex-1 items-center gap-3 px-5 py-5 sm:px-5 sm:py-6">
                            <div className="min-w-0 flex-1 overflow-visible">
                              <h3 className="whitespace-nowrap text-[16px] font-semibold leading-none tracking-[-0.03em] sm:text-[18px]">
                                {card.title}
                              </h3>
                              <p className="mt-1.5 whitespace-nowrap text-[14px] font-medium leading-none tracking-[-0.02em] text-[#1f241b]/55">
                                {card.description}
                              </p>
                            </div>
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              className="ml-auto h-[16px] w-[16px] shrink-0 text-[#1f241b]/30"
                              aria-hidden="true"
                            >
                              <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </a>
                      );
                    }

                    return (
                      <a
                        key={card.href}
                        href={card.href}
                        className="flex h-full items-center gap-3 rounded-[18px] bg-[#f7f6f3] px-5 py-6 text-left text-[#1f241b] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-200 hover:bg-[#efeee9] sm:px-5 sm:py-7"
                      >
                        <div className="min-w-0 flex-1 overflow-visible">
                          <h3 className="whitespace-nowrap text-[16px] font-semibold leading-none tracking-[-0.03em] sm:text-[18px]">
                            {card.title}
                          </h3>
                          <p className="mt-1.5 whitespace-nowrap text-[14px] font-medium leading-none tracking-[-0.02em] text-[#1f241b]/55">
                            {card.description}
                          </p>
                        </div>
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="ml-auto h-[16px] w-[16px] shrink-0 text-[#1f241b]/30"
                          aria-hidden="true"
                        >
                          <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white pt-4 pb-0 sm:pt-6">
        <div className={`flex w-full items-end justify-between gap-4 ${HOME_PAGE_GUTTER_CLASS}`}>
          <div className="min-w-0 max-w-[560px]">
            <p className="font-title text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f241b]/40 sm:text-[12px]">
              {copy.startGallery.eyebrow}
            </p>
            <h2 className="mt-3 font-title text-[36px] font-normal leading-[1.08] tracking-[-0.05em] text-[#1f241b] sm:text-[44px] min-[1068px]:text-[52px] min-[1068px]:leading-[1.06]">
              {copy.startGallery.titleLine1}
              <br />
              {copy.startGallery.titleLine2}
            </h2>
          </div>
          <GalleryArrowButtons
            previousLabel={copy.carousel.previous}
            nextLabel={copy.carousel.next}
            onPrev={() => startCarouselRef.current?.scrollPrev()}
            onNext={() => startCarouselRef.current?.scrollNext()}
          />
        </div>
        <PrivacyCarousel
          ref={startCarouselRef}
          className="mt-6"
          slides={copy.startGallery.slides}
          initialIndex={1}
          showControls={false}
          footerLeading={copy.logoCarousel.eyebrow}
        />
      </section>

      <LogoCarousel
        ariaLabel={copy.logoCarousel.ariaLabel}
        logos={copy.logoCarousel.logos}
      />

      <section id="faq" className="relative z-10 bg-[#f7f7f5] py-[76px]">
        <div className={`grid w-full grid-cols-1 gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 ${HOME_PAGE_GUTTER_CLASS}`}>
          <div>
            <p className="font-title text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f241b]/40 sm:text-[12px]">
              {copy.faq.eyebrow}
            </p>
            <h2 className="mt-3 mb-6 font-title text-[36px] font-normal leading-[1.08] tracking-[-0.05em] text-[#1f241b] sm:text-[44px] min-[1068px]:text-[52px] min-[1068px]:leading-[1.06]">
              {copy.faq.titleLine1}
              <br />
              {copy.faq.titleLine2}
            </h2>
            <a href={copy.faq.href} className="rounded-full bg-[#273a28] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2e422e]">{copy.faq.cta}</a>
          </div>
          <div className="divide-y divide-black/10">
            {copy.faq.items.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <details
                  key={faq.question}
                  className="group py-5"
                  open={isOpen}
                  onToggle={(event) => {
                    // Keep React as source of truth for exclusive accordion.
                    if (event.currentTarget.open && openFaqIndex !== index) {
                      setOpenFaqIndex(index);
                    }
                  }}
                >
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium sm:text-base"
                    onClick={(event) => {
                      event.preventDefault();
                      setOpenFaqIndex((current) => (current === index ? -1 : index));
                    }}
                  >
                    {faq.question}
                    <span className={`transition ${isOpen ? "rotate-180" : ""}`}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0">
                        <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  {isOpen ? (
                    <p className="max-w-[48rem] pt-4 text-[15px] font-medium leading-[1.35] tracking-[-0.02em] text-black/55 sm:text-[16px]">
                      {faq.answer}
                    </p>
                  ) : null}
                </details>
              );
            })}
          </div>
        </div>
      </section>

      <section id="professionals" className="relative z-10 bg-white pb-20 pt-12 sm:pt-14">
        <div className={`w-full ${HOME_PAGE_GUTTER_CLASS}`}>
          <h2 className="max-w-[28ch] font-title text-[36px] font-normal leading-[1.08] tracking-[-0.05em] text-[#1f241b] sm:text-[44px] min-[1068px]:text-[52px] min-[1068px]:leading-[1.06]">
            {copy.professionals.titleLine1}
            <br />
            {copy.professionals.titleLine2}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-2">
            {copy.professionals.cards.map((card, index) => (
              <a
                key={card.key}
                href={card.href}
                className={`group relative flex min-h-[290px] flex-col justify-end overflow-hidden rounded-[28px] transition-colors sm:min-h-[360px] lg:min-h-[380px] ${
                  index % 2 === 0 ? "bg-[#e8e6e1] hover:bg-[#e0ddd6]" : "bg-[#d9d6cf] hover:bg-[#d1cec6]"
                }`}
              >
                {card.key === "physician-workspace" ? (
                  <div
                    className="pointer-events-none absolute bottom-0 right-0 h-[80%] aspect-[1372/1147] translate-x-[32%] min-[734px]:h-full min-[734px]:translate-x-[12%]"
                  >
                    <Image
                      src="/bottom_doctor.png"
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 80vw, 460px"
                      className="object-contain object-bottom object-right"
                    />
                  </div>
                ) : null}
                {card.key === "patient-care" ? (
                  <div
                    className="pointer-events-none absolute bottom-0 right-0 h-[80%] aspect-[686/1021] translate-x-[50%] min-[734px]:h-[98%] min-[734px]:translate-x-[12%]"
                  >
                    <Image
                      src="/bottom_phone_cut.png"
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 60vw, 360px"
                      className="object-contain object-bottom object-right"
                    />
                  </div>
                ) : null}
                <div className="relative z-10 p-6 sm:p-8">
                  <h3 className="font-title text-[26px] font-medium leading-tight tracking-[-0.04em] text-[#1f241b] sm:text-[30px]">
                    {card.title}
                  </h3>
                  <p className={`mt-3 text-[15px] font-medium leading-[1.4] tracking-[-0.02em] text-[#1f241b]/60 sm:min-h-[88px] sm:text-[16px] ${card.key === "physician-workspace" ? "max-w-[24ch]" : "max-w-[26ch]"}`}>
                    {card.description}
                  </p>
                  <div>
                    <span className="mt-6 inline-flex rounded-full bg-[#273a28] px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-[#2e422e]">
                      {card.cta}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter className="bg-[#f7f7f5]" />
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
