---
"@just-apps/auth": minor
"@just-apps/subscription": minor
---

`TranslationKey` is now the union of each package's built-in keys instead of `string`, so a key that isn't in the package dictionary (e.g. `"login.titel"` in auth, `"pricing.titel"` in subscription) is a type error. `t()` still accepts any string and behaves the same at runtime.

Code that used `TranslationKey` as "any string" needs `string` there instead: assigning an app's own key to it, `Partial<Record<TranslationKey, …>>` holding an app's own keys, or `Record<TranslationKey, …>`, which now requires every built-in key.
