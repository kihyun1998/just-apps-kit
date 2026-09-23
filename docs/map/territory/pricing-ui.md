# pricing-ui

## What it is

Persuading a user to subscribe: the pricing page with a free and a Pro card and a monthly/yearly toggle, and the upgrade modal shown when a user reaches a Pro-only feature.

## Governing decisions

**None.**

## Design model

- `PricingView` renders exactly two cards: free, and `just_apps_pro`. The plan id handed to `onSelectPlan` is always `just_apps_pro`.
- No Pro price is rendered anywhere. The free card shows `₩0` or `$0`, chosen by locale, not by currency.
- Feature bullets default to built-in per-locale lists; `freeFeatures` / `proFeatures` replace them.
- The billing interval is internal UI state, handed out with the selection.
- `UpgradeModal` is presentational; `feature` swaps the description for one naming that feature.

## Code

- `packages/subscription/src/components/PricingView.tsx` — `PricingView`, `PricingViewProps`, `DEFAULT_FREE_FEATURES`, `DEFAULT_PRO_FEATURES`
- `packages/subscription/src/components/UpgradeModal.tsx` — `UpgradeModal`, `UpgradeModalProps`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [props-only-di](../invariant/props-only-di.md)
- [tailwind-scan-and-tokens](../invariant/tailwind-scan-and-tokens.md)

## Blast radius

- [plan-catalogue](plan-catalogue.md) — the plan ids and app counts shown.
- [checkout](checkout.md) — the README wires `onSelectPlan` to `startCheckout(interval)`, which drops the plan id; a second paid plan breaks that wiring.
- [ui-primitives](ui-primitives.md) — `Badge`, `Button`, `Spinner`, `Modal`.
- [i18n](i18n.md) — `pricing.*`, `upgrade.*` keys. Some strings (interval aria-label, the app-count line) are inline ternaries, not keys.

## Known holes / open

- No `translations` override prop.
