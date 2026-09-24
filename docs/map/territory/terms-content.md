# terms-content

## What it is

The family's one copy of the legal text a user agrees to — Terms of Service, Privacy Policy, Marketing consent, in `ko-KR` and `en-US` — and the loader that turns each markdown file's frontmatter into a `TermData`. Shipped as the server-safe subpath `@just-apps/auth/terms`, so a route handler can read it as well as a page.

## Governing decisions

- [just-learn ADR-0008 — Terms content is a single shared source in @just-apps/auth](https://github.com/kihyun1998/just-learn/blob/main/docs/adr/0008-terms-content-shared-in-auth-package.md): one text and one version line for the whole family; no per-app copies; the package build inlines the markdown.

The record lives in a consumer's repository, not this one.

## Design model

- One markdown file per term type per locale; the frontmatter carries `type`, `title`, `required`, `version`, `effective_date`. The body is the content.
- `id` is `<file stem>_<locale>`; `type` falls back to that id when the frontmatter omits it.
- `version` falls back to `1` when it is missing or not an integer — a malformed bump reads as version 1, not as an error.
- An unknown locale falls back to `en-US`.
- The markdown is inlined as strings at package build time (tsup `.md` text loader), so a consumer needs no `?raw` import support.

## Code

- `packages/auth/src/content/terms/index.ts` — `TermData`, `parseFrontmatter`, `toTermData`, `getTermsByLocale`, `getTermByType`
- `packages/auth/src/md.d.ts` — `*.md`

The six markdown files sit next to `index.ts`; `ls packages/auth/src/content/terms/` is the list.

## Reference behaviour

**None.**

## Cross-cutting invariants

- [terms-version-family-wide](../invariant/terms-version-family-wide.md)
- [client-server-entry-split](../invariant/client-server-entry-split.md)

## Blast radius

- [build](build.md) — the `terms` entry is its own tsup config with the `.md` loader; a new content file type or entry changes it.
- [terms-agreement-ui](terms-agreement-ui.md) — apps map `TermData` onto `TermItem`; the shared field names (`id`, `type`, `title`, `required`) must keep meaning the same thing.
- [i18n](i18n.md) — the locale set is the `Locale` type; adding a language means a new markdown file per term here too.
- [release](release.md) — a text or version change reaches an app only when that app bumps its `@just-apps/auth` dependency.

## Known holes / open

- No test pins the loader's fallbacks (missing `version`, unknown locale).
- `privacy_policy` is version 2 (effective 2026-10-01) while `terms_of_service` and `marketing` stay at 1 (kit#12). The maintainer chose to bump without re-consent, so accounts that agreed before stay recorded at 1 (just-apps-homepage#39). The body's own "버전: 2.0" / "Version: 2.0" line and effective date are hand-kept copies of the frontmatter. Left out of v2 by the maintainer's call, because roster-ai plans to stop using it: Google's Gemini API, which roster-ai still sends user prompts to. Nothing in the text says any processor is app-specific.
