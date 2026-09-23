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
- 2026-09-23, while building this map: roster-ai keeps its own `src/content/terms` and writes `agreed_terms_version` from it, on an `@just-apps/auth` range below the one that ships terms content. Not yet tracked.

## Where it will recur

Any app that writes `agreed_terms_version` from anything other than `@just-apps/auth/terms`, and any terms revision released while apps sit on different `@just-apps/auth` minors.
`grep -rn "agreed_terms_version" ../*/src ../*/*/src`
