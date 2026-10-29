---
"@just-apps/auth": minor
"@just-apps/subscription": minor
---

Both packages' `t()` are now one function, `t(key, locale, overrides?, params?)`, built from a shared source and inlined into each package; `Locale` and `TranslationOverrides` come from the same definition.

- `@just-apps/auth`: `t()` takes `params` and replaces each `{name}`. An empty-string override is now used as given instead of falling back to the built-in text, so an app can blank a label.
- `@just-apps/subscription`: `{name}` is replaced at every occurrence, literally (a `$` in the value is no longer interpreted). `SubscriptionView` and `PaymentFailedBanner` take a `translations` prop. The "Active Entitlements" heading is the new `subscription.entitlements` key instead of inline text.
