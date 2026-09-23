# entitlement-store

## What it is

The client-side answer to "what may this user use?": one Zustand store that reads the user's rows from the family's shared `just_entitlements` and `just_subscriptions` tables through a Supabase client the app hands it, and the hooks components read it through. Shipped as `@just-apps/subscription/store`.

## Governing decisions

**None.**

Adjacent: [SPEC_SUBSCRIPTION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) in just-apps-homepage (§3 schema, §3-5 RLS, §4-3 hooks) is the design this was moved from, not a decision record.

## Design model

- `init(supabase)` runs once per store lifetime. Only a failed `getSession` resets `initialized` so the next `init` retries; a failed table query sets `error`, leaves `initialized` true, and is retried only by an explicit `refetch`.
- `refetch` does nothing without a session. With one, it reads both tables in parallel and relies on RLS to scope rows to the user.
- Entitlements: rows whose `expires_at` is null or later than the browser's clock.
- Subscription: the newest row by `created_at` whose status is one of `active`, `trialing`, `past_due`, `paused`, `canceled`.
- Any row whose source, status or plan is outside the `VALID_*` lists is dropped silently: an unknown value looks the same as no row.
- `clear()` resets everything, including `_supabase`, so the next sign-in has to call `init` again.
- Hooks select the stored array and filter outside the selector. A selector returning a fresh array loops forever under zustand v5.
- `useEntitlement` reports `hasPro: false` while the store holds an error.

## Code

- `packages/subscription/src/store/useSubscriptionStore.ts` — `useSubscriptionStore`, `VALID_SOURCES`, `VALID_STATUSES`, `VALID_PLANS`
- `packages/subscription/src/hooks/use-entitlement.ts` — `useEntitlement`
- `packages/subscription/src/hooks/use-all-entitlements.ts` — `useAllEntitlements`
- `packages/subscription/src/hooks/use-subscription.ts` — `useSubscription`
- `packages/subscription/src/types.ts` — `Subscription`, `Entitlement`, `SubscriptionStatus`, `EntitlementSource`
- `packages/subscription/src/store.ts` — `useSubscriptionStore`, `useCheckout`

## Reference behaviour

**None.**

supabase-js v2 is the binding reference (see `docs/agents/thegraph.md`); the query builder calls here have never been checked against it.

## Cross-cutting invariants

- [shared-tables-schema](../invariant/shared-tables-schema.md)
- [peer-singletons](../invariant/peer-singletons.md)
- [client-server-entry-split](../invariant/client-server-entry-split.md)
- [props-only-di](../invariant/props-only-di.md)

## Blast radius

- [subscription-status-ui](subscription-status-ui.md) — renders what the store produces.
- [plan-catalogue](plan-catalogue.md) — `VALID_PLANS` duplicates `PlanId`.
- [checkout](checkout.md) — same entry; activation depends on the app calling `refetch`.
- [build](build.md) — `zustand` and `@supabase/supabase-js` must stay external in the `store` config.

## Known holes / open

- `clear()` logs `[sub] clear` and `refetch` logs errors to the console in consumers' production builds.
