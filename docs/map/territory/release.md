# release

## What it is

Getting a change from a merged PR to the apps that use it: Changesets records the bump in the PR, a workflow on `main` opens a "Version Packages" PR, merging that publishes to npm, and each consumer app then bumps its own dependency.

## Governing decisions

**None.**

## Design model

- CI on every PR and on `main`: install, `build`, `typecheck`. There is no test step, and no tests exist.
- Publishing needs the `NPM_TOKEN` repository secret.
- While a package is `0.x`, a minor bump may break and a `^0.x.y` range does not pick it up; consumers bump explicitly.
- Which app is on which version is read from the consumers, not recorded here:
  `grep -hE '"@just-apps/' ../*/package.json ../*/*/package.json`

## Code

- `.changeset/config.json` — `baseBranch`, `access`
- `.github/workflows/ci.yml` — `pnpm build`, `pnpm typecheck`
- `.github/workflows/release.yml` — `changesets/action`, `NPM_TOKEN`
- `package.json` — `release`, `version-packages`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [terms-version-family-wide](../invariant/terms-version-family-wide.md)

## Blast radius

- [build](build.md) — `release` runs the build before `changeset publish`.
- [terms-content](terms-content.md) — a terms revision is only live in an app once that app bumps.
- [plan-catalogue](plan-catalogue.md), [checkout](checkout.md) — changes whose other half sits in an app's server code.

## Known holes / open

- `packages/auth` has no `CHANGELOG.md` yet; its history before Changesets is in git only.
