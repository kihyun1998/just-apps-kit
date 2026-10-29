---
"@just-apps/subscription": minor
"@just-apps/auth": minor
---

`@just-apps/subscription`: the status, entitlement-source and plan values now live in one place. `SUBSCRIPTION_STATUSES`, `ENTITLEMENT_SOURCES` and `PLAN_IDS` (with `isSubscriptionStatus`, `isEntitlementSource`, `isPlanId`) are exported from the main entry and from `/core`, and `SubscriptionStatus`, `EntitlementSource` and `PlanId` are derived from them. Server code can validate a value against the same list the store uses.

Breaking: `PricingView`, `UpgradeModal`, `TrialBanner` and `CheckoutActivation` are removed, together with the translation keys only they used (`pricing.*`, `upgrade.*`, `checkout.*`, `trial.start`, `badge.pro`, `badge.free`, `common.loading`, `subscription.expired`). No family app rendered them. `useCheckout` and `SubscriptionView` are unchanged.

`@just-apps/auth`: the unused `common.loading` and `common.auth_processing` translation keys are removed, so they are no longer part of `TranslationKey`.
