# props-only-di

## The fact

A component receives all data and every side effect through props; the package never creates a Supabase client, never imports `next/*`, and never routes. Where a side effect must run inside the package, it is injected: a callback prop (`onPoll`, `onRoute`, `onSubmit`) or, for the store, a client handed to `init()`.

## Why it is cross-cutting

Every consumer differs in exactly the things this rules out — Next.js or Tauri/Vite, its own Supabase client and cookie adapter, its own router, its own `user_agreements` handling. It holds at every screen and at the store, and those sites do not call each other: nothing about one component stops another from importing `next/navigation`.

## Territories it holds in

- [login](../territory/login.md) — sign-in and callback routing are the app's.
- [terms-agreement-ui](../territory/terms-agreement-ui.md) — persistence is `onSubmit`'s.
- [account-screens](../territory/account-screens.md) — sign-out, delete and navigation are callbacks.
- [pricing-ui](../territory/pricing-ui.md) — plan selection is a callback.
- [subscription-status-ui](../territory/subscription-status-ui.md) — cancel, resubscribe, billing are callbacks.
- [checkout](../territory/checkout.md) — `CheckoutActivation` polls an injected `onPoll`; `useCheckout` calls app-owned endpoints by URL option.
- [entitlement-store](../territory/entitlement-store.md) — the deliberate exception: it queries, but only through the client the app passes to `init()`.

## What a violation looks like

A component works in the app it was written for and breaks in another: a `next/*` import fails under Vite, or a second Supabase client appears and sessions stop agreeing (see [peer-singletons](peer-singletons.md)).

## Discovery history

- An earlier attempt to put the Supabase client in the package was rolled back entirely (auth README, FAQ: "Can the package hold the Supabase client?", citing homepage commit `9c1f98e`).
- The package-migration plan lists what may not move into a package ([ROADMAP_PACKAGE_MIGRATION.md](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/ROADMAP_PACKAGE_MIGRATION.md), §1 and §4).

## Where it will recur

Any new import in `packages/*/src` of `next/`, of a value (not a type) from `@supabase/supabase-js`, or of an app path. Check with:
`grep -rnE "from \"next/|import \{[^}]*\} from \"@supabase/supabase-js\"" packages/*/src`
