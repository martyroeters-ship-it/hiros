/**
 * Row types for db/migrations/001_init.sql.
 * Prototype only: not a KTS/USBS registration.
 */

export type AppRole = "patient" | "doctor" | "support" | "admin";

export type CaseStatus =
  | "trial_onboarding"
  | "trial_active"
  | "awaiting_consent"
  | "clinical_intake"
  | "pending_review"
  | "approved"
  | "declined"
  | "needs_in_person"
  | "cancelled";

export type FeedbackKind =
  | "usability"
  | "adherence"
  | "outcome"
  | "side_effect"
  | "nps"
  | "other";

export type AnswerPhase = "pre_medical" | "clinical";

export type ConsentKind =
  | "kvkk"
  | "telemedicine"
  | "named_physician"
  | "prototype_trial";

export type ServiceAreaKind = "postal_prefix" | "il" | "ilce";

export type ChargeKind = "consult" | "saas_fee";

export type ChargeStatus =
  | "method_saved"
  | "pending_approval"
  | "capturing"
  | "captured"
  | "failed"
  | "refunded";

export type MessageSender = "patient" | "doctor";

export type PhotoKind = "front" | "top" | "left" | "right" | "other";

export type RiskLevel = "Green" | "Orange" | "Red";

export type ConfidenceLevel = "High" | "Medium" | "Low";

export type PriorityLevel = "High" | "Medium" | "Low";

export type FlagLevel = "orange" | "red";

export type AccessAction =
  | "view"
  | "insert"
  | "update"
  | "delete"
  | "export"
  | "login";

export type OutboxStatus = "disabled_trial" | "pending" | "sent" | "failed";

export const PRE_MEDICAL_STEP_IDS = [
  "current-situation",
  "change-location",
  "timeline",
  "clarity",
  "primary-goal",
] as const;

export const CLINICAL_STEP_IDS = [
  "progression",
  "symptoms",
  "family-history",
  "medical-conditions",
  "medications",
  "recent-changes",
  "previous-hair-loss-treatments",
  "final-notes",
] as const;

export type PreMedicalStepId = (typeof PRE_MEDICAL_STEP_IDS)[number];
export type ClinicalStepId = (typeof CLINICAL_STEP_IDS)[number];

export type Profile = {
  id: string;
  role: AppRole;
  email: string | null;
  password_hash?: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  locale: string;
  postal_code: string | null;
  il: string | null;
  ilce: string | null;
  street_address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Clinic = {
  id: string;
  name: string;
  license_number: string | null;
  skrs_code: string | null;
  city: string | null;
  address: string | null;
  iyzico_sub_merchant_key: string | null;
  remote_care_permitted: boolean;
  is_demo: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Doctor = {
  id: string;
  profile_id: string;
  clinic_id: string;
  full_name: string;
  license_number: string;
  ckys_id: string | null;
  specialty: string | null;
  is_accepting_cases: boolean;
  is_demo: boolean;
  invited_by: string | null;
  invited_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PatientIdentity = {
  patient_id: string;
  tckn_hash: string;
  full_legal_name: string | null;
  date_of_birth: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Case = {
  id: string;
  patient_id: string;
  assigned_doctor_id: string | null;
  assigned_clinic_id: string | null;
  status: CaseStatus;
  is_trial: boolean;
  postal_code: string | null;
  il: string | null;
  ilce: string | null;
  risk: RiskLevel | null;
  aga_score: number | null;
  confidence: ConfidenceLevel | null;
  priority: PriorityLevel | null;
  findings: unknown;
  triage_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseAnswer = {
  id: string;
  case_id: string;
  step_id: string;
  phase: AnswerPhase;
  question: string;
  answer: string;
  follow_up_text: string | null;
  flag: FlagLevel | null;
  flag_note: string | null;
  created_at: string;
  updated_at: string;
};

export type CasePhoto = {
  id: string;
  case_id: string;
  kind: PhotoKind;
  storage_path: string;
  content_type: string | null;
  byte_size: number | null;
  created_at: string;
};

export type TrialProduct = {
  id: string;
  name: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type ProductIssue = {
  id: string;
  case_id: string;
  product_id: string;
  issued_at: string;
  issued_by: string;
  notes: string | null;
  created_at: string;
};

export type CheckIn = {
  id: string;
  case_id: string;
  patient_id: string;
  kind: FeedbackKind;
  week_number: number | null;
  nps: number | null;
  answers: Record<string, unknown>;
  free_text: string | null;
  created_at: string;
};

export type Prescription = {
  id: string;
  case_id: string;
  doctor_id: string;
  e_recete_number: string;
  is_simulated: boolean;
  issued_at: string;
  filled_reported_at: string | null;
  fill_note: string | null;
  created_at: string;
};

export type CaseTreatment = {
  case_id: string;
  name: string;
  follow_up_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentStatus = "requested" | "scheduled" | "cancelled" | "completed";
export type AppointmentActor = "patient" | "doctor";

export type VideoAppointmentRow = {
  id: string;
  case_id: string;
  patient_id: string;
  doctor_id: string;
  starts_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  requested_by: AppointmentActor;
  reason: string | null;
  notes: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseFlowEvent = {
  id: string;
  case_id: string;
  step: string;
  simulated: boolean;
  actor_id: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
};

export const TRIAL_FLOW_STEPS = [
  "doctor_assigned",
  "named_physician_consent",
  "intake_submitted",
  "doctor_review",
  "simulated_recete",
  "simulated_kts_handoff",
] as const;
