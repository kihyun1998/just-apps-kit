# ui-primitives

## What it is

The small building blocks the screens are made of — button, spinner, class-name merger, modal, status badge — written in the shadcn/ui style (`cva` variants over Tailwind token classes). Each package carries its own copy.

## Governing decisions

**None.**

## Design model

- `Button`, `Spinner` and `cn` exist twice, once per package, identical today. The duplication is deliberate so each package installs alone (subscription README, "UI Primitives → Button").
- `Badge` variants are keyed by subscription status *and* entitlement source; an unknown variant falls back to `default`.
- `Modal` is hand-rolled — Escape to close, backdrop click, a Tab focus trap, body scroll lock — while `UserMenu` uses Radix. Two approaches to overlay primitives coexist.
- `Button` and `buttonVariants` are part of auth's public surface; subscription does not export its primitives.

## Code

- `packages/auth/src/ui/button.tsx` — `Button`, `ButtonProps`, `buttonVariants`
- `packages/subscription/src/ui/button.tsx` — `Button`, `ButtonProps`, `buttonVariants`
- `packages/auth/src/ui/spinner.tsx` — `Spinner`
- `packages/subscription/src/ui/spinner.tsx` — `Spinner`
- `packages/auth/src/lib/utils.ts` — `cn`
- `packages/subscription/src/lib/utils.ts` — `cn`
- `packages/subscription/src/ui/modal.tsx` — `Modal`
- `packages/subscription/src/ui/badge.tsx` — `Badge`, `BadgeVariant`

## Reference behaviour

**None.**

shadcn/ui is the reference, as an example rather than a spec (see `docs/agents/thegraph.md`); no primitive has been compared against it.

## Cross-cutting invariants

- [tailwind-scan-and-tokens](../invariant/tailwind-scan-and-tokens.md)
- [shared-tables-schema](../invariant/shared-tables-schema.md)

## Blast radius

- Every screen territory — [login](login.md), [terms-agreement-ui](terms-agreement-ui.md), [account-screens](account-screens.md), [pricing-ui](pricing-ui.md), [subscription-status-ui](subscription-status-ui.md), [checkout](checkout.md) — renders these.
- The twin copy in the other package — a change to one `Button`, `Spinner` or `cn` is either mirrored or recorded as a deliberate divergence.

## Known holes / open

- The subscription README calls deduplication "possible later"; nothing tracks it.
