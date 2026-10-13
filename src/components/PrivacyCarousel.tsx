"use client";

import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useHomeCopy } from "@/i18n/LanguageProvider";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";

export type HomeGallerySlide = {
  key: string;
  imageSrc?: string;
  imageAlt?: string;
  objectPosition?: string;
  titleLine1?: string;
  titleLine2?: string;
  body?: string;
  quote?: string;
  attributionName?: string;
  attributionRole?: string;
  cta?: string;
  ctaHref?: string;
};

export type PrivacyCarouselHandle = {
  scrollPrev: () => void;
  scrollNext: () => void;
};

const CARD_GAP_PX = 36;
const LOOP_COPIES = 3;

type Props = {
  slides: readonly HomeGallerySlide[];
  className?: string;
  showControls?: boolean;
  /** Optional label on the left of the page-counter row (e.g. “In collaboration with”). */
  footerLeading?: string;
  /** Logical slide to center on first paint. */
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
};

const PrivacyCarousel = forwardRef<PrivacyCarouselHandle, Props>(function PrivacyCarousel(
  { slides, className = "", showControls = true, footerLeading, initialIndex = 0, onIndexChange },
  ref,
) {
  const { copy } = useHomeCopy();
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const isJumpingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [snapReady, setSnapReady] = useState(false);

  const loopSlides = useMemo(
    () => Array.from({ length: LOOP_COPIES }, (_, copy) =>
      slides.map((slide, index) => ({
        slide,
        key: `${slide.key}-loop-${copy}-${index}`,
        logicalIndex: index,
        copyIndex: copy,
      })),
    ).flat(),
    [slides],
  );

  const setCount = slides.length;
  const middleCopyStart = setCount; // start of the middle clone set

  const centerOnSlide = (index: number, behavior: ScrollBehavior = "auto") => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = carousel.querySelectorAll("article");
    const card = cards[index];
    if (!(card instanceof HTMLElement)) return;
    const target = card.offsetLeft + card.offsetWidth / 2 - carousel.clientWidth / 2;
    carousel.scrollTo({ left: Math.max(0, target), behavior });
  };

  const getClosestIndex = () => {
    const carousel = carouselRef.current;
    if (!carousel) return middleCopyStart;
    const cards = carousel.querySelectorAll("article");
    const center = carousel.scrollLeft + carousel.clientWidth / 2;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((node, index) => {
      if (!(node instanceof HTMLElement)) return;
      const cardCenter = node.offsetLeft + node.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });
    return closest;
  };

  const normalizeLoopPosition = () => {
    if (isJumpingRef.current || setCount === 0) return;
    const closest = getClosestIndex();
    let next = closest;

    if (closest < setCount) {
      next = closest + setCount;
    } else if (closest >= setCount * 2) {
      next = closest - setCount;
    }

    if (next !== closest) {
      isJumpingRef.current = true;
      centerOnSlide(next, "auto");
      window.requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
    }

    const logical = ((next % setCount) + setCount) % setCount;
    setActiveIndex(logical);
    onIndexChange?.(logical);
  };

  const updateScrollState = () => {
    if (isJumpingRef.current) return;
    const closest = getClosestIndex();
    const logical = ((closest % setCount) + setCount) % setCount;
    setActiveIndex(logical);
    onIndexChange?.(logical);
  };

  useLayoutEffect(() => {
    if (setCount === 0) return;
    setSnapReady(false);
    isJumpingRef.current = true;
    const startIndex = Math.min(Math.max(initialIndex, 0), setCount - 1);
    centerOnSlide(middleCopyStart + startIndex, "auto");
    setActiveIndex(startIndex);
    onIndexChange?.(startIndex);
    isJumpingRef.current = false;
    setSnapReady(true);
  }, [slides, setCount, middleCopyStart, initialIndex, onIndexChange]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || setCount === 0) return;

    const frameId = window.requestAnimationFrame(() => {
      isJumpingRef.current = true;
      const startIndex = Math.min(Math.max(initialIndex, 0), setCount - 1);
      centerOnSlide(middleCopyStart + startIndex, "auto");
      setActiveIndex(startIndex);
      onIndexChange?.(startIndex);
      isJumpingRef.current = false;
    });

    const handleScrollEnd = () => normalizeLoopPosition();

    // Fallback when scrollend is unavailable: normalize shortly after scroll settles.
    let settleTimer = 0;
    const handleScrollSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => normalizeLoopPosition(), 120);
    };

    const handleResize = () => {
      const closest = getClosestIndex();
      const logical = ((closest % setCount) + setCount) % setCount;
      centerOnSlide(middleCopyStart + logical, "auto");
      updateScrollState();
    };

    carousel.addEventListener("scroll", updateScrollState, { passive: true });
    carousel.addEventListener("scroll", handleScrollSettle, { passive: true });
    carousel.addEventListener("scrollend", handleScrollEnd);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(settleTimer);
      carousel.removeEventListener("scroll", updateScrollState);
      carousel.removeEventListener("scroll", handleScrollSettle);
      carousel.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-init when the slide set changes
  }, [slides, setCount, middleCopyStart]);

  const scrollByCard = (direction: "left" | "right") => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const firstCard = carousel.querySelector("article");
    const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : 1260;
    carousel.scrollBy({
      left: direction === "right" ? cardWidth + CARD_GAP_PX : -(cardWidth + CARD_GAP_PX),
      behavior: "smooth",
    });
  };

  useImperativeHandle(ref, () => ({
    scrollPrev: () => scrollByCard("left"),
    scrollNext: () => scrollByCard("right"),
  }));

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel || event.pointerType === "touch") return;
    setIsDragging(true);
    dragStartX.current = event.clientX;
    dragStartScrollLeft.current = carousel.scrollLeft;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!carousel || !isDragging) return;
    carousel.scrollLeft = dragStartScrollLeft.current - (event.clientX - dragStartX.current);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
    normalizeLoopPosition();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={carouselRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden ${
          snapReady ? "snap-x snap-mandatory" : ""
        } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          gap: CARD_GAP_PX,
          paddingLeft: "var(--page-gutter)",
          paddingRight: "var(--page-gutter)",
          scrollPaddingInline: "var(--page-gutter)",
        }}
      >
        {loopSlides.map(({ slide, key, logicalIndex }, index) => {
          const isTitleCard = Boolean(slide.titleLine1) && !slide.quote;

          return (
            <article
              key={key}
              style={{
                width: "calc(100vw - (2 * var(--page-gutter)))",
              }}
              className={`relative h-[560px] shrink-0 snap-center overflow-hidden rounded-[28px] ${
                slide.imageSrc ? "bg-[#1d1d1f]" : "bg-[#e8e6e1]"
              } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              {slide.imageSrc ? (
                <Image
                  src={slide.imageSrc}
                  alt={slide.imageAlt ?? ""}
                  fill
                  sizes="(max-width: 1024px) 100vw, 92vw"
                  className={`pointer-events-none select-none object-cover ${
                    slide.imageSrc === "/large_section4.jpg"
                      ? "object-[78%_center] min-[734px]:object-center"
                      : slide.imageSrc === "/large_section1.jpg"
                        ? "object-[18%_center] min-[734px]:object-center"
                        : slide.imageSrc === "/home_large5.jpg"
                          ? "object-[36%_center] min-[734px]:object-center"
                          : (slide.objectPosition ?? "object-center")
                  }`}
                  priority={index === middleCopyStart}
                  draggable={false}
                />
              ) : null}
              {slide.imageSrc === "/large_section1.jpg" || slide.imageSrc === "/large_section4.jpg" ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(12,10,8,0.70)_0%,rgba(12,10,8,0.54)_22%,rgba(12,10,8,0.22)_42%,rgba(12,10,8,0)_58%)]"
                />
              ) : slide.imageSrc === "/home_large2.png" ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[rgba(18,16,14,0.08)]"
                />
              ) : null}
              {isTitleCard && slide.body ? (
                <div className="absolute inset-y-0 left-0 z-10 flex w-[min(34rem,62%)] flex-col justify-center px-8 py-10 text-white min-[734px]:px-12 min-[1068px]:px-16">
                  <h3 className="font-title text-[26px] font-medium leading-[1.12] tracking-[-0.03em] min-[734px]:text-[34px] min-[1068px]:text-[40px] min-[1068px]:leading-[1.08]">
                    {slide.titleLine1}
                    {slide.titleLine2 ? (
                      <>
                        <br />
                        {slide.titleLine2}
                      </>
                    ) : null}
                  </h3>
                  <p className="mt-4 max-w-[28rem] text-[15px] font-medium leading-[1.45] tracking-[-0.01em] text-white/88 min-[734px]:mt-5 min-[734px]:text-[17px]">
                    {slide.body}
                  </p>
                </div>
              ) : isTitleCard ? (
                <h3
                  className={`absolute left-9 top-9 z-10 max-w-[402px] font-title text-[21px] font-semibold leading-[1.2] tracking-[-0.02em] min-[734px]:text-[28px] min-[734px]:leading-[1.15] ${
                    slide.imageSrc
                      ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]"
                      : "text-[#1f241b]/55"
                  }`}
                >
                  {slide.titleLine1} {slide.titleLine2}
                </h3>
              ) : slide.quote ? (
                <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 py-10 text-white min-[734px]:px-14 min-[1068px]:px-16">
                  <blockquote className="max-w-[34rem] font-title text-[22px] font-normal leading-[1.25] tracking-[-0.03em] min-[734px]:text-[28px] min-[734px]:leading-[1.2] min-[1068px]:text-[32px] min-[1068px]:leading-[1.18]">
                    {slide.quote}
                  </blockquote>
                  {slide.attributionName ? (
                    <p className="mt-5 max-w-[34rem] text-[14px] font-semibold leading-snug tracking-[-0.01em] min-[734px]:mt-6 min-[734px]:text-[16px]">
                      {slide.attributionName}
                      {slide.attributionRole ? (
                        <span className="mt-1 block font-normal text-white/85">{slide.attributionRole}</span>
                      ) : null}
                    </p>
                  ) : null}
                  {slide.cta && slide.ctaHref ? (
                    <a
                      href={slide.ctaHref}
                      className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 font-title text-[15px] font-medium leading-none tracking-[-0.01em] text-[#1d1d1f] transition-colors hover:bg-white/90 min-[734px]:mt-8 min-[734px]:px-6 min-[734px]:py-3 min-[734px]:text-[17px]"
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      {slide.cta}
                    </a>
                  ) : null}
                </div>
              ) : null}
              <span className="sr-only">{logicalIndex + 1}</span>
            </article>
          );
        })}
      </div>

      {showControls ? (
        <div className={`mt-6 flex w-full items-center justify-end gap-4 ${HOME_PAGE_GUTTER_CLASS}`}>
          {footerLeading ? (
            <p className="mr-auto font-title text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f241b]/40 sm:text-[12px]">
              {footerLeading}
            </p>
          ) : (
            <p className="mr-auto text-[13px] font-medium tabular-nums text-[#1f241b]/40">
              {activeIndex + 1} / {slides.length}
            </p>
          )}
          {footerLeading ? (
            <p className="text-[13px] font-medium tabular-nums text-[#1f241b]/40">
              {activeIndex + 1} / {slides.length}
            </p>
          ) : null}
          <button
            type="button"
            aria-label={copy.carousel.previous}
            onClick={() => scrollByCard("left")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1d1d1f]/10 text-[#1d1d1f] transition-opacity hover:bg-[#1d1d1f]/16"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M10 3.5 5.5 8 10 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={copy.carousel.next}
            onClick={() => scrollByCard("right")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1d1d1f]/10 text-[#1d1d1f] transition-opacity hover:bg-[#1d1d1f]/16"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ) : (
        <div className={`mt-5 flex w-full items-center justify-between gap-4 ${HOME_PAGE_GUTTER_CLASS}`}>
          {footerLeading ? (
            <p className="font-title text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f241b]/40 sm:text-[12px]">
              {footerLeading}
            </p>
          ) : (
            <span />
          )}
          <p className="text-[13px] font-medium tabular-nums text-[#1f241b]/40">
            {activeIndex + 1} / {slides.length}
          </p>
        </div>
      )}
    </div>
  );
});

export default PrivacyCarousel;
