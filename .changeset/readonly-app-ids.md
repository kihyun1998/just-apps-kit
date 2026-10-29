---
"@just-apps/subscription": patch
---

`init(supabase, { appIds })` accepts a `readonly string[]`, so an app can pass a frozen or `as const` list of its ids without copying it. The store never mutates the list.
