import {
  confidenceFromScore,
  riskFromScore,
  type MedicalAnswer,
  type PatientCase,
  type PreviousTreatment,
  type TriageFinding,
} from "./data";

/* ------------------------------------------------------------------ *
 * Intake submission payload (collected by the intake flow)
 * ------------------------------------------------------------------ */
export type IntakeSubmission = {
  answers: Record<string, string>; // stepId -> selected option
  followUpText: Record<string, string>; // stepId -> free text
  treatmentSelections: Record<string, boolean>; // treatment type -> selected
  treatmentOtherDetail: string;
  sideEffectsLevel: string | null;
  city: string | null;
  firstName: string;
  photos: string[]; // data URLs
};

/* ------------------------------------------------------------------ *
 * Scoring — each answer maps to triage points. Score is normalized to
 * a 0–20 scale: round(rawPoints / maxPossiblePoints * 20).
 * ------------------------------------------------------------------ */
const SCORE_MAP: Record<string, Record<string, number>> = {
  "current-situation": {
    "My hairline has changed": 2,
    "I’m seeing more thinning or shedding": 2,
    "I want clarity before it progresses": 2,
    "I’m not sure yet": 1,
  },
  "change-location": {
    "Hairline / temples": 2,
    Crown: 2,
    "Overall thinning": 2,
    "More shedding than usual": 1,
    "Patchy or unusual areas": 0,
    "Not sure": 1,
  },
  timeline: {
    "Less than 3 months": 0,
    "3–6 months": 1,
    "6–12 months": 1,
    "1–3 years": 2,
    "More than 3 years": 2,
  },
  clarity: {
    "Whether this looks normal": 1,
    "What options might fit my situation": 1,
    "Whether I should act now or wait": 1,
    "What a physician may recommend": 1,
    "I’m not sure yet": 1,
  },
  progression: {
    "Slow and steady over years": 2,
    "Gradual over months": 2,
    "Comes and goes": 1,
    "Sudden increase in shedding": 0,
    "Not sure": 1,
  },
  symptoms: {
    "No symptoms": 2,
    "Mild dandruff or dryness": 1,
    Itching: 1,
    "Redness or irritation": 0,
    "Pain, sores, or infection": -2,
  },
  "family-history": {
    "Father or grandfather experienced hair loss": 2,
    "Mother’s side experienced hair loss": 2,
    "Some family thinning": 1,
    "No known family history": 0,
    "Not sure": 1,
  },
  "medical-conditions": {
    "No known conditions": 2,
    "Yes — stable or managed conditions": 1,
    "Yes — ongoing concerns I’d like to mention": 0,
  },
  medications: { No: 2, Yes: 1 },
  "recent-changes": {
    "Major stress": 0,
    "Illness or fever": 0,
    "Weight or diet change": 0,
    "New medication or supplement": 0,
    "None of these": 2,
    "Not sure": 1,
  },
  "previous-hair-loss-treatments": { No: 1, Yes: 1 },
  "final-notes": { No: 1, Yes: 1 },
};

const SIDE_EFFECT_SCORE: Record<string, number> = {
  None: 2,
  Mild: 1,
  Moderate: 0,
  Significant: -1,
};

/* Human-readable labels for the record / case review. */
const QUESTION_LABELS: Record<string, string> = {
  "current-situation": "Reason for visit",
  "change-location": "Affected areas",
  timeline: "Reported onset",
  clarity: "Clarity sought",
  progression: "Rate of progression",
  symptoms: "Scalp symptoms",
  "family-history": "Family history of hair loss",
  "medical-conditions": "Ongoing medical conditions",
  medications: "Current medications",
  "recent-changes": "Recent changes",
  "previous-hair-loss-treatments": "Previous treatments",
  "final-notes": "Additional notes",
};

const ANSWER_ORDER = [
  "current-situation",
  "change-location",
  "timeline",
  "clarity",
  "progression",
  "symptoms",
  "family-history",
  "medical-conditions",
  "medications",
  "recent-changes",
  "previous-hair-loss-treatments",
  "final-notes",
];

/* ------------------------------------------------------------------ *
 * Flag logic — more important than the raw score. Answer-driven flags
 * plus free-text keyword scanning for medications / conditions / notes.
 * ------------------------------------------------------------------ */
type FlagRule = { step: string; value: string; note: string };

const RED_ANSWER_FLAGS: FlagRule[] = [
  { step: "change-location", value: "Patchy or unusual areas", note: "Patchy/unusual pattern — possible alopecia areata or alternative diagnosis." },
  { step: "symptoms", value: "Pain, sores, or infection", note: "Scalp pain, sores, or infection — further evaluation may be appropriate." },
  { step: "progression", value: "Sudden increase in shedding", note: "Rapid-onset shedding — consider alternative diagnosis." },
];

