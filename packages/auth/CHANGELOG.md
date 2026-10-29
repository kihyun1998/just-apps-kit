# @just-apps/auth

## 0.8.0

### Minor Changes

- 7256307: `AccountDeleteView` takes an optional `error` code and shows why a deletion failed (#18). It works like `LoginView`'s: `error="<code>"` renders `delete.error.<code>`, or the new `delete.error.generic` when that key has no text; an app adds text for its own codes through `translations`.
- efe4a2b: Privacy policy version 2 (ko-KR, en-US), effective 2026-10-01: the outsourcing (§5) and international transfer (§12) tables now list Link, LLC (formerly Lemon Squeezy LLC) for payment processing and subscription management, and Vercel Inc. for web hosting. An app that upgrades records `agreed_privacy_version: 2` for new agreements. Existing agreements stay at 1, because no app re-prompts on a version change yet.
- c3a8faa: Both packages' `t()` are now one function, `t(key, locale, overrides?, params?)`, built from a shared source and inlined into each package; `Locale` and `TranslationOverrides` come from the same definition.

  - `@just-apps/auth`: `t()` takes `params` and replaces each `{name}`. An empty-string override is now used as given instead of falling back to the built-in text, so an app can blank a label.
  - `@just-apps/subscription`: `{name}` is replaced at every occurrence, literally (a `$` in the value is no longer interpreted). `SubscriptionView` and `PaymentFailedBanner` take a `translations` prop. The "Active Entitlements" heading is the new `subscription.entitlements` key instead of inline text.

- feebf7f: `@just-apps/subscription`: the status, entitlement-source and plan values now live in one place. `SUBSCRIPTION_STATUSES`, `ENTITLEMENT_SOURCES` and `PLAN_IDS` (with `isSubscriptionStatus`, `isEntitlementSource`, `isPlanId`) are exported from the main entry and from `/core`, and `SubscriptionStatus`, `EntitlementSource` and `PlanId` are derived from them. Server code can validate a value against the same list the store uses.

  Breaking: `PricingView`, `UpgradeModal`, `TrialBanner` and `CheckoutActivation` are removed, together with the translation keys only they used (`pricing.*`, `upgrade.*`, `checkout.*`, `trial.start`, `badge.pro`, `badge.free`, `common.loading`, `subscription.expired`). No family app rendered them. `useCheckout` and `SubscriptionView` are unchanged.

  `@just-apps/auth`: the unused `common.loading` and `common.auth_processing` translation keys are removed, so they are no longer part of `TranslationKey`.

### Patch Changes

- f6b704a: The ko-KR marketing consent title is `마케팅 정보 수신`, so the terms card, which adds `동의` after each title, no longer reads `마케팅 정보 수신 동의 동의` (#19). The document's text and `version` are unchanged.

  `TermsAgreementCard` lists its terms on the first render, and its `className` is merged with `cn`, so a width class an app passes replaces the default `max-w-md` instead of competing with it.

## 0.7.0

### Minor Changes

- f4a60bd: `TranslationKey` is now the union of each package's built-in keys instead of `string`, so a key that isn't in the package dictionary (e.g. `"login.titel"` in auth, `"pricing.titel"` in subscription) is a type error. `t()` still accepts any string and behaves the same at runtime.

  Code that used `TranslationKey` as "any string" needs `string` there instead: assigning an app's own key to it, `Partial<Record<TranslationKey, …>>` holding an app's own keys, or `Record<TranslationKey, …>`, which now requires every built-in key.

## 0.6.0

### Minor Changes

- 9e53ca9: `LoginView` takes an optional `error` code and shows a failed sign-in above the Google button. `error="auth_failed"` renders the new `login.error.auth_failed` text; any code without text of its own renders `login.error.generic`, so a code read from the URL never prints a raw key. The app still reads the URL itself and passes the code.
