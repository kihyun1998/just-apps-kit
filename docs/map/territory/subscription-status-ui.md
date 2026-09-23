# subscription-status-ui

## What it is

Telling a user where their subscription stands and what they can do next: the subscription panel (one section per status, plus the list of active entitlements), the trial countdown banner, and the payment-failed banner.

## Governing decisions

**None.**

## Design model

- `SubscriptionView` branches on `subscription.status`: none, `active`, `canceled`, `past_due`, `paused`, `trialing`. `expired` renders no status section; the store never returns it.
- Every status section shows the literal "Pro", whatever `planId` is.
- Each entitlement renders as a `Badge` whose variant is the entitlement's `source`, and whose label is `app.<appId>` if that key exists, else the raw id.
- Trial days left are computed from `trialEndsAt` against the browser clock; `TrialBanner` takes `daysLeft` from the app instead.
- Loading and error states replace the whole panel.

## Code

- `packages/subscription/src/components/SubscriptionView.tsx` — `SubscriptionView`, `SubscriptionViewProps`, `appLabel`, `formatDate`, `TrialingSection`
- `packages/subscription/src/components/TrialBanner.tsx` — `TrialBanner`, `TrialBannerProps`
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
- [plan-catalogue](plan-catalogue.md) — plan identity ("Pro") and the `app.<id>` labels.
- [i18n](i18n.md) — `subscription.*`, `trial.*`, `payment_failed.*`, `app.*`; uses `{param}` substitution.

## Known holes / open

- No `translations` override prop.
- The "Active Entitlements" heading is an inline ternary, not a key.
