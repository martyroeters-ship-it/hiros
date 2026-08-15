"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";

export default function Header() {
  const headerAssetVersion = "20260520-1637";
  const [scrollProgress, setScrollProgress] = useState(0);
  const [aboutSectionProgress, setAboutSectionProgress] = useState(0);
  const [howSectionProgress, setHowSectionProgress] = useState(0);
  const [afterHowSectionProgress, setAfterHowSectionProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      const scrollTop =
        document.scrollingElement?.scrollTop ??
        document.documentElement.scrollTop ??
        document.body.scrollTop ??
        window.scrollY;

      const nextProgress = Math.min(scrollTop / 72, 1);
      const aboutSection = document.getElementById("about");
      const howSection = document.getElementById("how");
      const afterHowSection = document.querySelector("section#how + section");
      let nextAboutSectionProgress = 0;
      let nextHowSectionProgress = 0;
      let nextAfterHowSectionProgress = 0;

      if (aboutSection) {
        const aboutSectionTop = aboutSection.getBoundingClientRect().top;
        nextAboutSectionProgress = Math.max(0, Math.min((96 - aboutSectionTop) / 96, 1));
      }

      if (howSection) {
        const howSectionTop = howSection.getBoundingClientRect().top;
        nextHowSectionProgress = Math.max(0, Math.min((96 - howSectionTop) / 96, 1));
      }

      if (afterHowSection instanceof HTMLElement) {
        const afterHowSectionTop = afterHowSection.getBoundingClientRect().top;
        nextAfterHowSectionProgress = Math.max(0, Math.min((96 - afterHowSectionTop) / 96, 1));
      }

      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setScrollProgress(nextProgress);
        setAboutSectionProgress(nextAboutSectionProgress);
        setHowSectionProgress(nextHowSectionProgress);
        setAfterHowSectionProgress(nextAfterHowSectionProgress);
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const headerPaddingY = 12;
  const buttonPaddingX = 16;
  const buttonPaddingY = 8;
  const buttonFontSize = 12;
  const introBackgroundProgress = Math.max(0, Math.min(scrollProgress / 0.24, 1));
  const mixChannel = (start: number, end: number, progress: number) =>
    Math.round(start + (end - start) * progress);
  const introBackgroundColor = `rgba(234, 225, 216, ${introBackgroundProgress})`;
  const aboutBackgroundColor = `rgb(${mixChannel(234, 255, aboutSectionProgress)}, ${mixChannel(225, 255, aboutSectionProgress)}, ${mixChannel(216, 255, aboutSectionProgress)})`;
  const howBackgroundColor = `rgb(${mixChannel(255, 175, howSectionProgress)}, ${mixChannel(255, 130, howSectionProgress)}, ${mixChannel(255, 112, howSectionProgress)})`;
  const afterHowBackgroundColor = `rgb(${mixChannel(175, 255, afterHowSectionProgress)}, ${mixChannel(130, 255, afterHowSectionProgress)}, ${mixChannel(112, 255, afterHowSectionProgress)})`;
  const isClaySection = howSectionProgress > 0 && afterHowSectionProgress === 0;
  const headerShadowOpacity = 0.06 * Math.max(introBackgroundProgress, aboutSectionProgress, howSectionProgress, afterHowSectionProgress);
  const headerBackgroundColor =
    afterHowSectionProgress > 0
      ? afterHowBackgroundColor
      : howSectionProgress > 0
        ? howBackgroundColor
        : aboutSectionProgress > 0
          ? aboutBackgroundColor
          : introBackgroundColor;
  const navTextColor = isClaySection ? "#ffffff" : "#1f241b";
  const topHeaderWrapBackgroundColor = introBackgroundProgress < 0.08 ? "transparent" : headerBackgroundColor;
  const topHeaderInnerBackgroundColor = introBackgroundProgress < 0.08 ? "transparent" : headerBackgroundColor;

  return (
    <header
      style={{
        backgroundColor: topHeaderWrapBackgroundColor,
      }}
      className="sticky left-0 top-0 z-50 w-full"
    >
        <div
          style={{
            backgroundColor: topHeaderInnerBackgroundColor,
          }}
          className="pointer-events-none absolute inset-x-0 top-0 -mt-1 h-full rounded-t-[24px]"
        />
        <div
          style={{
            paddingTop: `${headerPaddingY}px`,
            paddingBottom: `${headerPaddingY}px`,
            backgroundColor: topHeaderInnerBackgroundColor,
            boxShadow: `0 1px 2px rgba(0, 0, 0, ${headerShadowOpacity})`,
          }}
          className={`relative flex items-center justify-between rounded-t-[24px] ${HOME_PAGE_GUTTER_CLASS}`}
        >
          <Image
            src={`${isClaySection ? "/hiros_logo_white.png" : "/hiros_logo.png"}?v=${headerAssetVersion}`}
            alt="Hiros"
            width={111}
            height={46}
            priority
            unoptimized
            className="h-auto w-[56px] sm:w-[68px]"
          />
          <nav
            style={{ color: navTextColor }}
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-12 py-[2px] font-semibold leading-none text-[16px] lg:flex"
          >
            <a href="#about">About us</a>
            <a href="#specialisms">Specialisms</a>
            <a href="#how">How it works</a>
            <a href="#research">Research</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              style={{
                paddingLeft: `${buttonPaddingX}px`,
                paddingRight: `${buttonPaddingX}px`,
                paddingTop: `${buttonPaddingY}px`,
                paddingBottom: `${buttonPaddingY}px`,
                fontSize: `${buttonFontSize}px`,
              }}
              className="rounded-full border border-black/10 bg-white font-semibold leading-none text-[#11110f] shadow-sm"
            >
              Log in
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              style={{ color: navTextColor }}
              className="flex items-center justify-center self-center p-0"
            >
              <span className="flex w-[16px] flex-col gap-[3px]">
                <span className="block h-[1.5px] w-full rounded-full bg-current" />
                <span className="block h-[1.5px] w-full rounded-full bg-current" />
                <span className="block h-[1.5px] w-full rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>
  );
}
