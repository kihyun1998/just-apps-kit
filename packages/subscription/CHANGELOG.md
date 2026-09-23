# @just-apps/subscription

## 0.3.0

### Minor Changes

- d4194f1: Add two entries next to the UI components:

  - `@just-apps/subscription/core` — types + `PLAN_ENTITLEMENTS` / `PLAN_LABELS` without the `"use client"` banner, for route handlers and other server code.
  - `@just-apps/subscription/store` — `useSubscriptionStore` (Zustand over `just_entitlements` / `just_subscriptions`), `useSubscription`, `useEntitlement`, `useAllEntitlements`, `useCheckout`. Moved from just-apps-homepage. `zustand` ^5 and `@supabase/supabase-js` ^2 are optional peers, needed only for this entry.

  `useEntitlement` no longer loops forever on render: it used to return a fresh array from the Zustand selector, which zustand v5 treats as a changed snapshot every time.
