import { type PatientCase, type TabKey } from "./data";
import type { IntakeSubmission } from "./triage";

const CHANGE_EVENT = "hiros-cases-changed";

export type IntakePersistPayload = IntakeSubmission & {
  lastName?: string;
  postalCode?: string;
  phone?: string;
  province?: string;
};

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export async function fetchCases(): Promise<PatientCase[]> {
  const res = await fetch("/api/cases", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load cases");
  return (await res.json()) as PatientCase[];
}

export async function fetchCase(id: string): Promise<PatientCase | undefined> {
  const res = await fetch(`/api/cases/${id}`, { cache: "no-store" });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("Could not load case");
  return (await res.json()) as PatientCase;
}

export async function createCaseFromIntake(input: IntakePersistPayload): Promise<PatientCase> {
  const res = await fetch("/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Could not save case");
  }
  const created = (await res.json()) as PatientCase;
  notify();
  return created;
}

export async function patchCaseTab(
  id: string,
  tab: TabKey,
  extras?: { treatmentType?: string; followUp?: string; note?: string },
): Promise<void> {
  const res = await fetch(`/api/cases/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab, ...extras }),
  });
  if (!res.ok) throw new Error("Could not update case");
  notify();
}

export function subscribeStoredCases(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
