import { erectionCatalog } from "./erection";
import { hairLossCatalog } from "./hair-loss";
import { intimateSkinCatalog } from "./intimate-skin";
import { prematureEjaculationCatalog } from "./premature-ejaculation";
import {
  type IntakeCondition,
  type IntakeConditionCatalog,
  parseIntakeCondition,
} from "./types";

export type { IntakeCondition, IntakeConditionCatalog, IntakeStep } from "./types";
export { INTAKE_CONDITIONS, parseIntakeCondition, photoFlowSteps, sharedClosingSteps } from "./types";

const catalogs: Record<IntakeCondition, IntakeConditionCatalog> = {
  "hair-loss": hairLossCatalog,
  erection: erectionCatalog,
  "premature-ejaculation": prematureEjaculationCatalog,
  "intimate-skin": intimateSkinCatalog,
};

export function getIntakeCatalog(condition: IntakeCondition | string | null | undefined): IntakeConditionCatalog {
  const parsed = typeof condition === "string" || condition == null ? parseIntakeCondition(condition) : condition;
  return catalogs[parsed];
}
