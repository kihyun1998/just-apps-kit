export type Locale = "ko-KR" | "en-US";

export type TranslationOverrides = Partial<
  Record<string, Record<Locale, string>>
>;

export type PlanId = "just_apps_pro" | "just_apps_ult";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "paused"
  | "trialing";

export type EntitlementSource = "subscription" | "admin" | "promo" | "trial";

export interface Subscription {
  id: string;
  planId: PlanId;
  status: SubscriptionStatus;
  canceledAt: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
}

export interface Entitlement {
  appId: string;
  source: EntitlementSource;
  expiresAt: string | null;
}

