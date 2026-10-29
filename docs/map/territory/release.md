# release

## What it is

Getting a change from a merged PR to the apps that use it: Changesets records the bump in the PR, a workflow on `main` opens a "Version Packages" PR, merging that publishes to npm, and each consumer app then bumps its own dependency.

## Governing decisions

**None.**

## Design model

- CI on every PR and on `main`: install, `build`, `check:dist`, `typecheck`. There is no test step, and no tests exist.
- Publishing uses npm trusted publishing (OIDC), not a stored token. Each package's trusted publisher on npmjs.com names `kihyun1998` / `just-apps-kit` / `release.yml`; npm does not check the setting when it is saved, and renaming the workflow file breaks publishing until it is updated. The workflow needs `id-token: write`, Node 22.14+ and npm 11.5.1+ ([npm docs](https://docs.npmjs.com/trusted-publishers)), hence `npm install -g npm@11`.
- `changeset publish` runs `pnpm publish` in a pnpm repo (`getPublishTool`, `@changesets/cli` 2.31.1), and pnpm 10 uploads through the `npm` on `PATH` (pnpm/pnpm#9812, maintainer, 2025-07-30), so the npm version is what decides OIDC support.
- `changesets/action@v1` (v1.9.0) writes `NPM_TOKEN` into `~/.npmrc` whenever it is set, and npm then publishes with that token instead of OIDC. The env must not carry `NPM_TOKEN`.
- While a package is `0.x`, a minor bump may break and a `^0.x.y` range does not pick it up; consumers bump explicitly.
- Which app is on which version is read from the consumers, not recorded here:
  `grep -hE '"@just-apps/' ../*/package.json ../*/*/package.json`

## Code

- `.changeset/config.json` — `baseBranch`, `access`
- `.github/workflows/ci.yml` — `pnpm build`, `pnpm typecheck`
- `.github/workflows/release.yml` — `changesets/action`, `id-token: write`
- `package.json` — `release`, `version-packages`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [terms-version-family-wide](../invariant/terms-version-family-wide.md)

## Blast radius

- [build](build.md) — `release` runs the build and `check:dist` before `changeset publish`, so a failed check stops the publish.
- [terms-content](terms-content.md) — a terms revision is only live in an app once the Version Packages PR is merged and that app bumps.
- [plan-catalogue](plan-catalogue.md), [checkout](checkout.md) — changes whose other half sits in an app's server code.

## Known holes / open

- A merged changeset reaches npm only when someone merges the Version Packages PR, and the Release run after that merge publishes. `main` is at `@just-apps/auth` 0.8.0 and `@just-apps/subscription` 0.5.0 (#16, merged 2026-10-29), but npm still serves 0.7.0 and 0.4.0: that run was refused with `E404` on every `PUT`, using an `NPM_TOKEN` set 2026-09-23. Re-running Release once trusted publishing is configured publishes both, because `changeset publish` publishes any version npm lacks. Publishing through OIDC with pnpm 10 has not yet been seen to succeed here.
