import type { IntakeConditionCatalog, IntakeStep } from "./types";
import { sharedClosingSteps } from "./types";

const intakeSteps: IntakeStep[] = [
  {
    id: "pe-start",
    title: "What brings you here today?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "I finish sooner than I’d like",
      "I’d like more control",
      "It’s affecting my confidence",
      "I’m just exploring my options",
    ],
  },
  {
    id: "pe-openness",
    title: "How long has this been bothering you?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Recently", "A few months", "More than a year", "It’s always been this way"],
  },
  {
    id: "pe-clarity",
    title: "What would you most like to improve?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Last longer",
      "Feel more in control",
      "Feel more confident",
      "Understand what’s happening",
    ],
  },
];

const clinicalSteps: IntakeStep[] = [
  {
    id: "pe-concern",
    title: "What best describes your concern?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "I ejaculate sooner than I’d like",
      "I have difficulty controlling ejaculation",
      "Both",
      "I’m not sure",
    ],
  },
  {
    id: "pe-timing",
    title: "About how long does it usually take you to ejaculate during sex?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Less than 1 minute", "1–3 minutes", "More than 3 minutes", "It varies a lot"],
  },
  {
    id: "pe-control",
    title: "How much control do you usually feel you have?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Very little or none", "Some", "Quite a lot", "It varies"],
  },
  {
    id: "pe-onset",
    title: "When did this start?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "I’ve experienced it since becoming sexually active",
      "It developed later",
      "It started recently",
      "I’m not sure",
    ],
  },
  {
    id: "pe-frequency",
    title: "How often does it happen?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Occasionally", "About half the time", "Most of the time", "Almost every time"],
  },
  {
    id: "pe-distress",
    title: "How much does this bother you?",
    description: "Choose the option that feels closest to your experience.",
    options: ["A little", "Moderately", "A lot", "Extremely"],
  },
  {
    id: "pe-relationship",
    title: "Does it affect your relationship or sex life?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Not really", "Sometimes", "Significantly", "I’d rather not say"],
  },
  {
    id: "pe-erection",
    title: "Do you also experience difficulty getting or keeping an erection?",
    description: "Choose the option that feels closest to your experience.",
    options: ["No", "Occasionally", "Frequently", "I’m not sure"],
  },
  {
    id: "pe-previous",
    title: "Have you tried anything for this before?",
    description: "Choose the option that feels closest to your experience.",
    options: ["Medication", "Creams / sprays", "Techniques or exercises", "Nothing yet"],
  },
  {
    id: "pe-goal",
    title: "What would you most like help with?",
    description: "Choose the option that feels closest to your experience.",
    options: [
      "Lasting longer",
      "Having more control",
      "Understanding why this happens",
      "Exploring treatment options",
    ],
  },
];

export const prematureEjaculationCatalog: IntakeConditionCatalog = {
  condition: "premature-ejaculation",
  label: "Premature ejaculation",
  requiresPhotos: false,
  intakeSteps,
  medicalSteps: [...clinicalSteps, ...sharedClosingSteps],
  progressBarStepIds: [
    "pe-concern",
    "pe-timing",
    "pe-control",
    "pe-onset",
    "pe-frequency",
    "pe-distress",
    "pe-relationship",
    "pe-erection",
    "pe-previous",
    "pe-goal",
    "progress-end",
  ],
};
