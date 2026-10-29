import type { Locale, PlanId } from "./types";

export const PLAN_ENTITLEMENTS: Record<string, string[]> = {
  just_apps_pro: ["logo"],
};

export const PLAN_LABELS: Partial<Record<PlanId, Record<Locale, string>>> = {
  just_apps_pro: { "ko-KR": "Pro", "en-US": "Pro" },
};
