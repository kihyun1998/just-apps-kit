# @just-apps/auth

## 0.7.0

### Minor Changes

- f4a60bd: `TranslationKey` is now the union of each package's built-in keys instead of `string`, so a key that isn't in the package dictionary (e.g. `"login.titel"` in auth, `"pricing.titel"` in subscription) is a type error. `t()` still accepts any string and behaves the same at runtime.

  Code that used `TranslationKey` as "any string" needs `string` there instead: assigning an app's own key to it, `Partial<Record<TranslationKey, …>>` holding an app's own keys, or `Record<TranslationKey, …>`, which now requires every built-in key.

## 0.6.0

### Minor Changes

- 9e53ca9: `LoginView` takes an optional `error` code and shows a failed sign-in above the Google button. `error="auth_failed"` renders the new `login.error.auth_failed` text; any code without text of its own renders `login.error.generic`, so a code read from the URL never prints a raw key. The app still reads the URL itself and passes the code.
