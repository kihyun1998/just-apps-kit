# @just-apps/subscription

## 0.5.0

### Minor Changes

- 608e06a: `useSubscriptionStore.init(supabase, { appIds })` scopes the entitlements the store reads to the given app ids, so `useAllEntitlements` no longer returns rows other family apps granted on the same Supabase project (#17). Without `appIds` the store behaves as before. Calling `init` again with a different client or scope reloads instead of being ignored, and a failed load leaves the store uninitialised so the next `init` retries.

  `refetch` now settles `isLoading` when there is no session and reports a failed session check through `error` instead of rejecting. The internal `_supabase` field is no longer part of the store's state, and `clear()` no longer logs.

- 19ac096: Checkout and plan labels know which plan they are for.

  - Breaking: `useCheckout().startCheckout` takes `{ planId, interval }` instead of an interval, and sends both in the request body. An app's checkout endpoint that reads only `interval` keeps working.
  - Breaking: `PLAN_LABELS` is `Partial<Record<PlanId, Record<Locale, string>>>`: `PLAN_LABELS.just_apps_pro["ko-KR"]` instead of `.ko`. Plans without a label (`just_apps_ult`) are absent.
  - `SubscriptionView` shows the subscription's plan label (or its id) instead of a fixed "Pro".
  - New `BILLING_INTERVALS` / `BillingInterval` and `StartCheckoutOptions` exports.

- c3a8faa: Both packages' `t()` are now one function, `t(key, locale, overrides?, params?)`, built from a shared source and inlined into each package; `Locale` and `TranslationOverrides` come from the same definition.

  - `@just-apps/auth`: `t()` takes `params` and replaces each `{name}`. An empty-string override is now used as given instead of falling back to the built-in text, so an app can blank a label.
  - `@just-apps/subscription`: `{name}` is replaced at every occurrence, literally (a `$` in the value is no longer interpreted). `SubscriptionView` and `PaymentFailedBanner` take a `translations` prop. The "Active Entitlements" heading is the new `subscription.entitlements` key instead of inline text.

- feebf7f: `@just-apps/subscription`: the status, entitlement-source and plan values now live in one place. `SUBSCRIPTION_STATUSES`, `ENTITLEMENT_SOURCES` and `PLAN_IDS` (with `isSubscriptionStatus`, `isEntitlementSource`, `isPlanId`) are exported from the main entry and from `/core`, and `SubscriptionStatus`, `EntitlementSource` and `PlanId` are derived from them. Server code can validate a value against the same list the store uses.

  Breaking: `PricingView`, `UpgradeModal`, `TrialBanner` and `CheckoutActivation` are removed, together with the translation keys only they used (`pricing.*`, `upgrade.*`, `checkout.*`, `trial.start`, `badge.pro`, `badge.free`, `common.loading`, `subscription.expired`). No family app rendered them. `useCheckout` and `SubscriptionView` are unchanged.

  `@just-apps/auth`: the unused `common.loading` and `common.auth_processing` translation keys are removed, so they are no longer part of `TranslationKey`.

## 0.4.0

### Minor Changes

- f4a60bd: `TranslationKey` is now the union of each package's built-in keys instead of `string`, so a key that isn't in the package dictionary (e.g. `"login.titel"` in auth, `"pricing.titel"` in subscription) is a type error. `t()` still accepts any string and behaves the same at runtime.

  Code that used `TranslationKey` as "any string" needs `string` there instead: assigning an app's own key to it, `Partial<Record<TranslationKey, …>>` holding an app's own keys, or `Record<TranslationKey, …>`, which now requires every built-in key.

## 0.3.0

### Minor Changes

- d4194f1: Add two entries next to the UI components:

  - `@just-apps/subscription/core` — types + `PLAN_ENTITLEMENTS` / `PLAN_LABELS` without the `"use client"` banner, for route handlers and other server code.
  - `@just-apps/subscription/store` — `useSubscriptionStore` (Zustand over `just_entitlements` / `just_subscriptions`), `useSubscription`, `useEntitlement`, `useAllEntitlements`, `useCheckout`. Moved from just-apps-homepage. `zustand` ^5 and `@supabase/supabase-js` ^2 are optional peers, needed only for this entry.

  `useEntitlement` no longer loops forever on render: it used to return a fresh array from the Zustand selector, which zustand v5 treats as a changed snapshot every time.
