import type { IntakeConditionCatalog, IntakeStep } from "./types";
import { photoFlowSteps, sharedClosingSteps } from "./types";

const intakeSteps: IntakeStep[] = [
  {
    id: "current-situation",
    title: "What made you start today?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "My hairline has changed",
      "I’m seeing more thinning or shedding",
      "I want clarity before it progresses",
      "I’m not sure yet",
    ],
  },
  {
    id: "change-location",
    title: "Where are you noticing changes?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Along the hairline", "At the top", "All over"],
  },
  {
    id: "timeline",
    title: "How long have you noticed this?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Less than 6 months", "6–12 months", "1–3 years", "More than 3 years"],
  },
  {
    id: "clarity",
    title: "What would you like more clarity on?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Whether this looks normal",
      "What options might fit my situation",
      "Whether I should act now or wait",
      "What a physician may recommend",
    ],
  },
  {
    id: "primary-goal",
    title: "What is your primary goal?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "I want to prevent further hair loss",
      "I want to improve hair density or regrowth",
      "I want both prevention and regrowth",
      "I'm not sure yet",
    ],
  },
];

const clinicalSteps: IntakeStep[] = [
  {
    id: "progression",
    title: "How has your hair loss changed over time?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Gradual over time", "Comes and goes", "Sudden increase in shedding", "Not sure"],
  },
  {
    id: "symptoms",
    title: "Are you experiencing any scalp symptoms?",
    description: "Choose the option that feels closest to your experience.",
    options: ["No symptoms", "Mild dryness or itching", "Redness or irritation", "Pain, sores, or infection"],
  },
  {
    id: "family-history",
    title: "Is there a family history of hair loss?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Yes — on my father’s side",
      "Yes — on my mother’s side",
      "No known family history",
      "Not sure",
    ],
  },
  {
    id: "medical-conditions",
    title: "Do you currently have any ongoing medical conditions?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "No known conditions",
      "Yes — stable or managed conditions",
      "Yes — ongoing concerns I’d like to mention",
    ],
  },
  {
    id: "medications",
    title: "Are you currently taking any medications or supplements?",
    description: "Choose the option that feels closest to your experience.",
    options: ["No", "Yes"],
  },
  ...photoFlowSteps,
  {
    id: "recent-changes",
    title: "Have there been any recent changes that may be relevant?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Major stress", "Illness or fever", "Diet, weight, or medication change", "None of these"],
  },
  {
    id: "previous-hair-loss-treatments",
    title: "Have you tried anything for your hair loss before?",
    description: "Choose the option that feels closest to your experience.",
    options: ["No", "Yes"],
  },
  {
    id: "final-notes",
    title: "Is there anything else you’d like the physician to know?",
    description: "",
    options: ["No", "Yes"],
  },
];

export const hairLossCatalog: IntakeConditionCatalog = {
  condition: "hair-loss",
  label: "Hair loss",
  requiresPhotos: true,
  intakeSteps,
  medicalSteps: [...clinicalSteps, ...sharedClosingSteps],
  progressBarStepIds: [
    "progression",
    "symptoms",
    "family-history",
    "medical-conditions",
    "medications",
    "recent-changes",
    "previous-hair-loss-treatments",
    "final-notes",
    "progress-end",
  ],
};
