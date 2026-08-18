"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useHomeCopy } from "@/i18n/LanguageProvider";

export default function PrivacyCarousel() {
  const { copy } = useHomeCopy();
  const privacyCards = copy.privacy;
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  useEffect(() => {
    setImageVersion(Date.now());

    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = carousel;

      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
    };

    updateScrollState();
    carousel.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      carousel.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = carousel;

      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
    };

    updateScrollState();
  }, []);

  const scrollByCard = (direction: "left" | "right") => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const firstCard = carousel.querySelector("article");
    const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : 390;
    const scrollAmount = cardWidth + 40;

    carousel.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;

    if (!carousel || event.pointerType === "touch") {
      return;
    }

    setIsDragging(true);
    dragStartX.current = event.clientX;
    dragStartScrollLeft.current = carousel.scrollLeft;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;

    if (!carousel || !isDragging) {
      return;
    }

    const dragDistance = event.clientX - dragStartX.current;
    carousel.scrollLeft = dragStartScrollLeft.current - dragDistance;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
  };

  return (
    <div className="group relative left-1/2 w-screen -translate-x-1/2 overflow-visible">
      <div
        ref={carouselRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 pb-4 pl-6 pr-6 select-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden sm:gap-10 sm:scroll-px-10 sm:pl-10 sm:pr-10 lg:snap-none lg:scroll-px-16 lg:pl-16 lg:pr-16 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {privacyCards.map((card, index) => (
          <article
            key={card.key}
            className={`w-[78vw] min-w-[78vw] snap-start overflow-visible sm:w-[390px] sm:min-w-[390px] ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-[24px] bg-[#f1ede4] shadow-[0_18px_40px_rgba(17,17,15,0.08)] sm:h-80 sm:rounded-[30px]">
              {index === 0 ? (
                <div className="pointer-events-none relative h-full w-full select-none">
                  <Image
                    src={`/why_hiros_intake.png?v=${imageVersion}`}
                    alt="Hiros intake flow"
                    fill
                    sizes="(max-width: 640px) 78vw, 390px"
                    className="pointer-events-none select-none object-cover object-center"
                    priority
                    unoptimized
                    draggable={false}
                  />
                </div>
              ) : index === 1 ? (
                <div className="pointer-events-none relative h-full w-full select-none">
                  <Image
                    src={`/why_hiros_doctors.png?v=${imageVersion}`}
                    alt="Hiros doctors review"
                    fill
                    sizes="(max-width: 640px) 78vw, 390px"
                    className="pointer-events-none select-none object-cover object-center"
                    unoptimized
                    draggable={false}
                  />
                </div>
              ) : index === 2 ? (
                <div className="pointer-events-none relative h-full w-full select-none">
                  <Image
                    src={`/why_hiros_progress.png?v=${imageVersion}`}
                    alt="Hiros progress tracking"
                    fill
                    sizes="(max-width: 640px) 78vw, 390px"
                    className="pointer-events-none select-none object-cover object-center"
                    unoptimized
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="pointer-events-none relative h-full w-full select-none">
                  <Image
                    src={`/why_hiros_steps.png?v=${imageVersion}`}
                    alt="Hiros next steps overview"
                    fill
                    sizes="(max-width: 640px) 78vw, 390px"
                    className="pointer-events-none select-none object-cover object-center"
                    unoptimized
                    draggable={false}
                  />
                </div>
              )}
            </div>
            <div className="pl-3 pr-1 pb-2 pt-5">
              <h3 className="mb-3 max-w-sm text-[20px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#1d1d1f] sm:text-[22px]">
                <span className="text-[#8f604c]">{card.titleLine1}</span>
                <br />
                {card.titleLine2}
              </h3>
              <p className="max-w-[21rem] text-[15px] font-medium leading-[1.45] tracking-[-0.03em] text-black/60 sm:text-[16px]">
                {card.description}
              </p>
            </div>
          </article>
        ))}
      </div>
      <button
        type="button"
        aria-label={copy.carousel.previous}
        onClick={() => scrollByCard("left")}
        style={{ left: "calc(max(1.5rem, calc((100vw - 80rem) / 2)) + 1.25rem)" }}
        className={`absolute left-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl leading-none text-[#11110f] shadow-lg transition-opacity duration-300 lg:flex ${
          canScrollLeft
            ? "cursor-pointer opacity-0 group-hover:opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label={copy.carousel.next}
        onClick={() => scrollByCard("right")}
        className={`absolute right-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl leading-none text-[#11110f] shadow-lg transition-opacity duration-300 lg:flex ${
          canScrollRight
            ? "cursor-pointer opacity-0 group-hover:opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        ›
      </button>
    </div>
  );
}
