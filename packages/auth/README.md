# @just-apps/auth

Just Apps shared **authentication UI component library**. A pure presentational library that the Next.js homepage and Tauri desktop apps use to share auth screens — login, terms agreement, my page, account deletion, user menu, and so on.

> **This package contains no authentication logic.** The Supabase client, session store, OAuth flow, cookie/storage handling, and so on are all implemented by the consuming app (Next.js, Tauri) and injected as props. That means SSO-style session-sharing issues can't occur, and the package has no framework dependencies.

---

## 1. Overview

### What's included

- **8 React components** — login, terms agreement (view + card), my page, account deletion, OAuth callback, user menu, login button
- **4 UI primitives** — `Button`, `Spinner`, `GoogleIcon`, `MarbleAvatar`
- **Types** — `Locale`, `Theme`, `AuthUser`, `TermItem`, `TranslationOverrides`
- **i18n** — built-in `t()` function + ko-KR / en-US translation dictionaries (overridable)
- **Utilities** — `cn` (Tailwind class merge)

### What's **not** included

- ❌ Supabase client / `@supabase/supabase-js` calls
- ❌ Session management (Zustand store, localStorage, cookies)
- ❌ OAuth redirect / callback handling
- ❌ DB schema-dependent queries such as `user_agreements`
- ❌ Next.js server utilities / route handlers
- ❌ `next/*` module imports (for Tauri/Vite compatibility)

### Design principles

1. **Props-only** — all state and behavior is injected via props (`user`, `onGoogleLogin`, `onSignOut`, etc.)
2. **Framework-agnostic** — no `next/link`, `next/navigation`, `next/image`, etc. When needed, delegate via a callback prop (`onRoute(destination)`, `logoHref`, etc.)
3. **DI first** — never directly import the Supabase client, router, or translation function
4. **Slot pattern** — app-specific areas such as `TermsAgreementView.headerSlot` are received as ReactNode
5. **"use client"** — every component has the `"use client"` directive. Next recognizes it, Vite treats it as a no-op → compatible with both

---

## 2. Installation

```bash
pnpm add @just-apps/auth
```

For a Next.js app, in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  transpilePackages: ["@just-apps/auth"],
  // ...
};
```

### Peer Dependencies

The consuming app must have the following installed:

- `react` ^19
- `react-dom` ^19
- `lucide-react` ^1
- `boring-avatars` (when using MarbleAvatar)
- `class-variance-authority`, `clsx`, `tailwind-merge` (for Button / cn)

### Tailwind configuration

**⚠️ This step is mandatory. If you skip it the components will render but look broken** — padding, background colors, borders, and margins will silently disappear.

Tailwind v4 (and v3) does **not** scan `node_modules` by default, so any utility class that is only used inside this package (e.g. `bg-accent`, `rounded-lg`, `mt-8`, `border-t`) is purged from the final CSS unless you explicitly point Tailwind at the package.

Pick the snippet that matches how you consume the package:

**Tailwind v4 — installed from npm (the usual case):**

```css
@import "tailwindcss";
@source "../node_modules/@just-apps/auth/dist/**/*.{js,mjs}";
```

The `dist` output is produced by tsup and preserves `className` strings as plain literals, so Tailwind's static scanner can pick them up. Adjust the relative path so it resolves from your CSS file to your project's `node_modules`.

**Tailwind v3 — installed from npm:**

```ts
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@just-apps/auth/dist/**/*.{js,mjs}",
  ],
  // ...
};
```

**How to tell if you forgot this step:** open the rendered auth screen and check whether the "Agree to all" row in `TermsAgreementView` has a visible rounded accent background and whether there's a horizontal divider between it and the individual terms. If both are missing and everything feels crammed together, you're missing the `@source` / `content` entry.

### Required Tailwind tokens

The package components use the following CSS variable-based colors. The consuming app's design system must define these tokens:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--accent`, `--accent-foreground`
- `--muted`, `--muted-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

> ⚠️ **Note**: if `--secondary` and `--card` are too close in value, region separation disappears in dark mode. Keep a sufficient brightness delta (at least ~3%).

---

## 3. Quick Start

```tsx
import { LoginView } from "@just-apps/auth";
import { useAuth } from "@/stores/useAuth"; // auth store implemented by the app
import { useLocale } from "@/stores/useLocale"; // locale store implemented by the app

