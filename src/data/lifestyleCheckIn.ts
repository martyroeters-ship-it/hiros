export type LifestyleArea = "nutrition" | "sleep";
export type LifestyleStatus = "on_track" | "needs_attention";

export type LifestyleQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string; weight: number }[];
};

export type LifestyleWrapUp = {
  title: string;
  significance: string;
  nextIfNeeded: string;
  nextIfOk: string;
};

export const lifestyleCheckIns: Record<
  LifestyleArea,
  {
    title: string;
    intro: string;
    habitHref: string;
    wrapUp: LifestyleWrapUp;
    questions: LifestyleQuestion[];
  }
> = {
  nutrition: {
    title: "Nutrition check-in",
    intro: "Three short questions. We only surface Nutrition in Hair health if the answers suggest it needs a look.",
    habitHref: "/care/habits/nutrition",
    wrapUp: {
      title: "Nutrition quietly shapes what\nhair can do.",
      significance:
        "Hair shafts are mostly keratin. Low protein, a hard\ncalorie cut, or very little iron-rich food can make hair\nfeel weaker weeks later — even when treatment is doing\nits job.",
      nextIfNeeded:
        "Next, we’ll help you tighten a few food habits. Small and\nrepeatable, next to your prescription — not instead of it.",
      nextIfOk:
        "Your answers do not look like the main issue right now.\nThe same habits stay here if you want them later.",
    },
    questions: [
      {
        id: "protein",
        prompt: "How often do you eat a protein source — eggs, yogurt, legumes, fish, or meat?",
        options: [
          { id: "most-meals", label: "Most meals", weight: 0 },
          { id: "once-a-day", label: "About once a day", weight: 1 },
          { id: "rarely", label: "Rarely", weight: 2 },
        ],
      },
      {
        id: "calories",
        prompt: "Have you cut calories hard or skipped meals in the last few months?",
        options: [
          { id: "no", label: "No", weight: 0 },
          { id: "somewhat", label: "A bit", weight: 1 },
          { id: "a-lot", label: "Yes, a lot", weight: 2 },
        ],
      },
      {
        id: "iron",
        prompt: "In a typical week, do you eat iron-rich foods like red meat, lentils, or spinach?",
        options: [
          { id: "regularly", label: "Regularly", weight: 0 },
          { id: "sometimes", label: "Sometimes", weight: 1 },
          { id: "almost-never", label: "Almost never", weight: 2 },
        ],
      },
    ],
  },
  sleep: {
    title: "Sleep check-in",
    intro: "Three short questions. Sleep only appears in Hair health if nights look like they are adding extra load.",
    habitHref: "/care/habits/sleep",
    wrapUp: {
      title: "Sleep will not grow hair.\nIt can still add load.",
      significance:
        "Short or chaotic nights raise physiological stress.\nThe hair cycle often feels that weeks later, which is\neasy to blame on treatment.",
      nextIfNeeded:
        "Next, we’ll help you protect a more regular sleep window —\none you can actually repeat, next to your medication.",
      nextIfOk: "Your nights look reasonably steady.\nSleep tips stay available if this starts to slip.",
    },
    questions: [
      {
        id: "hours",
        prompt: "On a typical night, how much sleep do you get?",
        options: [
          { id: "seven-plus", label: "7 hours or more", weight: 0 },
          { id: "five-six", label: "5–6 hours", weight: 1 },
          { id: "under-five", label: "Under 5 hours", weight: 2 },
        ],
      },
      {
        id: "regular",
        prompt: "Is your bedtime fairly regular?",
        options: [
          { id: "most-nights", label: "Most nights", weight: 0 },
          { id: "swings", label: "It swings a lot", weight: 2 },
        ],
      },
      {
        id: "worn",
        prompt: "Do you feel worn down most days?",
        options: [
          { id: "no", label: "No", weight: 0 },
          { id: "yes", label: "Yes", weight: 2 },
        ],
      },
    ],
  },
};

export function scoreLifestyle(
  area: LifestyleArea,
  answers: Record<string, string>,
): LifestyleStatus {
  const questions = lifestyleCheckIns[area].questions;
  let score = 0;
  for (const question of questions) {
    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (!selected) return "needs_attention";
    score += selected.weight;
  }
  return score >= 3 ? "needs_attention" : "on_track";
}

export function isLifestyleArea(value: string): value is LifestyleArea {
  return value === "nutrition" || value === "sleep";
}
