# terms-agreement-ui

## What it is

The screen where a signed-in user agrees to the terms before using an app: a card of checkboxes (all / each, required vs optional, a link out to each term's full text) and a page shell around it with an optional header, footer and decline action.

## Governing decisions

**None.**

[just-learn ADR-0008](https://github.com/kihyun1998/just-learn/blob/main/docs/adr/0008-terms-content-shared-in-auth-package.md) decides where the *content* lives, not how this screen behaves.

## Design model

- `onSubmit` receives `Record<type, boolean>` keyed by `TermItem.type` — the app decides what to persist.
- Submit stays disabled until every `required` term is checked.
- `TermItem` carries no `version`. The version an app records comes from the `TermData` it loaded, not from anything this screen displayed.
- The card resets every checkbox when the `terms` prop changes identity.
- A submit error is logged to the console and swallowed; the screen shows no error.

## Code

- `packages/auth/src/components/TermsAgreementCard.tsx` — `TermsAgreementCard`, `TermsAgreementCardProps`, `CheckableTerm`
- `packages/auth/src/components/TermsAgreementView.tsx` — `TermsAgreementView`, `TermsAgreementViewProps`
- `packages/auth/src/types.ts` — `TermItem`, `Theme`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [terms-version-family-wide](../invariant/terms-version-family-wide.md)
- [props-only-di](../invariant/props-only-di.md)
- [tailwind-scan-and-tokens](../invariant/tailwind-scan-and-tokens.md)

## Blast radius

- [terms-content](terms-content.md) — the fields this screen reads are the ones apps copy out of `TermData`.
- [i18n](i18n.md) — every label is a `terms.*` key, and the footer text is `footer.copyright`.
- [ui-primitives](ui-primitives.md) — built on `Button` and `Spinner`.
- [login](login.md) — `AuthCallbackView` routes to `"terms"`; a change to when this screen is shown starts there.

## Known holes / open

- No error state for a failed submit.
