---
"@just-apps/subscription": minor
---

Checkout and plan labels know which plan they are for.

- Breaking: `useCheckout().startCheckout` takes `{ planId, interval }` instead of an interval, and sends both in the request body. An app's checkout endpoint that reads only `interval` keeps working.
- Breaking: `PLAN_LABELS` is `Partial<Record<PlanId, Record<Locale, string>>>`: `PLAN_LABELS.just_apps_pro["ko-KR"]` instead of `.ko`. Plans without a label (`just_apps_ult`) are absent.
- `SubscriptionView` shows the subscription's plan label (or its id) instead of a fixed "Pro".
- New `BILLING_INTERVALS` / `BillingInterval` and `StartCheckoutOptions` exports.
