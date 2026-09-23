# peer-singletons

## The fact

A library whose *instance* matters — `react`, `react-dom`, `zustand`, `@supabase/supabase-js`, and the context-carrying UI libraries (`radix-ui`, `boring-avatars`) — is a `peerDependency` and is not bundled, so an app that uses the kit still holds exactly one instance of it.

## Why it is cross-cutting

It is held by the `peerDependencies` block of each `package.json` and by what tsup leaves external, and it matters at whichever territory creates or reads shared state through that library — which are not the files that declare it.

## Territories it holds in

- [build](../territory/build.md) — the `external` lists and `peerDependencies`.
- [entitlement-store](../territory/entitlement-store.md) — a bundled `zustand` would give the app a second store; a bundled Supabase client breaks the session singleton.
- [account-screens](../territory/account-screens.md) — `UserMenu` builds on Radix; a second Radix copy splits its context.

## What a violation looks like

Two copies in the app: a store whose state the app's own code never sees, an "Invalid hook call" from a duplicated React, or two Supabase clients disagreeing about the session.

## Discovery history

- The Supabase-client rollback (auth README, FAQ: "Can the package hold the Supabase client?") names the duplicate instance and the broken session singleton as the cause.
- `d4194f1` — the `store` tsup config leaves `zustand` and `@supabase/supabase-js` external, with the reason in a comment.

## Where it will recur

Any new dependency that holds module-level state, a React context, or a client: it goes in `peerDependencies` (optional if only one entry needs it), never `dependencies`.
