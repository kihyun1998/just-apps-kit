---
"@just-apps/auth": patch
---

The ko-KR marketing consent title is `마케팅 정보 수신`, so the terms card, which adds `동의` after each title, no longer reads `마케팅 정보 수신 동의 동의` (#19). The document's text and `version` are unchanged.

`TermsAgreementCard` lists its terms on the first render, and its `className` is merged with `cn`, so a width class an app passes replaces the default `max-w-md` instead of competing with it.