const ORANGE_ANSWER_FLAGS: FlagRule[] = [
  { step: "timeline", value: "Less than 3 months", note: "Very recent onset — consider telogen effluvium or temporary shedding vs. AGA." },
  { step: "family-history", value: "No known family history", note: "No family history reported — less typical for androgenetic alopecia." },
  { step: "symptoms", value: "Redness or irritation", note: "Scalp redness/irritation — physician review advised." },
  { step: "symptoms", value: "Itching", note: "Scalp itching — physician review advised." },
  { step: "recent-changes", value: "Major stress", note: "Recent severe stress — possible telogen effluvium." },
  { step: "recent-changes", value: "Illness or fever", note: "Recent illness/fever — possible telogen effluvium." },
  { step: "recent-changes", value: "Weight or diet change", note: "Recent weight/diet change — possible telogen effluvium." },
  { step: "recent-changes", value: "New medication or supplement", note: "New medication or supplement — review for shedding cause." },
  { step: "medical-conditions", value: "Yes — ongoing concerns I’d like to mention", note: "Ongoing medical concern reported — requires physician review." },
];

const RED_KEYWORDS = ["chemo", "chemotherapy", "alopecia areata"];
const ORANGE_KEYWORDS = ["levothyroxine", "thyroid", "testosterone", "autoimmune", "lupus", "methotrexate", "synthroid"];

function matchKeyword(text: string, keywords: string[]): string | null {
  const lower = text.toLowerCase();
  return keywords.find((k) => lower.includes(k)) ?? null;
}

/* ------------------------------------------------------------------ *
 * Main evaluator
 * ------------------------------------------------------------------ */
export type TriageResult = {
  agaScore: number;
  risk: PatientCase["risk"];
  confidence: PatientCase["confidence"];
  findings: TriageFinding[];
  answers: MedicalAnswer[];
};

export function evaluateIntake(input: IntakeSubmission): TriageResult {
  let raw = 0;
  let maxRaw = 0;

  for (const stepId of Object.keys(SCORE_MAP)) {
    const selected = input.answers[stepId];
    if (selected === undefined) continue;
    const map = SCORE_MAP[stepId];
    const points = map[selected];
    if (points === undefined) continue;
    raw += points;
    maxRaw += Math.max(...Object.values(map));
  }

  // Side effects only count when previous treatments were tried.
  if (input.answers["previous-hair-loss-treatments"] === "Yes" && input.sideEffectsLevel) {
    raw += SIDE_EFFECT_SCORE[input.sideEffectsLevel] ?? 0;
    maxRaw += 2;
  }

  const normalized = maxRaw > 0 ? Math.round((Math.max(raw, 0) / maxRaw) * 20) : 0;
  const agaScore = Math.max(0, Math.min(20, normalized));

  // --- Findings / flags ---
  const findings: TriageFinding[] = [];
  const flagByStep: Record<string, { level: "red" | "orange"; note: string }> = {};

  for (const rule of RED_ANSWER_FLAGS) {
    if (input.answers[rule.step] === rule.value) {
      findings.push({ level: "red", point: `${QUESTION_LABELS[rule.step]}: ${rule.value}`, note: rule.note });
      flagByStep[rule.step] = { level: "red", note: rule.note };
    }
  }
  for (const rule of ORANGE_ANSWER_FLAGS) {
    if (input.answers[rule.step] === rule.value && !flagByStep[rule.step]) {
      findings.push({ level: "orange", point: `${QUESTION_LABELS[rule.step]}: ${rule.value}`, note: rule.note });
      flagByStep[rule.step] = { level: "orange", note: rule.note };
    }
  }

  // Free-text keyword scanning (medications, conditions, final notes).
  const textFields: { step: string; label: string }[] = [
    { step: "medications", label: "Current medications" },
    { step: "medical-conditions", label: "Medical condition" },
    { step: "final-notes", label: "Patient note" },
  ];
  for (const { step, label } of textFields) {
    const text = input.followUpText[step];
    if (!text) continue;
    const red = matchKeyword(text, RED_KEYWORDS);
    const orange = !red ? matchKeyword(text, ORANGE_KEYWORDS) : null;
    if (red) {
      const note = `${label} flagged: "${red}" — possible alternative diagnosis, physician review required.`;
      findings.push({ level: "red", point: `${label}: ${text}`, note });
      if (!flagByStep[step] || flagByStep[step].level !== "red") flagByStep[step] = { level: "red", note };
    } else if (orange) {
      const note = `${label} flagged: "${orange}" — requires physician review.`;
      findings.push({ level: "orange", point: `${label}: ${text}`, note });
      if (!flagByStep[step]) flagByStep[step] = { level: "orange", note };
    }
  }

  // --- Answers list for case review / clinical record ---
  const answers: MedicalAnswer[] = [];
  for (const stepId of ANSWER_ORDER) {
    const selected = input.answers[stepId];
    if (selected === undefined || selected === "") continue;
    const flag = flagByStep[stepId];
    answers.push({
      question: QUESTION_LABELS[stepId] ?? stepId,
      answer: selected,
      ...(flag ? { flag: flag.level, flagNote: flag.note } : {}),
    });
  }

  return {
    agaScore,
    risk: riskFromScore(agaScore), // risk derived from score
    confidence: confidenceFromScore(agaScore),
    findings,
    answers,
  };
}

