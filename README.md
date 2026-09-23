# just-apps-kit

Shared packages for the Just Apps family.

| Package | npm | Description |
|---|---|---|
| [`@just-apps/auth`](packages/auth) | [![npm](https://img.shields.io/npm/v/@just-apps/auth)](https://www.npmjs.com/package/@just-apps/auth) | Auth UI (login, terms agreement, my page, user menu, account delete) + shared terms content (`@just-apps/auth/terms`) |
| [`@just-apps/subscription`](packages/subscription) | [![npm](https://img.shields.io/npm/v/@just-apps/subscription)](https://www.npmjs.com/package/@just-apps/subscription) | Subscription UI (pricing, status, upgrade modal, trial / payment-failed banners, checkout activation) + server-safe `/core` (types, plan constants) + client `/store` (Zustand store + hooks) |

## Development

```bash
pnpm install
pnpm build       # build every package
pnpm typecheck   # tsc --noEmit in every package
pnpm -F @just-apps/auth dev   # rebuild on change
```

To try an unreleased change in an app, link the package from the app's directory:

```bash
pnpm link ../just-apps-kit/packages/auth
```

## Release

1. In your PR, run `pnpm changeset` and pick the packages and bump type.
2. On merge to `main`, the Release workflow opens a **Version Packages** PR (version bump + `CHANGELOG.md`).
3. Merging that PR publishes the bumped packages to npm.

The workflow needs an `NPM_TOKEN` repository secret with publish rights to the `@just-apps` scope.

## License

MIT
