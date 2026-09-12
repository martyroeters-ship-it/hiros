export type PatientAlertKind =
  | "not_filled"
  | "no_checkin"
  | "missed_doses"
  | "side_effects"
  | "follow_up_due";

export type PatientAlert = {
  kind: PatientAlertKind;
  severity: "red" | "orange";
  label: string;
  detail: string;
};

export type ComplianceStatus = "on_track" | "watch" | "alert";

export type TreatmentPatient = {
  caseId: string;
  patientId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  city: string;
  postalCode: string | null;
  startedAt: number;
  treatmentName: string;
  treatmentNotes: string | null;
  followUpAt: string | null;
  prescriptionNumber: string | null;
  prescriptionIssuedAt: number | null;
  prescriptionSimulated: boolean;
  filled: boolean;
  filledAt: number | null;
  fillNote: string | null;
  lastCheckInAt: number | null;
  lastCheckInKind: string | null;
  lastCheckInNote: string | null;
  tookMedsThisMonth: boolean | null;
  submittedPhotos: boolean | null;
  daysTaken: number | null;
  sideEffects: string | null;
  compliance: ComplianceStatus;
  alerts: PatientAlert[];
};

export type TreatmentPatientDetail = TreatmentPatient & {
  reason: string;
  onset: string;
  medicalConditions: string[];
  currentMedications: string[];
  answers: { question: string; answer: string }[];
  checkIns: {
    id: string;
    kind: string;
    createdAt: number;
    tookMedsThisMonth: boolean | null;
    submittedPhotos: boolean | null;
    sideEffects: string | null;
    note: string | null;
  }[];
  messages: {
    id: string;
    from: "patient" | "doctor";
    body: string;
    createdAt: number;
  }[];
  photos: { label: string; src: string }[];
  visits: {
    id: string;
    startsAt: number;
    status: string;
    reason: string | null;
    notes: string | null;
  }[];
};
