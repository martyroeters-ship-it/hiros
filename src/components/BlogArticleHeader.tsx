"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { blogTopics } from "@/data/blogArticles";
import { blogArticleUi, getBlogPostCopy, type BlogPost } from "@/data/blogPosts";
import { homeCopy } from "@/i18n/homeCopy";
import { useHydratedLocale } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteMenu from "@/components/SiteMenu";

export const BLOG_ARTICLE_CHROME_OFFSET = "top-[calc(var(--blog-chrome,56px)+32px)]";
export const BLOG_ARTICLE_SCROLL_MARGIN = "scroll-mt-[calc(var(--blog-chrome,56px)+32px)]";
export const BLOG_LAYOUT_GRID = "grid grid-cols-1 lg:grid-cols-[25%_45%_30%]";
export const BLOG_ASIDE_PAD = "px-8 xl:px-12";

function CategoryLinks({
  topic,
  className,
  labels,
  ariaLabel,
}: {
  topic?: string;
  className?: string;
  labels: Record<string, string>;
  ariaLabel: string;
}) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      {blogTopics.map((item) => {
        const href = item.slug === "all" ? "/blog" : `/blog?topic=${item.slug}`;
        const label = labels[item.slug] ?? item.label;

        return (
          <Link
            key={item.slug}
            href={href}
            className={`shrink-0 text-[13px] font-medium leading-none tracking-[-0.01em] transition-colors ${
              item.slug === topic ? "text-[#11110f]" : "text-[#11110f]/55 hover:text-[#11110f]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function BlogArticleHeader({
  post,
  topic,
}: {
  post: BlogPost;
  topic?: string;
}) {
  const locale = useHydratedLocale();
  const articleCopy = getBlogPostCopy(post, locale);
  const ui = blogArticleUi[locale];
  const nav = homeCopy[locale].nav;
  const [scrollingDown, setScrollingDown] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollingDownRef = useRef(false);
  const chromeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId = 0;

    const update = () => {
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      const scrollTop = scrollingElement.scrollTop;
      const total = scrollingElement.scrollHeight - scrollingElement.clientHeight;
      const nextProgress = total > 0 ? Math.min(Math.max(scrollTop / total, 0), 1) : 0;
      const delta = scrollTop - lastScrollTop.current;
      const atTop = scrollTop < 24;
      let nextScrollingDown = scrollingDownRef.current;

      if (atTop) {
        nextScrollingDown = false;
      } else if (Math.abs(delta) > 6) {
        nextScrollingDown = delta > 0;
      }

      lastScrollTop.current = scrollTop;
      scrollingDownRef.current = nextScrollingDown;

      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setProgress(nextProgress);
        setScrollingDown(nextScrollingDown);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el) return;

    const apply = () => {
      document.documentElement.style.setProperty("--blog-chrome", `${Math.round(el.getBoundingClientRect().height)}px`);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--blog-chrome");
    };
  }, []);

  useEffect(() => {
    setCopied(false);
  }, [locale]);

  const showArticleTitle = scrollingDown;
  const showBanner = !scrollingDown;
  const shareLabel = copied ? ui.copied : ui.share;

  async function shareArticle() {
    const url = window.location.href;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: articleCopy.title, url });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div ref={chromeRef} className="sticky left-0 top-0 z-50 w-full bg-white">
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          showBanner ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className={`overflow-hidden ${showBanner ? "" : "pointer-events-none"}`} aria-hidden={!showBanner}>
          <div className="flex items-center justify-center gap-3 bg-[#2a412c] px-4 py-2.5 text-white sm:gap-4">
            <p className="text-center text-[13px] font-medium leading-none sm:text-[14px]">
              {ui.consultation}
            </p>
            <Link
              href="/intake?condition=hair-loss"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold leading-none text-[#11110f] transition-colors hover:bg-[#f3f0e8] sm:px-4 sm:text-[13px]"
            >
              {ui.getStarted}
            </Link>
          </div>
        </div>
      </div>

      <header className="relative bg-white">
        <div
          className={`relative grid h-[52px] items-center sm:h-[56px] ${
            showArticleTitle
              ? "grid-cols-[minmax(0,1fr)_auto] gap-4 px-6 sm:px-10 lg:px-16"
              : "grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-6 sm:px-10 lg:grid-cols-[25%_45%_30%] lg:gap-0 lg:px-0"
          }`}
        >
          <div className={`flex min-w-0 gap-3 sm:gap-5 ${showArticleTitle ? "items-end" : "items-center lg:px-8 xl:px-12"}`}>
            <Link href="/" className="inline-flex shrink-0 items-center">
              <Image
                src="/hiros_logo.png"
                alt="Hiros"
                width={111}
                height={46}
                priority
                unoptimized
                className="h-auto w-[56px] sm:w-[68px]"
              />
            </Link>
            {showArticleTitle ? (
              <p className="min-w-0 truncate text-[17px] font-medium leading-none tracking-[-0.02em] text-[#11110f]">
                {articleCopy.headerTitle}
              </p>
            ) : null}
          </div>
          {showArticleTitle ? null : (
            <div className="flex min-w-0 items-center">
              <CategoryLinks
                topic={topic}
                labels={ui.categories}
                ariaLabel={ui.categoriesNav}
                className="flex min-w-0 items-center gap-4 overflow-x-auto [scrollbar-width:none] lg:gap-5 [&::-webkit-scrollbar]:hidden"
              />
            </div>
          )}
          <div className={`flex items-center justify-end gap-2 sm:gap-3 ${showArticleTitle ? "" : "lg:px-8"}`}>
            <button
              type="button"
              onClick={() => void shareArticle()}
              className={`rounded-full bg-[#11110f] text-[13px] font-semibold leading-none text-white transition-all duration-200 ${
                showArticleTitle ? "px-4 py-1.5 opacity-100" : "pointer-events-none w-0 overflow-hidden px-0 py-1.5 opacity-0"
              }`}
            >
              {shareLabel}
            </button>
            <Link
              href="/dashboard"
              className={`rounded-full border border-[#11110f] bg-white px-4 py-2 text-[12px] font-semibold leading-none text-[#11110f] ${
                showArticleTitle ? "hidden sm:inline-flex" : "inline-flex"
              }`}
            >
              {nav.login}
            </Link>
            <LanguageSwitcher compact />
            <SiteMenu />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]" aria-hidden="true">
          <div
            className="h-full w-full origin-left bg-[#6f8759] will-change-transform"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </header>
    </div>
  );
}
