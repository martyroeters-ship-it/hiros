"use client";

import { useState } from "react";

const checkInOptions = [
  { emoji: "😊", label: "Good" },
  { emoji: "😌", label: "Meh" },
  { emoji: "😞", label: "Not ok" },
] as const;

type CheckInChoice = (typeof checkInOptions)[number];

const checkInDate = "June 8";

export function CheckInCard({
  titleClassName,
  cardClassName = "rounded-[16px] border border-[#f0ebe2] bg-[#faf8f4] p-2.5",
  compact = false,
}: {
  titleClassName: string;
  cardClassName?: string;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<CheckInChoice | null>(null);
  const emojiSize = compact ? "h-8 w-8 text-[18px]" : "h-9 w-9 text-[20px]";

  return (
    <div className={`flex min-h-0 min-w-0 flex-col ${cardClassName}`}>
      <p className={titleClassName}>Check-in</p>
      <p className={`${compact ? "text-[11px] text-[#8a9288]" : "text-[10px] text-[#6b7568]"}`}>
        {selected ? "Last check-in" : "How are you feeling today?"}
      </p>

      {selected ? (
        <div className={`flex min-w-0 flex-1 items-center gap-2 ${compact ? "mt-1" : "mt-1.5"}`}>
          <div className={`flex shrink-0 items-center justify-center rounded-full bg-[#dde8d6] ${emojiSize}`}>
            {selected.emoji}
          </div>
          <p className={`truncate font-semibold text-[#3d4540] ${compact ? "text-[11px]" : "text-[12px]"}`}>
            {selected.label} {checkInDate}
          </p>
        </div>
      ) : (
        <div className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 ${compact ? "mt-1" : "mt-1.5"}`}>
          {checkInOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setSelected(option)}
              className={`flex shrink-0 items-center justify-center rounded-full bg-[#e4e0d8] shadow-[0_1px_4px_rgba(31,51,41,0.04)] transition-transform hover:scale-105 active:scale-95 ${emojiSize}`}
              aria-label={option.label}
            >
              {option.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