export function LoginPage() {
  const signInWithGoogle = useAuth((s) => s.signInWithGoogle);
  const locale = useLocale((s) => s.locale);

  return (
    <LoginView
      locale={locale}
      onGoogleLogin={signInWithGoogle}
    />
  );
}
```

The core pattern: the package draws the UI, the app injects state and behavior. No reverse dependency.

---

## 4. Components API

### `<LoginView />`

Google OAuth login card.

```tsx
interface LoginViewProps {
  locale: Locale;
  onGoogleLogin: () => void;
  error?: string;
  translations?: TranslationOverrides;
}
```

| Prop | Description |
|---|---|
| `locale` | Display language (`"ko-KR"` / `"en-US"`) |
| `onGoogleLogin` | Called when the Google button is clicked. Inject the app's OAuth flow starter |
| `error` | (optional) Sign-in failure code, e.g. `"auth_failed"`. Shows the `login.error.<code>` text above the button; a code with no text shows `login.error.generic` |
| `translations` | (optional) App-specific translation overrides |

The package does not read the URL. The app reads its own failure signal (for example `?error=auth_failed` set by its OAuth callback route) and passes the code:

```tsx
// `error`: the `?error=` value, read with the app's own router
<LoginView locale={locale} onGoogleLogin={signInWithGoogle} error={error} />
```

Built-in codes: `auth_failed`. An app-specific code gets its text through `translations`, e.g. `{ "login.error.blocked": { "ko-KR": "…", "en-US": "…" } }`.

**Example:**

```tsx
<LoginView
  locale="ko-KR"
  onGoogleLogin={() => supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/auth/callback" },
  })}
