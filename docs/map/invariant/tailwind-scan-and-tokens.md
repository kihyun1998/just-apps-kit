# tailwind-scan-and-tokens

## The fact

Every class name in a component must (1) appear in `dist/` as a complete string literal, so a consumer's Tailwind `@source` / `content` scan of the package finds it, and (2) use only design tokens and utilities the consumer's CSS defines. The token list is in each package README ("Required Tailwind tokens"; subscription adds `--brand`).

## Why it is cross-cutting

Styling is resolved in the consumer's build, not here. It holds at every component in every territory that renders, and at the build that must keep the literals intact; none of those sites calls another.

## Territories it holds in

- [login](../territory/login.md)
- [terms-agreement-ui](../territory/terms-agreement-ui.md)
- [account-screens](../territory/account-screens.md) — `UserMenu` uses `animate-in` / `fade-in-0` / `zoom-in-95` utilities.
- [pricing-ui](../territory/pricing-ui.md)
- [subscription-status-ui](../territory/subscription-status-ui.md)
- [checkout](../territory/checkout.md) — `CheckoutActivation`.
- [ui-primitives](../territory/ui-primitives.md) — `Modal` uses `animate-fade-in` / `animate-fade-in-up`.
- [build](../territory/build.md) — the literals must survive bundling.

## What a violation looks like

The component renders but looks broken — padding, backgrounds and borders silently missing. The auth README's tell: the "Agree to all" row loses its rounded accent background and the divider under it. A class built by string interpolation (`bg-${x}`) fails the same way, and only in the consumer.

## Discovery history

- Both READMEs carry the `@source` step marked mandatory, with a symptom to recognise it by. No incident behind it is recorded.

## Where it will recur

Any new class using a token or utility not on a README's list — including the animation utilities above, which no README lists — and any class name assembled at runtime.
