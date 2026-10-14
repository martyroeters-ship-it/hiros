import type { IntakeConditionCatalog, IntakeStep } from "./types";
import { photoFlowSteps, sharedClosingSteps } from "./types";

const intakeSteps: IntakeStep[] = [
  {
    id: "is-start",
    title: "What brings you here today?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "I noticed something that looks different",
      "I have itching or irritation",
      "I’m experiencing discomfort",
      "I’m not sure what it is",
    ],
  },
  {
    id: "is-openness",
    title: "How concerned are you about it?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Just curious", "A little concerned", "Quite concerned", "Very concerned"],
  },
  {
    id: "is-clarity",
    title: "What would make you feel most comfortable?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Understanding what it could be",
      "Knowing what to do next",
      "Sharing it privately with a physician",
      "I’m not sure yet",
    ],
  },
];

const clinicalSteps: IntakeStep[] = [
  {
    id: "is-concern",
    title: "What are you concerned about?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Rash / redness",
      "Bumps, spots or blisters",
      "Sore / ulcer",
      "Itching or irritation",
      "Something else",
    ],
  },
  {
    id: "is-location",
    title: "Where is the concern located?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Penis", "Scrotum", "Groin / inner thigh", "Around the anus", "More than one area"],
  },
  {
    id: "is-duration",
    title: "How long has it been there?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Less than 1 week", "1–4 weeks", "1–3 months", "More than 3 months"],
  },
  {
    id: "is-symptoms",
    title: "Are you experiencing any of these?",
    description: "Select all that apply.",
    multiSelect: true,
    options: ["Itching", "Pain / tenderness", "Burning", "Discharge", "None of these"],
  },
  {
    id: "is-change",
    title: "Has it changed since you first noticed it?",
    description: "Choose the option that feels closest to your experience.",
    options: ["It’s getting worse", "It’s improving", "It’s about the same", "It comes and goes"],
  },
  {
    id: "is-sexual-contact",
    title: "Have you recently had sexual contact that you think could be relevant?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Yes", "Possibly", "No", "I’d rather discuss this with the doctor"],
  },
  {
    id: "is-sti-history",
    title: "Have you previously been diagnosed with an STI?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Yes", "No", "I’m not sure", "I’d rather discuss this with the doctor"],
  },
  {
    id: "is-tried",
    title: "Have you tried anything on the affected area?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Prescription treatment",
      "Over-the-counter cream/product",
      "Home remedy",
      "Nothing yet",
    ],
  },
  ...photoFlowSteps,
  {
    id: "is-goal",
    title: "What would you most like help with?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Understanding what it could be",
      "Knowing whether testing is needed",
      "Exploring treatment options",
      "Speaking privately with a physician",
    ],
  },
];

export const intimateSkinCatalog: IntakeConditionCatalog = {
  condition: "intimate-skin",
  label: "Intimate skin concerns",
  requiresPhotos: true,
  intakeSteps,
  medicalSteps: [...clinicalSteps, ...sharedClosingSteps],
  progressBarStepIds: [
    "is-concern",
    "is-location",
    "is-duration",
    "is-symptoms",
    "is-change",
    "is-sexual-contact",
    "is-sti-history",
    "is-tried",
    "is-goal",
    "progress-end",
  ],
};
