export const SCALP_VIEW_IDS = ["front", "left", "right", "top"] as const;

export type ScalpViewId = (typeof SCALP_VIEW_IDS)[number];

export type ScalpGuideShape = "face" | "scalp";

export type ScalpView = {
  id: ScalpViewId;
  shape: ScalpGuideShape;
  /** Face landmarks can check center and head angle for this view. */
  tracksFace: boolean;
};

export const SCALP_VIEWS: ScalpView[] = [
  { id: "front", shape: "face", tracksFace: true },
  { id: "left", shape: "face", tracksFace: true },
  { id: "right", shape: "face", tracksFace: true },
  { id: "top", shape: "scalp", tracksFace: false },
];
