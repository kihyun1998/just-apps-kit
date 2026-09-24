# terms-version-family-wide

## The fact

The `version` in a terms markdown file's frontmatter is the value a consumer app writes into `user_agreements.agreed_terms_version`, and that row is one per account across the whole family. Every app must therefore present the same text under the same version — which holds only while every app reads it from this package, at the same package version.

## Why it is cross-cutting

The value is authored in [terms-content](../territory/terms-content.md), passes through [terms-agreement-ui](../territory/terms-agreement-ui.md) (which does not carry it), and reaches each app only through [release](../territory/release.md). The write happens in each app's code, outside this repo, so nothing here calls it.

## Territories it holds in

- [terms-content](../territory/terms-content.md) — the frontmatter `version`.
- [terms-agreement-ui](../territory/terms-agreement-ui.md) — `TermItem` has no version; the app pairs what it showed with what it records.
- [release](../territory/release.md) — an app on an older `@just-apps/auth` presents older text under an older version.

## What a violation looks like

A user agrees in one app and is asked again in another, or the family-wide row records a version whose text a given app never showed. It shows only across apps, never inside one.

## Discovery history

- [just-learn ADR-0008](https://github.com/kihyun1998/just-learn/blob/main/docs/adr/0008-terms-content-shared-in-auth-package.md) — per-app copies rejected because their versions drift into the shared table.
- 2026-09-23, while building this map: roster-ai keeps its own `src/content/terms` and writes `agreed_terms_version` from it, on an `@just-apps/auth` range below the one that ships terms content. Resolved 2026-09-24 in roster-ai#201: roster-ai is on `^0.7.0` and reads its ko-KR `terms_of_service` and `privacy_policy` from `@just-apps/auth/terms`.

## Where it will recur

Any app that writes `agreed_terms_version` from anything other than `@just-apps/auth/terms`, and any terms revision released while apps sit on different `@just-apps/auth` minors.

**Before adding a required document type:** `user_agreements` has version columns only for `terms_of_service` and `privacy_policy` (`agreed_terms_version`, `agreed_privacy_version`, just-apps-homepage `supabase/migrations/20260416120001_user_agreements_version.sql`), and every app writes by those two names. Apps that list `getTermsByLocale` (homepage, just-learn, and just-cut and just-cut-print through homepage's `/api/terms`) would show the new document and require it, but record no version for it. roster-ai picks its two documents by name, so it would not show the new one at all.

**Before bumping a `version` in any terms file:** no family app re-prompts on a version change yet, and the shared row cannot be re-written from a client — there is no `UPDATE` policy on `user_agreements`. A bump today records the new version only for first-time agreements. The design constraints for re-consent (role pinning, marketing-row guard, per-locale versions) are in just-apps-homepage#39 and its `docs/map/territory/terms-and-agreements.md`.
`grep -rn "agreed_terms_version" ../*/src ../*/*/src`
