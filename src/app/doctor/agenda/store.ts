import type { AppointmentActor, VideoAppointment } from "./types";

export async function fetchAppointments(caseId?: string): Promise<VideoAppointment[]> {
  const query = caseId ? `?caseId=${encodeURIComponent(caseId)}` : "";
  const res = await fetch(`/api/appointments${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load appointments");
  return (await res.json()) as VideoAppointment[];
}

export async function createAppointmentRequest(input: {
  caseId: string;
  startsAt: string;
  durationMinutes?: number;
  reason?: string;
  requestedBy: AppointmentActor;
}): Promise<VideoAppointment> {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Could not schedule visit");
  }
  return (await res.json()) as VideoAppointment;
}

export async function patchAppointment(
  id: string,
  action: "confirm" | "cancel" | "complete" | "note",
  notes?: string,
): Promise<VideoAppointment> {
  const res = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, notes }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Could not update visit");
  }
  return (await res.json()) as VideoAppointment;
}
