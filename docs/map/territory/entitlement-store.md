# entitlement-store

## What it is

The client-side answer to "what may this user use?": one Zustand store that reads the user's rows from the family's shared `just_entitlements` and `just_subscriptions` tables through a Supabase client the app hands it, and the hooks components read it through. Shipped as `@just-apps/subscription/store`.

## Governing decisions

**None.**

Adjacent: [SPEC_SUBSCRIPTION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) in just-apps-homepage (§3 schema, §3-5 RLS, §4-3 hooks) is the design this was moved from, not a decision record.

## Design model

- `init(supabase, { appIds })` keeps the client and scope in module variables, not in state, and runs `refetch`. A second `init` with the same client and the same `appIds` does nothing; a different client or scope reloads, so a scope passed late is not lost. Any failed load — session check or table query — resets `initialized`, so the next `init` retries.
- `refetch` checks the session inside its own `try`: no session settles `isLoading` to `false`, and a thrown check lands in `error` rather than rejecting the caller's promise.
- `refetch` does nothing without a session. With one, it reads both tables in parallel and relies on RLS to scope rows to the user.
- Entitlements: rows whose `expires_at` is null or later than the browser's clock. With `appIds` the query adds `.in("app_id", appIds)`. Without it RLS on `user_id` is the only scope, so the list holds every family app's rows for the user; that default keeps consumers that pass no scope unchanged (#17). The scope is policy the app owns: just-apps-homepage would derive its ids from `PLAN_ENTITLEMENTS`. `useEntitlement(appId)` also filters client-side.
- Subscription: the newest row by `created_at` whose status is one of `active`, `trialing`, `past_due`, `paused`, `canceled`.
- Any row whose source, status or plan fails its `is*` guard from `types.ts` is dropped silently: an unknown value looks the same as no row. The status filter is `SUBSCRIPTION_STATUSES` without `expired`.
- `clear()` resets the state, the client and the scope, so the next sign-in has to call `init` again.
- Hooks select the stored array and filter outside the selector. A selector returning a fresh array loops forever under zustand v5 (moved here from a source comment, commit `524ad01`, 2026-09-23).
- `useEntitlement` reports `hasPro: false` while the store holds an error.

## Code

- `packages/subscription/src/store/useSubscriptionStore.ts` — `useSubscriptionStore`, `SubscriptionStoreOptions`, `LISTED_STATUSES`, `sameIds`
- `packages/subscription/src/hooks/use-entitlement.ts` — `useEntitlement`
- `packages/subscription/src/hooks/use-all-entitlements.ts` — `useAllEntitlements`
- `packages/subscription/src/hooks/use-subscription.ts` — `useSubscription`
- `packages/subscription/src/types.ts` — `Subscription`, `Entitlement`, `SUBSCRIPTION_STATUSES`, `ENTITLEMENT_SOURCES`, `isSubscriptionStatus`, `isEntitlementSource`, `isPlanId`
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
- [plan-catalogue](plan-catalogue.md) — a subscription whose plan is not in `PLAN_IDS` is dropped.
- [checkout](checkout.md) — same entry; activation depends on the app calling `refetch`.
- [build](build.md) — `zustand` and `@supabase/supabase-js` must stay external in the `store` config.

## Known holes / open

- `refetch` logs errors to the console in consumers' production builds.
