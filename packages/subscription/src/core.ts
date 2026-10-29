// Server-safe entry ("@just-apps/subscription/core"): types + constants only — docs/map/invariant/client-server-entry-split.md
export type {
  Locale,
  TranslationOverrides,
  PlanId,
  BillingInterval,
  SubscriptionStatus,
  EntitlementSource,
  Subscription,
  Entitlement,
} from "./types";
export {
  PLAN_IDS,
  BILLING_INTERVALS,
  SUBSCRIPTION_STATUSES,
  ENTITLEMENT_SOURCES,
  isPlanId,
  isSubscriptionStatus,
  isEntitlementSource,
} from "./types";

export { PLAN_ENTITLEMENTS, PLAN_LABELS } from "./constants";
