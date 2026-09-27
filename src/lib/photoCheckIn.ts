import type { DashboardPhoto } from "@/lib/patient-dashboard-types";

export type PhotoCheckIn = {
  anchorAt: number | null;
  dueAt: number | null;
  overdue: boolean;
  remainingMs: number;
};

function addCalendarMonth(from: Date, months = 1): Date {
  const next = new Date(from.getTime());
  const day = next.getDate();
  next.setMonth(next.getMonth() + months);
  if (next.getDate() < day) next.setDate(0);
  return next;
}

export function getPhotoCheckIn(
  photos: DashboardPhoto[],
  treatmentStartedAt: number | null,
  now = Date.now(),
): PhotoCheckIn {
  const firstPhoto = photos.reduce<number | null>((earliest, photo) => {
    if (earliest === null || photo.createdAt < earliest) return photo.createdAt;
    return earliest;
  }, null);
  const latestPhoto = photos.reduce<number | null>((latest, photo) => {
    if (latest === null || photo.createdAt > latest) return photo.createdAt;
    return latest;
  }, null);

  const anchorAt = treatmentStartedAt ?? firstPhoto;
  if (!anchorAt) {
    return { anchorAt: null, dueAt: null, overdue: false, remainingMs: 0 };
  }

  let due = addCalendarMonth(new Date(anchorAt), 1);
  while (latestPhoto !== null && latestPhoto >= due.getTime()) {
    due = addCalendarMonth(due, 1);
  }

  const dueAt = due.getTime();
  const remainingMs = Math.max(0, dueAt - now);
  return {
    anchorAt,
    dueAt,
    overdue: now >= dueAt,
    remainingMs,
  };
}

export function formatCountdownDays(ms: number) {
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

export function formatDueDate(at: number) {
  return new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
