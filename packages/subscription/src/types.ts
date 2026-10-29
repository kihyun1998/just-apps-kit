export type { Locale, TranslationOverrides } from "../../../shared/i18n";

export const PLAN_IDS = ["just_apps_pro", "just_apps_ult"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "past_due",
  "canceled",
  "expired",
  "paused",
  "trialing",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const ENTITLEMENT_SOURCES = ["subscription", "admin", "promo", "trial"] as const;
export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number];

export function isPlanId(value: unknown): value is PlanId {
  return (PLAN_IDS as readonly unknown[]).includes(value);
}

export function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return (SUBSCRIPTION_STATUSES as readonly unknown[]).includes(value);
}

export function isEntitlementSource(value: unknown): value is EntitlementSource {
  return (ENTITLEMENT_SOURCES as readonly unknown[]).includes(value);
}

export interface Subscription {
  id: string;
  planId: PlanId;
  status: SubscriptionStatus;
  provider: string;
  canceledAt: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
}

export interface Entitlement {
  appId: string;
  source: EntitlementSource;
  expiresAt: string | null;
}
