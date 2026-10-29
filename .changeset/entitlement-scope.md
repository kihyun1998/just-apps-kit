---
"@just-apps/subscription": minor
---

`useSubscriptionStore.init(supabase, { appIds })` scopes the entitlements the store reads to the given app ids, so `useAllEntitlements` no longer returns rows other family apps granted on the same Supabase project (#17). Without `appIds` the store behaves as before. Calling `init` again with a different client or scope reloads instead of being ignored, and a failed load leaves the store uninitialised so the next `init` retries.

`refetch` now settles `isLoading` when there is no session and reports a failed session check through `error` instead of rejecting. The internal `_supabase` field is no longer part of the store's state, and `clear()` no longer logs.