/* ------------------------------------------------------------------ *
 * Build a full PatientCase from an intake submission.
 * ------------------------------------------------------------------ */
function generateCaseId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 8; i += 1) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `HIROS-${suffix}`;
}

/* ------------------------------------------------------------------ *
 * Generate AI summary of patient intake
 * ------------------------------------------------------------------ */
export function generateIntakeSummary(caseItem: PatientCase): string {
  const parts: string[] = [];

  // Onset description
  const onset = caseItem.reportedOnset.toLowerCase();
  if (onset.includes("less than 3")) {
    parts.push("Very recent onset reported");
  } else if (onset.includes("3") || onset.includes("6")) {
    parts.push("Recent onset reported");
  } else {
    parts.push("Progressive hair loss reported");
  }

  // Timeline
  parts[0] += ` over the past ${onset.replace("reported", "").trim()}.`;

  // Medical conditions
  if (!caseItem.medicalConditions || caseItem.medicalConditions.length === 0) {
    parts.push("No medical conditions disclosed.");
  } else {
    parts.push(`Medical conditions reported: ${caseItem.medicalConditions.join(", ")}.`);
  }

  // Medications
  if (!caseItem.currentMedications || caseItem.currentMedications.length === 0) {
    parts.push("No current medications reported.");
  } else {
    parts.push(`Currently taking medications.`);
  }

  // Pattern assessment
  const redFlags = caseItem.findings.filter((f) => f.level === "red").length;
  const orangeFlags = caseItem.findings.filter((f) => f.level === "orange").length;
  
  if (redFlags > 0) {
    parts.push("Pattern requires immediate physician review.");
  } else if (caseItem.agaScore >= 15) {
    parts.push("Pattern appears consistent with androgenetic alopecia.");
  } else if (caseItem.agaScore >= 10) {
    parts.push("Pattern shows some characteristics of androgenetic alopecia.");
  } else {
    parts.push("Pattern requires physician evaluation.");
  }

  // Flags
  const totalFlags = redFlags + orangeFlags;
  if (totalFlags === 0) {
    parts.push("No caution flags identified.");
  } else if (totalFlags === 1) {
    parts.push("One caution flag identified for physician review.");
  } else {
    parts.push(`${totalFlags} caution flags identified for physician review.`);
  }

  return parts.join(" ");
}

/* ------------------------------------------------------------------ *
 * Treatment recommendation logic based on intake answers
 * ------------------------------------------------------------------ */
export type TreatmentRecommendation = {
  type: "finasteride" | "minoxidil" | "combo" | "review";
  title: string;
  description: string;
  imageSrc: string;
};

