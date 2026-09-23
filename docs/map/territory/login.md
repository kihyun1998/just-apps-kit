# login

## What it is

Getting a user signed in: the Google sign-in screen, the compact sign-in button for headers, and the OAuth-callback screen that routes the user onward once the app knows who they are.

## Governing decisions

**None.**

## Design model

- The package never performs sign-in. `onGoogleLogin` / `onClick` are the app's.
- `AuthCallbackView` only routes: no user → `"login"`, new user → `"terms"`, otherwise `"home"`. The app decides what "new user" means and passes `isNewUser`.
- The route callback is held in a ref, so an unstable `onRoute` does not re-fire the effect.

## Code

- `packages/auth/src/components/LoginView.tsx` — `LoginView`, `LoginViewProps`
- `packages/auth/src/components/LoginButton.tsx` — `LoginButton`, `LoginButtonProps`
- `packages/auth/src/components/AuthCallbackView.tsx` — `AuthCallbackView`, `AuthCallbackViewProps`
- `packages/auth/src/ui/google-icon.tsx` — `GoogleIcon`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [props-only-di](../invariant/props-only-di.md)
- [tailwind-scan-and-tokens](../invariant/tailwind-scan-and-tokens.md)

## Blast radius

- [i18n](i18n.md) — `login.*` and `common.login` keys.
- [ui-primitives](ui-primitives.md) — `Button`, `Spinner`.
- [terms-agreement-ui](terms-agreement-ui.md) — the callback's `"terms"` destination.
- [account-screens](account-screens.md) — `AccountDeleteView` has its own Google sign-in button with a separate `delete.login` label; a change to the sign-in affordance belongs in both.

## Known holes / open

- `LoginViewProps` has no way to show a failed sign-in. Tracked: #1.
