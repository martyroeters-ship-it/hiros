"use client";

import Link from "next/link";
import { formatCountdownDays, formatDueDate, getPhotoCheckIn } from "@/lib/photoCheckIn";
import type { DashboardPhoto } from "@/lib/patient-dashboard-types";

export function NextPhotoSlot({
  photos,
  treatmentStartedAt,
  variant = "tile",
  disableLink = false,
}: {
  photos: DashboardPhoto[];
  treatmentStartedAt: number | null;
  variant?: "tile" | "banner";
  disableLink?: boolean;
}) {
  const check = getPhotoCheckIn(photos, treatmentStartedAt);
  const days = formatCountdownDays(check.remainingMs);

  if (!check.dueAt) {
    const empty = (
      <div className="flex h-full flex-col items-center justify-center px-3 text-center">
        <p className="text-[13px] font-semibold text-[#3d4540]">Next monthly set</p>
        <p className="mt-1 max-w-[22ch] text-[12px] leading-relaxed text-[#8a9288]">
          The one-month timer starts when treatment begins or you take the first photos.
        </p>
      </div>
    );
    return variant === "banner" ? (
      <div className="rounded-[16px] border border-dashed border-[#e4e0d8] bg-[#faf9f6] px-4 py-8">{empty}</div>
    ) : (
      <div className="overflow-hidden rounded-[14px] border border-dashed border-[#e4e0d8] bg-[#faf9f6]" style={{ aspectRatio: "3/4" }}>
        {empty}
      </div>
    );
  }

  const body = check.overdue ? (
    <>
      <p className="text-[13px] font-semibold text-[#3d4540]">Time to update</p>
      <p className="mt-1 max-w-[22ch] text-[12px] leading-relaxed text-[#8a9288]">
        One month has passed. Same light, same angles.
      </p>
      <span className="mt-3 rounded-full bg-[#1f4033] px-3 py-1.5 text-[12px] font-semibold text-white">
        Upload this month’s set
      </span>
    </>
  ) : (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">Next set in</p>
      <p className="mt-2 font-title text-[28px] font-medium leading-none tracking-[-0.04em] text-[#1f3329]">
        {days}
        <span className="ml-1 text-[14px] font-medium text-[#8a9288]">{days === 1 ? "day" : "days"}</span>
      </p>
      <p className="mt-2 text-[11px] text-[#8a9288]">Due {formatDueDate(check.dueAt)}</p>
    </>
  );

  const inner = (
    <div className={`flex h-full flex-col items-center justify-center px-3 text-center ${check.overdue ? "" : ""}`}>
      {body}
    </div>
  );

  if (variant === "banner") {
    const banner = (
      <div
        className={`rounded-[16px] border border-dashed px-4 py-6 ${
          check.overdue ? "border-[#e8c8b8] bg-[#fdf4ef]" : "border-[#e4e0d8] bg-[#faf9f6]"
        }`}
      >
        {inner}
      </div>
    );
    return check.overdue && !disableLink ? <Link href="/dashboard/photos">{banner}</Link> : banner;
  }

  const tile = (
    <div
      className={`overflow-hidden rounded-[14px] border border-dashed ${
        check.overdue ? "border-[#e8c8b8] bg-[#fdf4ef]" : "border-[#e4e0d8] bg-[#faf9f6]"
      }`}
      style={{ aspectRatio: "3/4" }}
    >
      {inner}
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {check.overdue && !disableLink ? <Link href="/dashboard/photos">{tile}</Link> : tile}
      <div>
        <p className="text-[12px] font-semibold text-[#3d4540]">{check.overdue ? "Update due" : "Next monthly set"}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-[#8a9288]">
          {check.overdue ? "Required today" : formatDueDate(check.dueAt)}
        </p>
      </div>
    </div>
  );
}
