"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  lifestyleCheckIns,
  scoreLifestyle,
  type LifestyleArea,
  type LifestyleStatus,
} from "@/data/lifestyleCheckIn";

function TypedBlock({
  fullText,
  visibleText,
  asTitle,
}: {
  fullText: string;
  visibleText: string;
  asTitle?: boolean;
}) {
  const className = asTitle
    ? "w-full whitespace-pre-wrap break-words text-left font-title text-[clamp(1.375rem,0.95rem+2.8vw,2.625rem)] font-medium leading-[1.18] tracking-[-0.04em]"
    : "w-full whitespace-pre-wrap break-words text-left text-[clamp(0.9375rem,0.82rem+1.1vw,1.375rem)] font-medium leading-[1.45] tracking-[-0.03em]";

  return (
    <div className="relative w-full min-w-0">
      <p className={`invisible ${className}`}>{fullText}</p>
      <p className={`absolute inset-0 max-w-full text-[var(--care-clay)] ${className}`}>
        {visibleText.split("\n").map((line, lineIndex) => (
          <span key={`${asTitle ? "title" : "body"}-${lineIndex}`} className="block whitespace-pre-wrap break-words">
            {line === "" ? "\u00A0" : line}
          </span>
        ))}
      </p>
    </div>
  );
}