/>
```

---

### `<LoginButton />`

Small "Login" button used in headers and such.

```tsx
interface LoginButtonProps {
  locale: Locale;
  onClick: () => void;
  translations?: TranslationOverrides;
}
```

---

### `<UserMenu />`

Avatar + dropdown menu (my page / admin / sign out).

```tsx
interface UserMenuProps {
  locale: Locale;
  user: AuthUser;
  role: "admin" | "user";
  onMyPage: () => void;
  onAdmin: () => void;
  onSignOut: () => void;
  translations?: TranslationOverrides;
}
```

| Prop | Description |
|---|---|
| `user` | `{ id, email?, created_at? }` — the app's session user object |
| `role` | `"admin"` shows the admin menu, otherwise shows the my-page menu |
| `onMyPage` / `onAdmin` / `onSignOut` | Click handlers for each menu item |

**Behavior:**
- Closes on outside click (mousedown listener)
- The avatar is generated automatically by `MarbleAvatar` (hashed from email/ID)

---

### `<MyPageView />`

My page profile card + sign-out / delete-account buttons.

```tsx
interface MyPageViewProps {
  locale: Locale;
  user: AuthUser;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  translations?: TranslationOverrides;
}
```

Displays: email, join date (derived from `user.created_at` via `toLocaleDateString`), sign-out button, delete-account link.

---

### `<TermsAgreementView />`

Terms agreement screen. Rendered as a full-page layout (including header and footer) and customizable via slots.

Internally composes `<TermsAgreementCard />` (see below) inside a `min-h-screen` + header + `<main>` + footer shell. If you don't need the page shell, import `TermsAgreementCard` directly instead.

```tsx
interface TermsAgreementViewProps {
  locale: Locale;
  theme: Theme;
  terms: TermItem[];
  onToggleLocale: () => void;
  onToggleTheme?: () => void;
  onSubmit: (agreed: Record<string, boolean>) => Promise<void>;
  onCancel?: () => void;
  termsViewUrl?: (type: string, locale: Locale) => string;
  logoText?: string;
  logoHref?: string;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  translations?: TranslationOverrides;
}
```

| Prop | Description |
|---|---|
| `terms` | Array of term items. Each item is `{ id, type, title, required }` |
| `onSubmit` | Called on submit. The argument is a `{ [type]: boolean }` map (e.g. `{ terms_of_service: true, privacy_policy: true }`) |
| `onCancel` | (optional) When provided, a "decline and leave" link is shown below the submit button. Wire it to sign-out / navigate-home / whatever the app needs |
| `termsViewUrl` | (optional) URL generator for each term's "view" link |
| `logoText` / `logoHref` | (optional) Logo in the default header (defaults to `"Just Apps"` / `"/"`) |
| `headerSlot` / `footerSlot` | (optional) Replaces the default header/footer |
| `hideHeader` | (optional) If `true`, the default header (logo + locale/theme toggles) is not rendered at all. Useful for desktop apps that have their own title bar. Default `false` |
| `hideFooter` | (optional) If `true`, the default © footer is not rendered. Default `false` |
| `onToggleTheme` | (optional) Omit to hide the theme toggle button (for forced-theme scenarios) |

**Default behavior:**
- "Agree to all" checkbox → toggles every item
- The submit button activates only when all required terms are checked
- A loading spinner is shown during submission

---

### `<TermsAgreementCard />`

Just the terms agreement card — no page layout, no header, no footer. All the checkbox state, "agree to all" logic, required-terms validation, and submission flow lives here; `TermsAgreementView` is a thin wrapper that composes this card inside a full-page shell.

Use this directly when you need the card in your own layout — e.g. a desktop app with its own title bar, a modal dialog, or a custom multi-column page.

```tsx
interface TermsAgreementCardProps {
  locale: Locale;
  terms: TermItem[];
  onSubmit: (agreed: Record<string, boolean>) => Promise<void>;
  onCancel?: () => void;
  termsViewUrl?: (type: string, locale: Locale) => string;
  translations?: TranslationOverrides;
  className?: string;
}
```

| Prop | Description |
|---|---|
| `terms` / `onSubmit` / `onCancel` / `termsViewUrl` / `translations` | Same semantics as `TermsAgreementView` |
| `className` | (optional) Extra classes merged onto the card's outer `<div>`. Use this to override width, margin, background, etc. Default base classes are `w-full max-w-md rounded-xl border border-border bg-card p-8` |

**Example (desktop app, custom layout):**

```tsx
import { TermsAgreementCard } from "@just-apps/auth";

export function DesktopTermsScreen() {
  return (
    <div className="flex items-center justify-center p-6">
      <TermsAgreementCard
        locale="ko-KR"
        terms={terms}
        onSubmit={handleSubmit}
        onCancel={handleDecline}
      />
    </div>
  );
}
```

---

### `<AccountDeleteView />`

Account deletion warning + two-step confirmation UI.

```tsx
interface AccountDeleteViewProps {
  locale: Locale;
  user: AuthUser | null;
  onGoogleLogin: () => void;
  onDelete: () => Promise<void>;
  onGoHome: () => void;
  translations?: TranslationOverrides;
}
```

**State machine:**

1. `user === null` → login prompt + Google login button
2. Signed in → "Delete account" button
3. Click → "Are you sure you want to delete?" confirmation dialog
4. Confirm → calls `onDelete()`, shows loading state, logs errors on failure
5. Success → "Account deleted" + "Go home" button

---

### `<AuthCallbackView />`

OAuth callback waiting screen + automatic route trigger.

```tsx
interface AuthCallbackViewProps {
  loading: boolean;
  user?: AuthUser | null;
  isNewUser?: boolean;
  onRoute: (destination: "login" | "terms" | "home") => void;
}
```

**Logic:**

- Shows a spinner while `loading`
- Once loading finishes, a `useEffect` calls `onRoute(destination)`:
  - `!user` → `"login"`
  - `isNewUser` → `"terms"`
  - otherwise → `"home"`

Inside `onRoute`, the app performs the actual navigation with its own router (Next's `useRouter`, react-router, etc.).

---

## 5. UI Primitives

### `<Button />`

shadcn-style button. 5 variants × 4 sizes.

```tsx
import { Button, buttonVariants, type ButtonProps } from "@just-apps/auth";

