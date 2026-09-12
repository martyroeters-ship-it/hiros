import type { TreatmentPatient, TreatmentPatientDetail } from "./types";

export async function fetchTreatmentPatients(): Promise<TreatmentPatient[]> {
  const res = await fetch("/api/patients", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load patients");
  return (await res.json()) as TreatmentPatient[];
}

export async function fetchTreatmentPatient(caseId: string): Promise<TreatmentPatientDetail | undefined> {
  const res = await fetch(`/api/patients/${caseId}`, { cache: "no-store" });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("Could not load patient");
  return (await res.json()) as TreatmentPatientDetail;
}

export async function patchTreatmentPatient(
  caseId: string,
  body: Record<string, string | undefined>,
): Promise<TreatmentPatientDetail> {
  const res = await fetch(`/api/patients/${caseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || "Could not update patient");
  }
  return (await res.json()) as TreatmentPatientDetail;
}
