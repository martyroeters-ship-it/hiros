export type AppointmentStatus = "requested" | "scheduled" | "cancelled" | "completed";
export type AppointmentActor = "patient" | "doctor";

export type VideoAppointment = {
  id: string;
  caseId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  city: string;
  startsAt: number;
  durationMinutes: number;
  status: AppointmentStatus;
  requestedBy: AppointmentActor;
  reason: string | null;
  notes: string | null;
};

export type CreateAppointmentInput = {
  caseId: string;
  startsAt: string;
  durationMinutes?: number;
  reason?: string;
  requestedBy: AppointmentActor;
};
