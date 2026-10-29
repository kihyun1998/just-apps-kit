---
"@just-apps/auth": minor
---

`AccountDeleteView` takes an optional `error` code and shows why a deletion failed (#18). It works like `LoginView`'s: `error="<code>"` renders `delete.error.<code>`, or the new `delete.error.generic` when that key has no text; an app adds text for its own codes through `translations`.
