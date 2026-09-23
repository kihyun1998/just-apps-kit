# build

## What it is

Turning each package's source into the `dist/` that npm ships: tsup builds one bundle per public entry (CJS, ESM and type declarations each), stamps `"use client"` on the entries that hold React UI, and inlines the terms markdown as strings.

## Governing decisions

**None.**

## Design model

- One tsup config per entry, all writing to the same `dist/` in parallel. Every config has `clean: false`; `dist/` is emptied once, beforehand, by the package's `clean` script. A config with `clean: true` deletes another config's freshly written declarations.
- The package `exports` map and the tsup entry list describe the same entries, and are kept in step by hand.
- The `"use client"` banner is per config.
- Declarations are emitted per entry (`dts: true`); `typecheck` is `tsc --noEmit` against `src/`.
- Class names reach `dist/` as plain string literals.
- The main entries (`src/index.ts`) are the public surface of each package's root import; the other entries are named in `tsup.config.ts`.

## Code

- `packages/auth/tsup.config.ts` — `defineConfig`, `terms`
- `packages/subscription/tsup.config.ts` — `defineConfig`, `core`, `store`
- `packages/auth/src/index.ts` — `LoginView`, `Button`, `cn`
- `packages/subscription/src/index.ts` — `PricingView`, `PLAN_ENTITLEMENTS`
- `packages/auth/package.json` — `exports`, `clean`
- `packages/subscription/package.json` — `exports`, `clean`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [client-server-entry-split](../invariant/client-server-entry-split.md)
- [peer-singletons](../invariant/peer-singletons.md)
- [tailwind-scan-and-tokens](../invariant/tailwind-scan-and-tokens.md)

## Blast radius

- [release](release.md) — what is built is what is published; CI runs only `build` and `typecheck`.
- [terms-content](terms-content.md) — depends on the `.md` text loader.
- [plan-catalogue](plan-catalogue.md), [entitlement-store](entitlement-store.md) — each is its own entry with its own banner decision.

## Known holes / open

- Nothing checks that `exports` and the tsup entries agree, or that a server-safe entry's output carries no banner.
