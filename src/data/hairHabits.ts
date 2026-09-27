export type HairHabitTip = {
  slug: string;
  title: string;
  summary: string;
  support: string;
  why: string;
  how: string[];
};

export type HairHabitCategory = {
  slug: string;
  title: string;
  icon: "nutrition" | "scalp" | "sleep" | "styling" | "stress";
  eyebrow: string;
  intro: string;
  supports: string;
  tips: HairHabitTip[];
};

export const hairHabitCategories: HairHabitCategory[] = [
  {
    slug: "nutrition",
    title: "Nutrition",
    icon: "nutrition",
    eyebrow: "Supports hair health",
    intro: "Hair is mostly keratin. Steady protein and a less extreme diet help the hair you already have stay stronger while treatment does the rest.",
    supports: "Helps with breakage and energy — not a substitute for minoxidil or finasteride.",
    tips: [
      {
        slug: "protein",
        title: "Eat enough protein across the day",
        summary: "Eggs, yogurt, legumes, fish, or meat give hair the building blocks it is made of.",
        support: "Supports hair health",
        why: "Hair shafts are keratin. If protein intake stays very low for weeks, hair can feel thinner and break more easily even when treatment is working.",
        how: [
          "Include a protein source at two meals, not only dinner.",
          "Greek yogurt, eggs, lentils, and fish are easy defaults.",
          "You do not need a special hair supplement for this step.",
        ],
      },
      {
        slug: "crash-diets",
        title: "Skip crash diets",
        summary: "Sudden calorie cuts can trigger extra shedding a few months later.",
        support: "Helps keep shedding in check",
        why: "A sharp drop in calories or rapid weight loss can push more hairs into a resting phase. That shedding is delayed, so it is easy to blame treatment by mistake.",
        how: [
          "If you want to lose weight, do it gradually.",
          "Keep meals regular rather than skipping whole days.",
          "Tell your physician if your diet has changed a lot since intake.",
        ],
      },
      {
        slug: "iron-variety",
        title: "Keep some iron-rich foods in rotation",
        summary: "Low iron can make hair feel weaker. Food first, unless a clinician has advised otherwise.",
        support: "Supports hair strength",
        why: "Iron helps carry oxygen. A very restricted diet can leave you low without you noticing until hair and energy both feel off.",
        how: [
          "Red meat, lentils, spinach, and beans are useful sources.",
          "Pair plant iron with vitamin C (pepper, citrus, tomato).",
          "Do not start iron pills on your own — ask your physician.",
        ],
      },
    ],
  },
  {
    slug: "scalp",
    title: "Scalp care",
    icon: "scalp",
    eyebrow: "Protect the environment",
    intro: "Treatment needs a scalp that is clean enough to absorb medicine and calm enough not to flake or itch you into scratching.",
    supports: "Helps application and comfort — it does not grow new follicles.",
    tips: [
      {
        slug: "gentle-wash",
        title: "Wash gently, not aggressively",
        summary: "Fingertips, not nails. Let shampoo sit, then rinse. Hard scrubbing inflames the scalp.",
        support: "Protects the scalp",
        why: "Friction and scratching can break hairs and irritate follicles. A calmer wash keeps the scalp in better shape for topical treatment.",
        how: [
          "Use pads of your fingers, never nails.",
          "One thorough wash is better than two rough ones.",
          "If the scalp stings after minoxidil, mention it at check-in.",
        ],
      },
      {
        slug: "let-it-dry",
        title: "Let treatment dry before hats or heat",
        summary: "Give topical medicine 2–4 hours before a cap, helmet, or a hot dryer on the scalp.",
        support: "Helps treatment sit",
        why: "Wiping or steaming the scalp too soon can move product off the skin it needs to sit on.",
        how: [
          "Apply on a dry scalp, then leave it.",
          "If mornings are rushed, use the evening dose as your reliable one.",
          "A cool setting is kinder than high heat on treated skin.",
        ],
      },
      {
        slug: "no-picking",
        title: "Leave flakes and scabs alone",
        summary: "Picking feels productive. It usually delays healing and can leave marks.",
        support: "Supports a calm scalp",
        why: "Picking creates more inflammation. That is the opposite of a stable scalp during the first months of treatment.",
        how: [
          "If itch is constant, log it in your check-in instead of scratching.",
          "A bland moisturizer on surrounding skin can help — not on wet minoxidil.",
          "Ask your physician before adding extra scalp products.",
        ],
      },
    ],
  },
  {
    slug: "sleep",
    title: "Sleep",
    icon: "sleep",
    eyebrow: "Keep the cycle steady",
    intro: "A regular sleep window will not replace treatment, but short or chaotic nights add physiological stress that hair can feel weeks later.",
    supports: "Supports consistency and recovery — not a growth drug.",
    tips: [
      {
        slug: "sleep-window",
        title: "Protect a regular sleep window",
        summary: "Same-ish bedtime most nights beats an occasional perfect 8 hours.",
        support: "Supports hair health",
        why: "The hair cycle is sensitive to sustained physiological stress. Irregular sleep is a common, fixable source of that stress.",
        how: [
          "Pick a 7-hour window you can repeat on weekdays.",
          "Keep your phone out of the last 20 minutes if you can.",
          "If shift work is unavoidable, still protect a dark, quiet block.",
        ],
      },
    ],
  },
  {
    slug: "stress",
    title: "Stress",
    icon: "stress",
    eyebrow: "Tied to delayed shedding",
    intro: "A hard stretch can push more hairs into a resting phase. That extra shedding often shows up in the shower two or three months later, which is easy to blame on treatment.",
    supports: "Helps you stay consistent while the lag plays out.",
    tips: [
      {
        slug: "stress-shedding",
        title: "Treat stress shedding as delayed, not instant",
        summary: "A hard month can show in the shower 2–3 months later. Do not panic-change doses.",
        support: "Helps you stay consistent",
        why: "Telogen shedding lags the trigger. People often stop treatment just as the old stress is finishing its effect.",
        how: [
          "Keep taking the prescribed treatment unless your physician says otherwise.",
          "Log unusually stressful periods in messages so the timeline is clear.",
          "A short daily walk is more useful than a new supplement stack.",
        ],
      },
      {
        slug: "downshift",
        title: "Give the nervous system a daily downshift",
        summary: "Ten quiet minutes, a walk, or an earlier lights-out beat a new hair product.",
        support: "Lowers the background load",
        why: "Sustained stress hormones are one reason more hairs can enter a resting phase. You cannot delete a hard month, but you can stop adding to it every evening.",
        how: [
          "Pick one repeatable downshift: a walk, stretching, or sitting without a screen.",
          "Protect sleep as part of the same plan — they travel together.",
          "Tell your physician if stress has been unusually high since intake.",
        ],
      },
    ],
  },
  {
    slug: "styling",
    title: "Styling & heat",
    icon: "styling",
    eyebrow: "Reduce breakage",
    intro: "Tight styles and high heat do not cause male-pattern loss, but they snap the hair you are trying to keep looking thicker.",
    supports: "Protects length and density appearance — it does not reverse AGA.",
    tips: [
      {
        slug: "heat",
        title: "Turn the heat down",
        summary: "High heat on wet hair is the fastest way to make treated hair look thinner.",
        support: "Reduces breakage",
        why: "Heat damages the cuticle. Broken lengths make coverage look worse even when the follicle is responding.",
        how: [
          "Air-dry as far as you can before any dryer.",
          "Use a lower setting and keep the nozzle moving.",
          "Skip daily straightening while you are judging progress photos.",
        ],
      },
      {
        slug: "tension",
        title: "Loosen tight styles",
        summary: "Caps, tight fades on the hairline, and pulled-back styles add traction on already-sensitive edges.",
        support: "Protects the hairline",
        why: "Constant tension can thin the hairline independently of DHT. That is avoidable wear.",
        how: [
          "Rotate hat use; do not sleep in tight caps.",
          "Ask your barber to avoid aggressive line-ups if the hairline is thinning.",
          "If you wear a helmet daily, a clean, dry scalp underneath still matters.",
        ],
      },
      {
        slug: "wet-hair",
        title: "Be careful with wet hair",
        summary: "Wet hair stretches. Brushing hard then is when lengths snap.",
        support: "Reduces breakage",
        why: "Breakage is not the same as pattern loss, but it shows up in the same mirror.",
        how: [
          "Detangle from the ends up, with a wide-tooth comb.",
          "A small amount of conditioner on lengths reduces snagging.",
          "Pat dry; do not wring.",
        ],
      },
    ],
  },
];

export function getHairHabitCategory(slug: string) {
  return hairHabitCategories.find((category) => category.slug === slug) ?? null;
}

export function getHairHabitTip(categorySlug: string, tipSlug: string) {
  const category = getHairHabitCategory(categorySlug);
  if (!category) return null;
  const tip = category.tips.find((item) => item.slug === tipSlug);
  if (!tip) return null;
  return { category, tip };
}
