# plan-catalogue

## What it is

What a user can buy and what each purchase unlocks: the plan ids, the map from plan to the app ids it entitles, and the display label per plan. Served from the server-safe entry `@just-apps/subscription/core` so that server code (the homepage's admin grant route) reads the same values as the UI.

## Governing decisions

**None.**

Adjacent: [SPEC_SUBSCRIPTION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) in just-apps-homepage (§2 product strategy, §4-2 constants) is the design this was built from. It is a spec, not a decision record, and it lives in a consumer's repository.

## Design model

- `PLAN_ENTITLEMENTS` maps a plan id to the app ids an active subscription entitles. An app id here needs a matching `app.<id>` label in the subscription translations, or the badge shows the raw id.
- `PLAN_LABELS` is `Partial<Record<PlanId, Record<Locale, string>>>`. It is partial so a plan can sit in `PLAN_IDS` before it is sold: just-apps-homepage's admin `GrantSubscriptionModal` builds its plan list from `Object.entries(PLAN_LABELS)`, and its grant route rejects a plan with no `PLAN_ENTITLEMENTS` entry (homepage `b39adfc`), so a label without entitlements would offer a plan that cannot be granted (maintainer, 2026-10-29).
- `BILLING_INTERVALS` (`monthly`, `yearly`) is the interval list checkout takes.
- Both maps are typed `Record<string, …>`, not `Record<PlanId, …>`, so a missing plan is not a type error.
- Server code reads them from `/core`: just-apps-homepage's admin grant routes, the Lemon Squeezy webhook and `src/lib/app-ids.ts`. Its admin modals, which are client components, import them from the main entry (homepage `b39adfc`, 2026-10-23). just-apps-homepage is the only consumer of `@just-apps/subscription`: `grep -l '"@just-apps/subscription"' ../*/package.json`.

## Code

- `packages/subscription/src/constants.ts` — `PLAN_ENTITLEMENTS`, `PLAN_LABELS`
- `packages/subscription/src/types.ts` — `PLAN_IDS`, `PlanId`, `isPlanId`
- `packages/subscription/src/core.ts` — `PLAN_ENTITLEMENTS`, `PLAN_LABELS`, `PlanId`, `BILLING_INTERVALS`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [shared-tables-schema](../invariant/shared-tables-schema.md)
- [client-server-entry-split](../invariant/client-server-entry-split.md)

## Blast radius

- [subscription-status-ui](subscription-status-ui.md) — shows `PLAN_LABELS[planId]`, or the plan id when it has no label.
- [entitlement-store](entitlement-store.md) — `isPlanId` drops any subscription whose plan is not in `PLAN_IDS`.
- [i18n](i18n.md) — one `app.<id>` key per entitled app id.
- [release](release.md) — the homepage's server grant route imports these values from `/core`; a change ships only when it bumps.

## Known holes / open

- **Ultimate is planned, not built.** `just_apps_ult` is in `PLAN_IDS` but has no `PLAN_LABELS` or `PLAN_ENTITLEMENTS` entry, and no Lemon Squeezy variant in just-apps-homepage's checkout route, which picks a Pro variant by interval alone (homepage `b39adfc`). `PLAN_ENTITLEMENTS` is still keyed by `string`. A first slice adds both entries here, then a variant per interval in the app's checkout route.
