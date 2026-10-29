# checkout

## What it is

Taking a user from "subscribe" to an active subscription: asking the app's backend for a Lemon Squeezy checkout URL, opening Lemon Squeezy's overlay, and then polling the app's backend until the webhook has recorded the subscription.

## Governing decisions

**None.**

Adjacent: [SPEC_SUBSCRIPTION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) in just-apps-homepage (§5-3 API routes, §5-4 post-checkout delay UX) is the design, not a decision record.

## Design model

- App contract, from the hook's defaults: `POST checkoutApiUrl` with `{ interval }` returns `{ url }`; `GET statusApiUrl` returns `{ hasActiveSubscription }`. The plan id is not sent.
- The URL is accepted only over `https:` on a host ending in `.lemonsqueezy.com`.
- `lemon.js` is injected once; a second caller waits for the same script tag.
- Polling starts on the overlay's `Checkout.Success` event, or immediately when the overlay API is missing and the URL opened in a new tab instead.
- Polling runs every 2 s for at most 30 s by default, and stops after 5 consecutive failures.
- On success it does not refresh the store; the app does that in `onSuccess`.
- just-apps-homepage's status route counts only `active` and `trialing` as `hasActiveSubscription`, and rate-limits to 5 calls per 10 s, sized for a 2 s poll (`src/app/api/subscription/status/route.ts`, homepage `b39adfc`, 2026-10-23). An `intervalMs` under 2 s runs into that limit; `useCheckout` counts each refused poll as a failure.
- `onSuccess` and `onTimeout` are read through refs, so a caller passing a fresh function every render does not restart polling. `AuthCallbackView` does the same with `onRoute` ([login](login.md)).

## Code

- `packages/subscription/src/hooks/use-checkout.ts` — `useCheckout`, `loadLemonScript`, `validateCheckoutUrl`, `setupLemonEventHandler`, `openCheckoutOverlay`, `ALLOWED_CHECKOUT_HOST_SUFFIX`, `MAX_CONSECUTIVE_POLL_FAILURES`

## Reference behaviour

**None.**

Lemon Squeezy's Lemon.js is the binding reference (see `docs/agents/thegraph.md`); the overlay calls (`Setup`, `Url.Open`, `createLemonSqueezy`, the `Checkout.Success` event) have never been checked against it.

## Cross-cutting invariants

- [props-only-di](../invariant/props-only-di.md)

## Blast radius

- [entitlement-store](entitlement-store.md) — ships in the same `/store` entry; activation shows up in the UI only after the app calls `refetch`.
- [release](release.md) — the endpoint contract lives in each app; changing a request or response shape is a coordinated change across consumers.

## Known holes / open

- `useCheckout` reports its failures in English, not through `t()`.
- The overlay handler listens for `Checkout.Success` only (`setupLemonEventHandler`). A user who closes the overlay without paying leaves `status` at `"overlay"` until the caller runs `reset`.
- `startCheckout` takes only the billing interval; the plan id is never sent. A second paid plan needs it (see [plan-catalogue](plan-catalogue.md)).
