# shared-tables-schema

## The fact

The columns and enum values of the family's shared `just_subscriptions` and `just_entitlements` tables are restated in this repo at five sites, and every site must admit the same values: the type unions in `types.ts`, the store's `VALID_SOURCES` / `VALID_STATUSES` / `VALID_PLANS`, the store's select column lists and status filter, the status branches of `SubscriptionView`, and the variant keys of `Badge`. The schema itself is owned outside this repo (just-apps-homepage's Supabase migrations; [SPEC_SUBSCRIPTION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) §3), and rows are written by each app's webhook and admin routes.

## Why it is cross-cutting

The five sites share one storage assumption and almost no calls: `Badge` knows nothing of the store, and the store knows nothing of `SubscriptionView`'s branches. No territory-to-territory edge would carry "these lists must agree".

## Territories it holds in

- [entitlement-store](../territory/entitlement-store.md) — `VALID_*` lists, column lists, the status filter.
- [plan-catalogue](../territory/plan-catalogue.md) — `PlanId`.
- [subscription-status-ui](../territory/subscription-status-ui.md) — one branch per status.
- [ui-primitives](../territory/ui-primitives.md) — `Badge` variant keys per status and per source.

## What a violation looks like

A new status, source or plan written by a webhook is dropped by a `VALID_*` filter, and the user appears to have no subscription or entitlement — no error anywhere. Or the store admits it and the UI renders nothing for it (`expired` today is filtered before the UI, so the missing branch is unreachable).

## Discovery history

No rediscovery recorded. Promoted while building the map because it holds at five sites across four territories with no call between them.

## Where it will recur

Any change to a status, source or plan value, here or in a migration: grep all five sites.
`grep -rnE "trialing|past_due|just_apps_(pro|ult)|\"promo\"" packages/subscription/src`
