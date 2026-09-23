# client-server-entry-split

## The fact

An entry that holds React UI or hooks is built with the `"use client"` banner: auth's main entry, subscription's main entry, and `@just-apps/subscription/store`. An entry a server route imports — `@just-apps/auth/terms`, `@just-apps/subscription/core` — has no banner and must not import, even transitively, a module that reaches React or a component.

## Why it is cross-cutting

It is held jointly by three things that never call each other: the tsup config for each entry (the banner), the package `exports` map (which paths exist), and the source module graph behind each server-safe entry (`core.ts` and `content/terms/index.ts` import only types, constants and markdown). Breaking any one of them breaks the contract, and each lives in a different territory.

## Territories it holds in

- [build](../territory/build.md) — the per-config `banner`, and the `exports` map.
- [terms-content](../territory/terms-content.md) — `content/terms/index.ts` must stay free of UI imports.
- [plan-catalogue](../territory/plan-catalogue.md) — `core.ts` re-exports only types and constants.
- [entitlement-store](../territory/entitlement-store.md) — `store.ts` is a *client* entry; its hooks must not leak into `core`.

## What a violation looks like

A route handler imports a value and gets a client reference, or crashes at import, instead of the value — or a server-safe bundle gains the banner and the same happens everywhere it is imported. It only shows in a consumer's server build; this repo's `build` and `typecheck` both pass.

## Discovery history

- `02b6ad2` — terms content split into its own banner-free `terms` entry so server routes can import it (just-learn ADR-0008's consequence).
- `d4194f1` — the same split made for subscription: types and plan constants moved behind `/core`.

Two sites, the same reason, found one package at a time.

## Where it will recur

Any time a server route in a consumer wants something from this kit: if the thing lives in a banner entry, it needs a banner-free entry — and that entry's import graph must be checked, not just its config.
