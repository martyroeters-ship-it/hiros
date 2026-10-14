import type { IntakeConditionCatalog, IntakeStep } from "./types";
import { sharedClosingSteps } from "./types";

const intakeSteps: IntakeStep[] = [
  {
    id: "ed-start",
    title: "What brings you here today?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Erections aren’t as reliable as I’d like",
      "I’d like firmer erections",
      "I want to feel more confident",
      "I’m just exploring my options",
    ],
  },
  {
    id: "ed-openness",
    title: "How long has this been on your mind?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Just recently", "A few months", "More than a year", "I’m not sure"],
  },
  {
    id: "ed-clarity",
    title: "What are you hoping to get help with?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Understand what might be going on",
      "Explore possible treatment options",
      "Discuss it privately with a physician",
      "I’m not sure yet",
    ],
  },
];

const clinicalSteps: IntakeStep[] = [
  {
    id: "ed-experience",
    title: "What best describes what you’re experiencing?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Difficulty getting an erection",
      "Difficulty keeping an erection",
      "Erections aren’t as firm as before",
      "More than one of these",
    ],
  },
  {
    id: "ed-duration",
    title: "How long have you noticed this?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Less than 1 month", "1–6 months", "6–12 months", "More than 1 year"],
  },
  {
    id: "ed-frequency",
    title: "How often does this happen?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Occasionally", "About half the time", "Most of the time", "Every time"],
  },
  {
    id: "ed-morning",
    title: "Do you still get erections when waking up?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Regularly", "Sometimes", "Rarely", "Never"],
  },
  {
    id: "ed-desire",
    title: "How would you describe your sexual desire?",
    description: "Choose the option that feels closest to your experience.",
    options: ["About the same as usual", "Slightly lower", "Much lower", "I’m not sure"],
  },
  {
    id: "ed-situations",
    title: "Does it happen in every situation?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Yes", "Mainly with a partner", "Mainly in certain situations", "I’m not sure"],
  },
  {
    id: "ed-health-conditions",
    title: "Do you have any of these health conditions?",
    description: "Select all that apply.",
    multiSelect: true,
    options: [
      "High blood pressure / heart condition",
      "Diabetes",
      "High cholesterol",
      "None of these",
    ],
  },
  {
    id: "ed-medications",
    title: "Do you currently take any medication?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Yes, regularly", "Yes, occasionally", "No"],
  },
  {
    id: "ed-previous",
    title: "Have you tried anything for your erection concerns before?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Prescription medication",
      "Supplements / non-prescription products",
      "Other treatment",
      "Nothing yet",
    ],
  },
  {
    id: "ed-goal",
    title: "What would you most like help with?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Understanding what may be causing it",
      "Exploring treatment options",
      "Improving sexual confidence",
      "I’m not sure yet",
    ],
  },
];

export const erectionCatalog: IntakeConditionCatalog = {
  condition: "erection",
  label: "Erection concerns",
  requiresPhotos: false,
  intakeSteps,
  medicalSteps: [...clinicalSteps, ...sharedClosingSteps],
  progressBarStepIds: [
    "ed-experience",
    "ed-duration",
    "ed-frequency",
    "ed-morning",
    "ed-desire",
    "ed-situations",
    "ed-health-conditions",
    "ed-medications",
    "ed-previous",
    "ed-goal",
    "progress-end",
  ],
};