export default function LifestyleCheckIn({ area }: { area: LifestyleArea }) {
  const router = useRouter();
  const config = lifestyleCheckIns[area];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<LifestyleStatus | null>(null);
  const [phase, setPhase] = useState<"questions" | "wrap-up">("questions");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fading, setFading] = useState(false);
  const [visibleCharacterCount, setVisibleCharacterCount] = useState(0);
  const [isContinueVisible, setIsContinueVisible] = useState(false);
  const fadeTimer = useRef<number | null>(null);
  const typeInterval = useRef<number | null>(null);
  const continueTimeout = useRef<number | null>(null);

  const question = config.questions[index];
  const total = config.questions.length;
  const progress = phase === "wrap-up" ? 100 : ((index + 1) / total) * 100;
  const selectedId = answers[question?.id ?? ""];
  const wrapUp = config.wrapUp;
  const nextLine = status === "needs_attention" ? wrapUp.nextIfNeeded : wrapUp.nextIfOk;
  const textBlocks = useMemo(
    () => [wrapUp.title, `${wrapUp.significance}\n\n${nextLine}`],
    [wrapUp.title, wrapUp.significance, nextLine],
  );
  const totalCharacters = textBlocks.reduce((count, block) => count + block.length, 0);
  let remainingCharacters = visibleCharacterCount;
  const visibleBlocks = textBlocks.map((block) => {
    const visibleCount = Math.max(0, Math.min(block.length, remainingCharacters));
    remainingCharacters -= block.length;
    return block.slice(0, visibleCount);
  });

  const clearTypewriter = () => {
    if (typeInterval.current) {
      window.clearInterval(typeInterval.current);
      typeInterval.current = null;
    }
    if (continueTimeout.current) {
      window.clearTimeout(continueTimeout.current);
      continueTimeout.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      if (typeInterval.current) window.clearInterval(typeInterval.current);
      if (continueTimeout.current) window.clearTimeout(continueTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "wrap-up") {
      setVisibleCharacterCount(0);
      setIsContinueVisible(false);
      clearTypewriter();
      return;
    }

    setVisibleCharacterCount(0);
    setIsContinueVisible(false);
    clearTypewriter();

    typeInterval.current = window.setInterval(() => {
      setVisibleCharacterCount((currentCount) => {
        if (currentCount >= totalCharacters) return currentCount;
        const nextCount = currentCount + 1;
        if (nextCount >= totalCharacters) {
          if (typeInterval.current) {
            window.clearInterval(typeInterval.current);
            typeInterval.current = null;
          }
          continueTimeout.current = window.setTimeout(() => {
            setIsContinueVisible(true);
            continueTimeout.current = null;
          }, 220);
        }
        return nextCount;
      });
    }, 32);

    return () => {
      clearTypewriter();
    };
  }, [phase, totalCharacters]);

  const goTo = (nextIndex: number) => {
    setFading(true);
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      setIndex(nextIndex);
      setFading(false);
    }, 150);
  };

  const submit = async (nextAnswers: Record<string, string>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/care/lifestyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, answers: nextAnswers }),
      });
      const body = (await res.json().catch(() => ({}))) as { status?: string; error?: string };
      if (!res.ok) throw new Error(body.error || "Could not save check-in");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save check-in");
    } finally {
      setSaving(false);
    }
  };

  const openWrapUp = (nextAnswers: Record<string, string>) => {
    setStatus(scoreLifestyle(area, nextAnswers));
    setFading(true);
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      setPhase("wrap-up");
      setFading(false);
    }, 160);
    void submit(nextAnswers);
  };

  const handlePrevious = () => {
    if (saving && phase === "questions") return;
    if (phase === "wrap-up") {
      setPhase("questions");
      setIndex(total - 1);
      setIsContinueVisible(false);
      setVisibleCharacterCount(0);
      return;
    }
    if (index === 0) {
      router.push("/care");
      return;
    }
    goTo(index - 1);
  };

  const handleOption = (optionId: string) => {
    if (saving || phase !== "questions") return;
    const nextAnswers = { ...answers, [question.id]: optionId };
    setAnswers(nextAnswers);
    const isLast = index === total - 1;
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      if (isLast) {
        openWrapUp(nextAnswers);
        return;
      }
      setFading(true);
      fadeTimer.current = window.setTimeout(() => {
        setIndex((current) => current + 1);
        setFading(false);
      }, 150);
    }, 160);
  };

  const handleContinue = () => {
    if (!isContinueVisible) return;
    if (error) {
      void submit(answers);
      return;
    }
    if (status === "needs_attention") {
      router.push(config.habitHref);
    } else {
      router.push("/care");
    }
  };

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-[700px] flex-col">
      {phase === "questions" ? (
        <div className="flex items-start justify-end">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--care-hairline)] bg-white/10 px-3 py-2.5 text-[15px] font-medium text-[var(--care-muted)] shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-colors hover:bg-white/16 disabled:cursor-default disabled:opacity-45 sm:px-5 sm:py-3"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M11.75 5.75 7.5 10l4.25 4.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>
        </div>
      ) : null}

      {phase === "questions" ? (
        <div className="mt-4 h-[7px] overflow-hidden rounded-full bg-[var(--care-hairline)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5f7f4f] via-[#8ea57a] to-[#4b6942] transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      <div
        className={`transition-opacity duration-150 ease-out ${fading ? "opacity-0" : "opacity-100"} ${
          phase === "questions" ? "mt-8 sm:mt-12" : "flex min-h-[min(70vh,640px)] flex-1 flex-col justify-center"
        }`}
      >
        {phase === "wrap-up" ? (
          <div className="flex w-full min-w-0 flex-col items-center gap-8 pb-2 sm:gap-16">
            <div className="mx-auto min-w-0 w-full max-w-[34rem]">
              <div className="space-y-4 text-left sm:space-y-10">
                <TypedBlock fullText={textBlocks[0]} visibleText={visibleBlocks[0]} asTitle />
                <TypedBlock fullText={textBlocks[1]} visibleText={visibleBlocks[1]} />
              </div>
            </div>
            {error ? <p className="w-full max-w-[34rem] text-[13px] font-medium text-[#e2b8a4]">{error}</p> : null}
            <div className="flex min-h-[56px] w-full max-w-[34rem] items-end sm:min-h-[72px]">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!isContinueVisible}
                aria-hidden={!isContinueVisible}
                tabIndex={isContinueVisible ? 0 : -1}
                className={`w-full rounded-full px-5 py-3 text-[15px] font-medium tracking-[-0.03em] transition-all duration-300 sm:px-6 sm:py-3.5 sm:text-[16px] ${
                  isContinueVisible
                    ? "translate-y-0 bg-white text-[#11110f] opacity-100"
                    : "translate-y-2 bg-white/10 text-white/30 opacity-0"
                }`}
              >
                {error ? "Try again" : "Continue"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="w-full font-title text-[22px] font-medium leading-[1.2] tracking-[-0.03em] text-[var(--care-ink)] sm:text-[42px] sm:leading-[1.02] sm:tracking-[-0.07em]">
              {question.prompt}
            </h1>
            <p className="mt-2.5 text-[13px] font-medium leading-[1.45] tracking-[-0.02em] text-[var(--care-muted)] sm:mt-4 sm:text-[16px] lg:text-[17px]">
              Choose the option that feels closest to your experience.
            </p>

            <div className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
              {question.options.map((option) => {
                const selected = selectedId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={saving}
                    onClick={() => handleOption(option.id)}
                    className={`care-intake-option group block w-full cursor-pointer rounded-[16px] text-left transition duration-200 disabled:opacity-60 sm:rounded-[15px] ${
                      selected ? "care-intake-option-selected" : ""
                    }`}
                  >
                    <span className="care-intake-option-inner flex min-h-[44px] w-full items-center rounded-[15px] px-4 py-2.5 text-left text-[14px] font-medium leading-[1.35] tracking-[-0.02em] text-[var(--care-ink)] sm:min-h-[56px] sm:rounded-[14px] sm:px-6 sm:py-3.5 sm:text-[16px] sm:tracking-[-0.03em]">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {error ? <p className="mt-4 text-[13px] font-medium text-[#e2b8a4]">{error}</p> : null}
          </>
        )}
      </div>
    </div>
  );
}
