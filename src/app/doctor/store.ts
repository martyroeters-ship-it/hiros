import { type PatientCase } from "./data";

/**
 * Case persistence layer.
 *
 * For the demo this is backed by the browser's localStorage. For the MVP,
 * swap the bodies of these functions for API calls to a real database
 * (e.g. /api/cases backed by Supabase/Postgres) — the rest of the app
 * only depends on this interface.
 */

const STORAGE_KEY = "hiros_cases_v1";
const CHANGE_EVENT = "hiros-cases-changed";

export function getStoredCases(): PatientCase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Migrate old cases that have submittedAgo instead of submittedAt
    const migrated = parsed.map((c: any, index: number) => {
      if (c.submittedAgo && !c.submittedAt) {
        // Set timestamp to a few minutes ago based on position (newer cases first)
        // This gives a reasonable estimate for demo purposes
        const minutesAgo = (index + 1) * 2; // 2, 4, 6, 8 minutes ago etc.
        return { ...c, submittedAt: Date.now() - (minutesAgo * 60 * 1000), submittedAgo: undefined };
      }
      return c;
    });
    
    return migrated as PatientCase[];
  } catch {
    return [];
  }
}

export function addStoredCase(newCase: PatientCase): void {
  if (typeof window === "undefined") return;
  const all = getStoredCases();
  all.unshift(newCase); // newest first
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage quota exceeded (e.g. large base64 photos) — drop oldest and retry once.
    const trimmed = all.slice(0, 20);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      /* give up silently in the demo */
    }
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getStoredCase(id: string): PatientCase | undefined {
  return getStoredCases().find((c) => c.id.toLowerCase() === id.toLowerCase());
}

export function updateStoredCase(id: string, updates: Partial<PatientCase>): void {
  if (typeof window === "undefined") return;
  const all = getStoredCases();
  const index = all.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return;
  
  all[index] = { ...all[index], ...updates };
  
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* silently fail in demo */
  }
}

/** Subscribe to changes (same-tab dispatch + cross-tab storage events). */
export function subscribeStoredCases(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
