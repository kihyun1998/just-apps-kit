# checkout

## What it is

Taking a user from "subscribe" to an active subscription: asking the app's backend for a Lemon Squeezy checkout URL, opening Lemon Squeezy's overlay, and then polling the app's backend until the webhook has recorded the subscription. `CheckoutActivation` is the standalone "activating…" screen for the return leg of a redirect checkout.

## Governing decisions

**None.**

Adjacent: [SPEC_SUBSCRIPTION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) in just-apps-homepage (§5-3 API routes, §5-4 post-checkout delay UX) is the design, not a decision record.

## Design model

- App contract, from the hook's defaults: `POST checkoutApiUrl` with `{ interval }` returns `{ url }`; `GET statusApiUrl` returns `{ hasActiveSubscription }`. The plan id is not sent.
- The URL is accepted only over `https:` on a host ending in `.lemonsqueezy.com`.
- `lemon.js` is injected once; a second caller waits for the same script tag.
- Polling starts on the overlay's `Checkout.Success` event, or immediately when the overlay API is missing and the URL opened in a new tab instead.
- Two independent pollers with the same 30 s / 2 s defaults: `useCheckout` stops after 5 consecutive failures; `CheckoutActivation` ignores failures and polls an injected `onPoll` until timeout.
- On success neither one refreshes the store; the app does that in `onSuccess`.
- Callback props (`onPoll`, `onSuccess`, `onTimeout`) are read through refs, so a caller passing a fresh function every render does not restart polling. `AuthCallbackView` does the same with `onRoute` ([login](login.md)).

## Code

- `packages/subscription/src/hooks/use-checkout.ts` — `useCheckout`, `loadLemonScript`, `validateCheckoutUrl`, `setupLemonEventHandler`, `openCheckoutOverlay`, `ALLOWED_CHECKOUT_HOST_SUFFIX`, `MAX_CONSECUTIVE_POLL_FAILURES`
- `packages/subscription/src/components/CheckoutActivation.tsx` — `CheckoutActivation`, `CheckoutActivationProps`

## Reference behaviour

**None.**

Lemon Squeezy's Lemon.js is the binding reference (see `docs/agents/thegraph.md`); the overlay calls (`Setup`, `Url.Open`, `createLemonSqueezy`, the `Checkout.Success` event) have never been checked against it.

## Cross-cutting invariants

- [props-only-di](../invariant/props-only-di.md)
- [tailwind-scan-and-tokens](../invariant/tailwind-scan-and-tokens.md)

## Blast radius

- [entitlement-store](entitlement-store.md) — ships in the same `/store` entry; activation shows up in the UI only after the app calls `refetch`.
- [pricing-ui](pricing-ui.md) — the caller of `startCheckout`.
- [release](release.md) — the endpoint contract lives in each app; changing a request or response shape is a coordinated change across consumers.
- [i18n](i18n.md) — `checkout.*` keys.

## Known holes / open

- `useCheckout` reports its failures in English, not through `t()`.
