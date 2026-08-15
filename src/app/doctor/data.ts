export type RiskLevel = "Green" | "Orange" | "Red";
export type Priority = "High" | "Medium" | "Low";
export type TabKey = "pending" | "approved" | "declined";
export type FlagLevel = "orange" | "red";

export type MedicalAnswer = {
  question: string;
  answer: string;
  flag?: FlagLevel;
  flagNote?: string;
};

export type TriageFinding = {
  level: FlagLevel;
  point: string;
  note: string;
};

export type PreviousTreatment = {
  category: string;
  detail?: string;
};

export type PatientPhoto = {
  label: string;
  src: string;
};

export type PatientCase = {
  id: string;
  firstName: string;
  risk: RiskLevel;
  agaScore: number;
  confidence: "High" | "Medium" | "Low";
  status: string;
  submittedAt: number; // timestamp in milliseconds
  ageRange: string;
  reason: string;
  location: string;
  reportedOnset: string;
  date: string;
  priority: Priority;
  tab: TabKey;
  medicalConditions?: string[];
  currentMedications?: string[];
  previousTreatments?: PreviousTreatment[];
  answers: MedicalAnswer[];
  findings: TriageFinding[];
  triageNote?: string;
  photos: PatientPhoto[];
};

export const tabs: { key: TabKey; label: string }[] = [
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
];

export const riskStyles: Record<
  RiskLevel,
  { bar: string; badge: string; solidDot: string }
> = {
  Green: {
    bar: "bg-gradient-to-b from-[#5f7f4f] to-[#4b6942]",
    badge: "bg-[#e6f1e2] text-[#3f5f35]",
    solidDot: "bg-[#5f7f4f]",
  },
  Orange: {
    bar: "bg-gradient-to-b from-[#f0a64d] to-[#e0851a]",
    badge: "bg-[#fbe0b8] text-[#9a4e07]",
    solidDot: "bg-[#ec8a1e]",
  },
  Red: {
    bar: "bg-gradient-to-b from-[#e6604a] to-[#cf2f1e]",
    badge: "bg-[#fbcec5] text-[#a81d12]",
    solidDot: "bg-[#d6342c]",
  },
};

export function riskFromScore(score: number): RiskLevel {
  if (score >= 20) return "Green";
  if (score >= 15) return "Orange";
  return "Red";
}

export function confidenceFromScore(score: number): "High" | "Medium" | "Low" {
  if (score >= 20) return "High";
  if (score >= 15) return "Medium";
  return "Low";
}


export function countFlags(c: PatientCase): { red: number; orange: number } {
  const red = c.answers.filter((a) => a.flag === "red").length;
  const orange = c.answers.filter((a) => a.flag === "orange").length;
  return { red, orange };
}

export function getRelativeTime(timestamp: number | undefined): string {
  // Handle missing or invalid timestamp
  if (!timestamp || isNaN(timestamp)) {
    return "just now";
  }

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
}
