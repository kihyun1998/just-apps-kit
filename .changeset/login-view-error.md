---
"@just-apps/auth": minor
---

`LoginView` takes an optional `error` code and shows a failed sign-in above the Google button. `error="auth_failed"` renders the new `login.error.auth_failed` text; any code without text of its own renders `login.error.generic`, so a code read from the URL never prints a raw key. The app still reads the URL itself and passes the code.