export function determineTreatmentRecommendation(input: IntakeSubmission): TreatmentRecommendation {
  // Check for red flags that require physician review first
  const location = input.answers["change-location"];
  const symptoms = input.answers["symptoms"];
  const progression = input.answers["progression"];
  const recentChanges = input.answers["recent-changes"];
  const medicalConditions = input.answers["medical-conditions"];

  // Route 4: Physician review first
  if (
    symptoms === "Pain, sores, or infection" ||
    symptoms === "Redness or irritation" ||
    location === "Patchy or unusual areas" ||
    progression === "Sudden increase in shedding" ||
    recentChanges === "Illness or fever" ||
    recentChanges === "New medication or supplement" ||
    medicalConditions === "Yes — ongoing concerns I'd like to mention"
  ) {
    return {
      type: "review",
      title: "Additional physician review recommended",
      description: "Based on your intake, a physician will need to review your case before recommending treatment.",
      imageSrc: "/treatment-bottle.png",
    };
  }

  // Calculate Finasteride score
  let finasterideScore = 0;
  
  // Primary goal: prevent (+3)
  const primaryGoal = input.answers["primary-goal"];
  if (primaryGoal === "I want to prevent further hair loss") {
    finasterideScore += 3;
  }
  
  // Location: Hairline / temples (+3)
  if (location === "Hairline / temples") {
    finasterideScore += 3;
  }
  
  // Prevention goal (+2)
  const clarity = input.answers["clarity"];
  const currentSituation = input.answers["current-situation"];
  if (
    clarity === "Whether I should act now or wait" ||
    currentSituation === "I want clarity before it progresses"
  ) {
    finasterideScore += 2;
  }
  
  // Slow progression (+2)
  if (progression === "Slow and steady over years" || progression === "Gradual over months") {
    finasterideScore += 2;
  }
  
  // Family history (+1)
  const familyHistory = input.answers["family-history"];
  if (
    familyHistory === "Father or grandfather experienced hair loss" ||
    familyHistory === "Mother's side experienced hair loss" ||
    familyHistory === "Some family thinning"
  ) {
    finasterideScore += 1;
  }

  // Calculate Minoxidil score
  let minoxidilScore = 0;
  
  // Primary goal: regrowth (+3)
  if (primaryGoal === "I want to improve hair density or regrowth") {
    minoxidilScore += 3;
  }
  
  // Crown (+3)
  if (location === "Crown") {
    minoxidilScore += 3;
  }
  
  // Overall thinning (+3)
  if (location === "Overall thinning") {
    minoxidilScore += 3;
  }
  
  // Shedding motivation (+2)
  if (currentSituation === "I'm seeing more thinning or shedding") {
    minoxidilScore += 2;
  }
  
  // Wants regrowth (+1)
  if (
    clarity === "What options might fit my situation" ||
    clarity === "What a physician may recommend"
  ) {
    minoxidilScore += 1;
  }
  
  // Calculate Combo score
  let comboScore = 0;
  
  // Primary goal: both (+3)
  if (primaryGoal === "I want both prevention and regrowth") {
    comboScore += 3;
    finasterideScore += 3;
    minoxidilScore += 3;
  }

  // Determine recommendation based on scores
  // Route 3: Combo (both scores > 4)
  if (finasterideScore > 4 && minoxidilScore > 4) {
    return {
      type: "combo",
      title: "Topical Finasteride + Minoxidil",
      description: "Commonly considered when both prevention and regrowth are desired.",
      imageSrc: "/treatment-bottle.png",
    };
  }
  
  // Route 1: Finasteride (finasteride score higher)
  if (finasterideScore >= minoxidilScore && finasterideScore > 0) {
    return {
      type: "finasteride",
      title: "Topical Finasteride",
      description: "Commonly considered for slowing or preventing further hair loss.",
      imageSrc: "/treatment-bottle.png",
    };
  }
  
  // Route 2: Minoxidil (minoxidil score higher)
  if (minoxidilScore > finasterideScore && minoxidilScore > 0) {
    return {
      type: "minoxidil",
      title: "Topical Minoxidil",
      description: "Commonly considered when improving hair density is a primary goal.",
      imageSrc: "/treatment-bottle.png",
    };
  }

  // Default to combo if no clear winner
  return {
    type: "combo",
    title: "Topical Finasteride + Minoxidil",
    description: "Commonly considered for male pattern hair loss.",
    imageSrc: "/treatment-bottle.png",
  };
}

export function buildCaseFromIntake(input: IntakeSubmission): PatientCase {
  const triage = evaluateIntake(input);

  const priority = triage.risk === "Red" ? "High" : triage.risk === "Orange" ? "Medium" : "Low";

  // Optional structured medical context.
  const conditionAnswer = input.answers["medical-conditions"];
  const medicalConditions =
    conditionAnswer && conditionAnswer !== "No known conditions"
      ? [input.followUpText["medical-conditions"]?.trim() || conditionAnswer]
      : undefined;

  const currentMedications =
    input.answers["medications"] === "Yes"
      ? [input.followUpText["medications"]?.trim() || "Reported — see notes"]
      : undefined;

  let previousTreatments: PreviousTreatment[] | undefined;
  if (input.answers["previous-hair-loss-treatments"] === "Yes") {
    previousTreatments = Object.keys(input.treatmentSelections)
      .filter((k) => input.treatmentSelections[k])
      .map((category) => ({
        category,
        detail: category === "Other" ? input.treatmentOtherDetail || undefined : undefined,
      }));
    if (previousTreatments.length === 0) previousTreatments = [{ category: "Reported — see notes" }];
  }

  const photos = input.photos.map((src, i) => ({
    label: ["front_hairline", "crown_top", "scalp_parting"][i] ?? `Photo ${i + 1}`,
    src,
  }));

  return {
    id: generateCaseId(),
    firstName: input.firstName.trim() || "Patient",
    risk: triage.risk,
    agaScore: triage.agaScore,
    confidence: triage.confidence,
    status: "Submitted",
    submittedAt: Date.now(),
    ageRange: "Not provided",
    reason: input.answers["current-situation"] ?? "Hair loss consultation",
    location: input.city ?? "Not provided",
    reportedOnset: input.answers["timeline"] ?? "Not provided",
    date: new Date().toLocaleDateString("en-US"),
    priority,
    tab: "pending",
    medicalConditions,
    currentMedications,
    previousTreatments,
    answers: triage.answers,
    findings: triage.findings,
    photos,
  };
}
