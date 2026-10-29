# subscription-status-ui

## What it is

Telling a user where their subscription stands and what they can do next: the subscription panel (one section per status, plus the list of active entitlements), the trial countdown banner, and the payment-failed banner.

## Governing decisions

**None.**

## Design model

- `StatusSection` switches on `subscription.status` over every `SubscriptionStatus`; the `never` default makes an unhandled status a compile error. `expired` renders no status section; the store never returns it.
- Every status section opens with `StatusHeader`, which shows `PLAN_LABELS[planId][locale]`, or the plan id when the plan has no label, and the status's `subscription.<status>` badge.
- Each entitlement renders as a `Badge` whose variant is the entitlement's `source`, and whose label is `app.<appId>` if that key exists, else the raw id.
- Trial days left are computed from `trialEndsAt` against the browser clock.
- Loading and error states replace the whole panel.
- just-apps-homepage fills `entitlements` from `useAllEntitlements` and starts the store with `appIds: JUST_APPS_APP_IDS`, so only Just Apps' own grants appear as badges (homepage `6f85251`, 2026-10-29; homepage#84, [entitlement-store](entitlement-store.md)).

## Code

- `packages/subscription/src/components/SubscriptionView.tsx` — `SubscriptionView`, `SubscriptionViewProps`, `appLabel`, `formatDate`, `StatusSection`, `StatusHeader`, `TrialingSection`
- `packages/subscription/src/components/PaymentFailedBanner.tsx` — `PaymentFailedBanner`, `PaymentFailedBannerProps`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [shared-tables-schema](../invariant/shared-tables-schema.md)
- [props-only-di](../invariant/props-only-di.md)
- [tailwind-scan-and-tokens](../invariant/tailwind-scan-and-tokens.md)

## Blast radius

- [entitlement-store](entitlement-store.md) — the shapes rendered here are what the store produces; its status filter decides which branches are reachable.
- [ui-primitives](ui-primitives.md) — `Badge` variant keys must cover every status and source rendered.
- [plan-catalogue](plan-catalogue.md) — plan labels and the `app.<id>` labels.
- [i18n](i18n.md) — `subscription.*`, `trial.*`, `payment_failed.*`, `app.*`; uses `{param}` substitution.

## Known holes / open

**None.**
