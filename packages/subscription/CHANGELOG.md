# @just-apps/subscription

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
