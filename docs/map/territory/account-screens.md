# account-screens

## What it is

What a signed-in user sees about their own account: the header avatar menu, the my-page summary (email, join date, sign out, delete), and the account-deletion flow with its two-step confirmation.

## Governing decisions

**None.**

## Design model

- `UserMenu` shows *either* an admin entry (`role === "admin"`) *or* a my-page entry, never both; sign-out is always there. Built on Radix `DropdownMenu`.
- The avatar is seeded with `justapps:<email or id>`. The seed is shared by every app, so changing its format changes every user's avatar across the family.
- `AccountDeleteView` lists what deletion removes through `delete.data_*` translation strings. Those strings are the only place this package states what is deleted.
- A failed `onDelete` is logged and swallowed; the confirm step stays open with no error shown.

## Code

- `packages/auth/src/components/UserMenu.tsx` — `UserMenu`, `UserMenuProps`
- `packages/auth/src/components/MyPageView.tsx` — `MyPageView`, `MyPageViewProps`
- `packages/auth/src/components/AccountDeleteView.tsx` — `AccountDeleteView`, `AccountDeleteViewProps`
- `packages/auth/src/ui/marble-avatar.tsx` — `MarbleAvatar`, `PALETTE`
- `packages/auth/src/types.ts` — `AuthUser`

## Reference behaviour

**None.**

## Cross-cutting invariants

- [props-only-di](../invariant/props-only-di.md)
- [peer-singletons](../invariant/peer-singletons.md)
- [tailwind-scan-and-tokens](../invariant/tailwind-scan-and-tokens.md)

## Blast radius

- [i18n](i18n.md) — `mypage.*`, `delete.*`, `usermenu.*` keys.
- [terms-content](terms-content.md) — the `delete.data_*` / `delete.warning` claims about what is deleted and when should agree with the privacy policy text; nothing links the two.
- [ui-primitives](ui-primitives.md) — `Button`.
- [login](login.md) — the sign-in button inside the delete flow.

## Known holes / open

- No error state for a failed delete.
