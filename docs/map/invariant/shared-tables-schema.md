# shared-tables-schema

## The fact

The columns and enum values of the family's shared `just_subscriptions` and `just_entitlements` tables must agree wherever they are read or written. In this repo the values have one source, `SUBSCRIPTION_STATUSES`, `ENTITLEMENT_SOURCES` and `PLAN_IDS` in `types.ts`: the types derive from them, the store reads rows through their `is*` guards and builds its status filter from `SUBSCRIPTION_STATUSES`, `Badge`'s variant maps are typed by them, and `SubscriptionView`'s `StatusSection` switch fails to compile if a status is unhandled. What still agrees only by hand is the store's select column lists, the schema, and the consumers' own copies of the value lists. The schema itself is owned outside this repo (just-apps-homepage's Supabase migrations; [SPEC_SUBSCRIPTION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) §3), and rows are written by each app's webhook and admin routes.

## Why it is cross-cutting

The five sites share one storage assumption and almost no calls: `Badge` knows nothing of the store, and the store knows nothing of `SubscriptionView`'s branches. No territory-to-territory edge would carry "these lists must agree".

## Territories it holds in

- [entitlement-store](../territory/entitlement-store.md) — the `is*` guards, column lists, the status filter.
- [plan-catalogue](../territory/plan-catalogue.md) — `PlanId`.
- [subscription-status-ui](../territory/subscription-status-ui.md) — one branch per status.
- [ui-primitives](../territory/ui-primitives.md) — `Badge` variant keys per status and per source.

Outside this repo, the same values are written or restated by just-apps-homepage's admin routes and Lemon Squeezy webhook, and by roster-ai's `src/app/api/admin/grant/route.ts`; homepage's status route has its own active set, `active` or `trialing` (homepage `b39adfc`, roster-ai `d3d7670`). `git -C ../<app> grep -n just_entitlements` finds them.

## What a violation looks like

A new status, source or plan written by a webhook and missing from the lists in `types.ts` is dropped by the store's guards, and the user appears to have no subscription or entitlement — no error anywhere. Adding it to the list makes `tsc` point at `Badge` and `SubscriptionView`; nothing points at the consumers' copies.

## Discovery history

Promoted while building the map (2026-09-23), when the values were restated at five sites in this repo. The in-repo copies were folded into `types.ts` on branch `refactor/subscription-value-lists` (2026-10-29); the fact stays an invariant because the schema and the consumers' copies still sit outside that source.

## Where it will recur

Any change to a status, source or plan value, here or in a migration: change the list in `types.ts`, run `pnpm typecheck`, then find the copies outside this repo with `git -C ../<app> grep -nE 'trialing|past_due|just_apps_(pro|ult)|"promo"'`.
