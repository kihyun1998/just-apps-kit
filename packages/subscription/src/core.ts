// Server-safe entry ("@just-apps/subscription/core"): types + constants only,
// no React and no "use client" banner, so route handlers get real values.
export type {
  Locale,
  TranslationOverrides,
  PlanId,
  SubscriptionStatus,
  EntitlementSource,
  Subscription,
  Entitlement,
} from "./types";

export { PLAN_ENTITLEMENTS, PLAN_LABELS } from "./constants";
