export type IntakeCondition =
  | "hair-loss"
  | "erection"
  | "premature-ejaculation"
  | "intimate-skin";

export type IntakeStep = {
  id: string;
  title: string;
  description: string;
  options: string[];
  /** Select-all-that-apply question */
  multiSelect?: boolean;
};

export type IntakeConditionCatalog = {
  condition: IntakeCondition;
  label: string;
  requiresPhotos: boolean;
  /** Soft questions before location / matching. Empty = start at pre-auth. */
  intakeSteps: IntakeStep[];
  /** Clinical questions + shared endings (photos, shipping, recommendation…). */
  medicalSteps: IntakeStep[];
  /** Step ids that count toward the medical progress bar. */
  progressBarStepIds: string[];
};

export const INTAKE_CONDITIONS: IntakeCondition[] = [
  "hair-loss",
  "erection",
  "premature-ejaculation",
  "intimate-skin",
];

export function parseIntakeCondition(value: string | null | undefined): IntakeCondition {
  if (value === "erection" || value === "erectile-dysfunction" || value === "ed") {
    return "erection";
  }
  if (value === "premature-ejaculation" || value === "pe") {
    return "premature-ejaculation";
  }
  if (value === "intimate-skin" || value === "skin") {
    return "intimate-skin";
  }
  return "hair-loss";
}

/** Shared post-clinical screens for every condition. */
export const sharedClosingSteps: IntakeStep[] = [
  { id: "next-steps", title: "", description: "", options: [] },
  {
    id: "shipping-info",
    title: "Let's set up your account",
    description: "We need a few of your details so the physician can review your intake.",
    options: [],
  },
  { id: "recommendation-interstitial", title: "", description: "", options: [] },
  { id: "review-submit-interstitial", title: "", description: "", options: [] },
];

export const photoFlowSteps: IntakeStep[] = [
  { id: "photo-check", title: "", description: "", options: [] },
  { id: "camera-prep", title: "", description: "", options: [] },
  { id: "camera-capture", title: "", description: "", options: [] },
  { id: "post-camera-interstitial", title: "", description: "", options: [] },
];
