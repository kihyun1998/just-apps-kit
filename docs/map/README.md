# Map — just-apps-kit

A dependency graph of what this kit does, for the two questions a change has to answer first:

1. **If I touch this, what else moves?** Open the territory you are changing and work through its `## Blast radius` as a checklist, then every note under its `## Cross-cutting invariants`.
2. **What is this derived from?** Read the territory's `## Governing decisions` (why) and `## Design model` (the rules). An empty section with `**None.**` is the answer: nothing governs it, and the code is the only source.

## Reading protocol

- **Before** designing a change: open the territory (or territories) it lands in. Write down, from the map alone, which territories you expect to touch.
- **After** the change: compare what you actually touched. A territory you touched but did not predict is a missing blast edge — add it. Then ask of whatever the change revealed: *does this hold at any other site that shares the same table, entry, token or dependency?* If yes, it is an invariant note before the change lands.
- Any change under `packages/*/src` reaches users only through [release](territory/release.md); it is not listed in every territory's blast radius because it is in all of them.
- Run `node scripts/check-map.mjs` after editing any note.

## Why this exists

Most facts in this kit hold in several places that never call each other, and they have been found one site at a time:

- The client/server entry split was made for auth's terms content (`02b6ad2`) and then made again, separately, for subscription's constants (`d4194f1`) — [client-server-entry-split](invariant/client-server-entry-split.md).
- The rule that terms have one version family-wide is recorded in a consumer's ADR, not here; building this map found a consumer that broke it (fixed in roster-ai#201) — [terms-version-family-wide](invariant/terms-version-family-wide.md).

## Measured when the map was built (2026-09-23)

- **70 public exports across 5 entries; 3 have a governing decision record** (the `terms` entry, governed by just-learn ADR-0008). This repo has no decision records of its own.
- 8 decision records in consumer repositories mention the kit; 1 is about it.
- No oversized file: the largest source file is 272 lines. The two package READMEs (~590 lines each) are the effective spec.
- 1 open issue (#1). No automated tests; CI runs `build` and `typecheck` only.

## Conventions

- Territories overlap. A fact that holds in several is an invariant note, not a copy in each.
- Empty sections stay, with `**None.**`. Every query for it names its heading, because the same sentinel marks different holes.
- `## Code` names symbols by file, never line numbers.
- Links are plain relative markdown so the map reads the same in Obsidian and on GitHub.

## What the map cannot answer

- Issues, commits and source files are not nodes; they appear as text inside notes.
- Consumer apps are not mapped. The kit's other half — webhooks, admin routes, the `user_agreements` write, the table migrations — lives in their repositories, and this map can only point at it.
- There is no verified external-fact store in this repo, so every `## Reference behaviour` is `**None.**`. `docs/agents/thegraph.md` names which references apply.

## Coverage

Complete for this repository: every public entry and every file under `packages/*/src` belongs to at least one territory. A new territory is owed when a new public entry or a new package lands; a change inside an existing territory updates that note instead.

```sh
ls docs/map/territory docs/map/invariant                                     # what exists
grep -lzE '## Governing decisions\s+\*\*None\.\*\*' docs/map/territory/*.md   # nobody decided
grep -lzE '## Reference behaviour\s+\*\*None\.\*\*' docs/map/territory/*.md   # nobody checked
grep -lzE '## Code\s+\*\*None\.\*\*' docs/map/territory/*.md                  # nobody built it
```

## Nodes

Territories: [login](territory/login.md) · [terms-agreement-ui](territory/terms-agreement-ui.md) · [terms-content](territory/terms-content.md) · [account-screens](territory/account-screens.md) · [plan-catalogue](territory/plan-catalogue.md) · [pricing-ui](territory/pricing-ui.md) · [subscription-status-ui](territory/subscription-status-ui.md) · [checkout](territory/checkout.md) · [entitlement-store](territory/entitlement-store.md) · [i18n](territory/i18n.md) · [ui-primitives](territory/ui-primitives.md) · [build](territory/build.md) · [release](territory/release.md)

Invariants: [client-server-entry-split](invariant/client-server-entry-split.md) · [props-only-di](invariant/props-only-di.md) · [peer-singletons](invariant/peer-singletons.md) · [shared-tables-schema](invariant/shared-tables-schema.md) · [terms-version-family-wide](invariant/terms-version-family-wide.md) · [tailwind-scan-and-tokens](invariant/tailwind-scan-and-tokens.md)

<!-- grill-map build stamp: eb0cd67 -->
