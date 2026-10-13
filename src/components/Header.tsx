"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { useHomeCopy } from "@/i18n/LanguageProvider";
import { AuthNavLink } from "@/components/AuthNavLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteMenu from "@/components/SiteMenu";

export default function Header() {
  const { copy } = useHomeCopy();
  const pathname = usePathname();
  const headerAssetVersion = "20260520-1637";
  const [scrollProgress, setScrollProgress] = useState(0);
  const [aboutSectionProgress, setAboutSectionProgress] = useState(0);
  const [howSectionProgress, setHowSectionProgress] = useState(0);
  const [afterHowSectionProgress, setAfterHowSectionProgress] = useState(0);
  const isIntroPage = pathname === "/";

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

  const headerPaddingY = 15;
  const introBackgroundProgress = Math.max(0, Math.min(scrollProgress / 0.24, 1));
  // White header curves over the green banner. Green shows in the outer corners.
  const headerCurveRadius = isIntroPage ? Math.round(20 * (1 - Math.min(scrollProgress / 0.7, 1))) : 0;
  const mixChannel = (start: number, end: number, progress: number) =>
    Math.round(start + (end - start) * progress);
  const introBackgroundColor = `rgb(${mixChannel(255, 245, introBackgroundProgress)}, ${mixChannel(255, 245, introBackgroundProgress)}, ${mixChannel(255, 247, introBackgroundProgress)})`;
  const aboutBackgroundColor = `rgb(${mixChannel(245, 255, aboutSectionProgress)}, ${mixChannel(245, 255, aboutSectionProgress)}, ${mixChannel(247, 255, aboutSectionProgress)})`;
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
  const topHeaderInnerBackgroundColor = headerBackgroundColor;

  return (
    <>
      <div className={`relative z-40 hidden sm:block ${isIntroPage ? "bg-[#e8e6e1]" : "bg-white"}`}>
        <a
          href={copy.announcement.href}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden bg-[#e8e6e1] px-4 py-2.5 text-center text-[15px] font-medium leading-none tracking-[-0.02em] text-[#1f241b] transition-[filter] hover:brightness-[0.98] sm:gap-2.5"
        >
          <span className="relative transition-transform duration-200 group-hover:scale-[1.03]">
            {copy.announcement.text}
          </span>
          <span
            className="relative inline-flex items-center gap-1 bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#1f241b] transition-transform duration-200 group-hover:scale-[1.03]"
            style={{ borderRadius: 999 }}
          >
            {copy.announcement.cta}
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </a>
      </div>
      <header
        className="sticky left-0 top-0 z-50 w-full shrink-0"
        style={{ backgroundColor: headerCurveRadius > 0 ? "#e8e6e1" : "transparent" }}
      >
        <div
          style={{
            paddingTop: `${headerPaddingY}px`,
            paddingBottom: `${headerPaddingY}px`,
            backgroundColor: topHeaderInnerBackgroundColor,
            boxShadow: `0 1px 2px rgba(0, 0, 0, ${headerShadowOpacity})`,
            borderTopLeftRadius: headerCurveRadius,
            borderTopRightRadius: headerCurveRadius,
          }}
          className={`relative flex w-full items-center justify-between ${HOME_PAGE_GUTTER_CLASS}`}
        >
          <Image
            src={`${isClaySection ? "/hiros_logo_white.png" : "/hiros_logo.png"}?v=${headerAssetVersion}`}
            alt="Hiros"
            width={111}
            height={46}
            priority
            unoptimized
            className="h-auto w-[80px]"
          />
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
            <nav
              style={{ color: navTextColor }}
              className="mr-1 hidden items-center gap-8 py-[2px] font-semibold leading-none text-[16px] lg:flex xl:gap-10"
            >
              <a href="/#about">{copy.nav.how}</a>
              <Link href="/blog">{copy.nav.research}</Link>
              <Link href="/about">{copy.nav.about}</Link>
            </nav>
            <AuthNavLink
              className="border border-black/15 bg-white font-semibold leading-none text-[#11110f]"
              style={{
                borderRadius: 999,
                paddingLeft: "16px",
                paddingRight: "16px",
                paddingTop: "10px",
                paddingBottom: "10px",
                fontSize: "14px",
              }}
            />
            <LanguageSwitcher />
            <SiteMenu iconClassName={isClaySection ? "text-white" : "text-[#11110f]"} />
          </div>
        </div>
      </header>
    </>
  );
}