<Button variant="outline" size="lg" onClick={...}>...</Button>
```

**Variants:** `default` | `destructive` | `outline` | `ghost` | `link`
**Sizes:** `default` | `sm` | `lg` | `icon`

The `buttonVariants` cva function is also exported so other components can reuse the styles.

### `<Spinner />`

Loading spinner (a wrapper around `lucide-react`'s `Loader2`).

```tsx
<Spinner size="lg" className="text-primary" />
```

Sizes: `sm` (16px) | `md` (24px, default) | `lg` (32px)

### `<GoogleIcon />`

Google logo SVG (the official 4 colors). Size is controlled via the `className` prop (defaults to `h-5 w-5`).

### `<MarbleAvatar />`

Hash avatar based on [boring-avatars](https://github.com/boringdesigners/boring-avatars).

```tsx
<MarbleAvatar name={`justapps:${user.email ?? user.id}`} size={32} />
```

- Same `name` → same avatar every time (deterministic)
- Fixed 5-color palette: `#818CF8 #C084FC #F472B6 #34D399 #60A5FA`
- The `justapps:` prefix is recommended (prevents collisions with other services that share the same email)

---

## 6. Types

```ts
export type Locale = "ko-KR" | "en-US";
export type Theme = "light" | "dark";

export interface AuthUser {
  id: string;
  email?: string | null;
  created_at?: string;
}

export interface TermItem {
  id: string;
  type: string;       // e.g. "terms_of_service", "privacy_policy", "marketing"
  title: string;
  required: boolean;
  content?: string;
}

export type TranslationOverrides = Partial<
  Record<string, Record<Locale, string>>
>;
```

> `AuthUser` is intentionally narrowed to be structurally compatible with Supabase's `User` type. You can pass a user object pulled straight from a Supabase session.

---

## 7. i18n

### The `t()` function

```ts
import { t } from "@just-apps/auth";

t("login.title", "ko-KR");        // "로그인"
t("login.title", "en-US");        // "Login"
t("missing.key", "ko-KR");        // "missing.key" (fallback: the key itself)
```

### Translation overrides

When you want to change only a specific key's copy for one app:

```tsx
<LoginView
  locale="ko-KR"
  onGoogleLogin={...}
  translations={{
    "login.title": {
      "ko-KR": "Just Cut에 오신 것을 환영합니다",
      "en-US": "Welcome to Just Cut",
    },
  }}
/>
```

Overridden keys apply only within that component tree (not globally).

### Full list of translation keys

| Namespace | Keys |
|---|---|
| `login.*` | `title`, `subtitle`, `google`, `error.auth_failed`, `error.generic` |
| `terms.*` | `title`, `subtitle`, `agree_all`, `required`, `optional`, `agree_suffix`, `view`, `submit`, `decline` |
| `mypage.*` | `title`, `email`, `joined`, `delete_account`, `logout` |
| `delete.*` | `title`, `subtitle`, `login_required`, `login`, `data_title`, `data_email`, `data_agreements`, `data_activity`, `warning`, `confirm_button`, `confirm_title`, `confirm_message`, `confirm_yes`, `confirm_cancel`, `processing`, `success` |
| `usermenu.*` | `admin`, `admin_badge`, `mypage`, `logout` |
| `common.*` | `loading`, `auth_processing`, `login`, `go_home` |
| `footer.*` | `copyright` |

`TranslationKey` is the union of the built-in keys above, for code that should only name one of them:

