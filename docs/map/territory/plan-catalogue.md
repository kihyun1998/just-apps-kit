# plan-catalogue

## What it is

What a user can buy and what each purchase unlocks: the plan ids, the map from plan to the app ids it entitles, and the display label per plan. Served from the server-safe entry `@just-apps/subscription/core` so that server code (the homepage's admin grant route) reads the same values as the UI.

## Governing decisions

**None.**

Adjacent: [SPEC_SUBSCRIPTION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) in just-apps-homepage (§2 product strategy, §4-2 constants) is the design this was built from. It is a spec, not a decision record, and it lives in a consumer's repository.

## Design model

- `PLAN_ENTITLEMENTS` maps a plan id to the app ids an active subscription entitles. An app id here needs a matching `app.<id>` label in the subscription translations, or the badge shows the raw id.
- `PLAN_LABELS` is keyed by plan id with `ko` / `en` fields — not by `Locale`.
- Both maps are typed `Record<string, …>`, not `Record<PlanId, …>`, so a missing plan is not a type error.

## Code

- `packages/subscription/src/constants.ts` — `PLAN_ENTITLEMENTS`, `PLAN_LABELS`
- `packages/subscription/src/types.ts` — `PlanId`
- `packages/subscription/src/core.ts` — `PLAN_ENTITLEMENTS`, `PLAN_LABELS`, `PlanId`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [shared-tables-schema](../invariant/shared-tables-schema.md)
- [client-server-entry-split](../invariant/client-server-entry-split.md)

## Blast radius

- [pricing-ui](pricing-ui.md) — `PricingView` reads `PLAN_ENTITLEMENTS.just_apps_pro` for its app count and hardcodes the `just_apps_pro` card.
- [subscription-status-ui](subscription-status-ui.md) — renders the literal "Pro" for every subscription, whatever its plan.
- [entitlement-store](entitlement-store.md) — `VALID_PLANS` drops any subscription whose plan is not listed there.
- [i18n](i18n.md) — one `app.<id>` key per entitled app id.
- [release](release.md) — the homepage's server grant route imports these values from `/core`; a change ships only when it bumps.

## Known holes / open

- **Ultimate is planned, not built.** `just_apps_ult` is in `PlanId` and in the store's `VALID_PLANS`, but it is commented out of `PLAN_LABELS`, absent from `PLAN_ENTITLEMENTS`, and has no card in `PricingView`. A first slice starts at `constants.ts` and then follows every edge above.