```ts
import type { TranslationKey } from "@just-apps/auth";

const key: TranslationKey = "login.title";  // ok
const typo: TranslationKey = "login.titel"; // type error
```

`t()` itself accepts any string, since keys are also built at runtime (`login.error.<code>`) and apps add their own through overrides.

---

## 8. App integration guide

### Next.js (this repo)

The homepage's current adapter pattern:

**`src/components/common/UserMenu.tsx`** — a thin wrapper that injects app state:

```tsx
'use client';

import { useRouter } from "@/lib/navigation";
import { UserMenu as UserMenuView } from "@just-apps/auth";
import { useAuth } from "@/stores/useAuth";
import { useLocale } from "@/stores/useLocale";

export function UserMenu() {
  const router = useRouter();
  const { user, role, signOut } = useAuth();
  const locale = useLocale((s) => s.locale);

  if (!user) return null;

  return (
    <UserMenuView
      locale={locale}
      user={user}
      role={role === "admin" ? "admin" : "user"}
      onMyPage={() => router.push("/mypage")}
      onAdmin={() => router.push("/admin")}
      onSignOut={() => signOut()}
    />
  );
}
```

**Principle**: the page shell (routing, session access, header/footer assembly) lives in the app; the presentational shell lives in the package.

### Tauri / Vite apps

Fundamentally the same pattern as Next:

```tsx
// packages/xxx-tauri-app/src/pages/Login.tsx
import { LoginView } from "@just-apps/auth";
import { supabase } from "./lib/supabase"; // the Tauri app's own Supabase client

export function LoginPage() {
  return (
    <LoginView
      locale="ko-KR"
      onGoogleLogin={async () => {
        // Loopback OAuth flow for Tauri
        await startLoopbackOAuth();
      }}
    />
  );
}
```

**Caveats:**

1. The Tauri app's Tailwind config must include the package path
2. OAuth redirect can't use `window.location.origin + "/auth/callback"` like Next does → use a loopback server / deep link
3. The package has zero `next/*` imports, so Tauri builds work fine

---

## 9. FAQ

**Q. Can the package hold the Supabase client?**
A. No. The moment the package imports `@supabase/supabase-js`, each app gets a duplicate instance, the session singleton breaks, and framework dependencies like an SSR cookie adapter creep in. An earlier attempt had to be fully rolled back because of this (`9c1f98e`). Each app should create its own client and inject it via props/callbacks.

**Q. Can hooks like `useAuth` live in the package?**
A. Auth stores have different schemas per app (`user_agreements` table, `role` column, terms rules, etc.). Generalizing them would require DI for everything, which isn't worth it. Implement them per app.

**Q. My dark mode colors look wrong.**
A. This package depends on the consuming app's design system for Tailwind CSS tokens (`--card`, `--secondary`, etc.). In particular, if `--secondary` and `--card` are close in value, regions become indistinguishable. Adjust your app's `globals.css` dark tokens or tweak the Tailwind classes on the affected component.

**Q. Do I need the `"use client"` directive in Tauri too?**
A. It isn't needed but it's harmless. Vite ignores the directive and Next requires it, so it stays for dual compatibility.

**Q. What about adding a new language beyond i18n overrides?**
A. The `Locale` type is currently hardcoded to `"ko-KR" | "en-US"`. Adding a new language requires changes inside the package itself.

---

## 10. Versioning / changelog

Published to npm from [just-apps-kit](https://github.com/kihyun1998/just-apps-kit) via [Changesets](https://github.com/changesets/changesets). Each release's notes are in `CHANGELOG.md`. While the version is `0.x`, a minor bump may be breaking and `^0.x.y` ranges do not pick it up — bump consumers explicitly.

---

## 11. Related docs

- [`docs/ROADMAP_PACKAGE_MIGRATION.md`](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/ROADMAP_PACKAGE_MIGRATION.md) (just-apps-homepage) — packaging roadmap & design decisions
- `packages/subscription/README.md` — subscription UI package (sibling package)
- `README.md` (root) — repository structure and release flow
