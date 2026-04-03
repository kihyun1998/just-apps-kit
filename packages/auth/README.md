# @just-apps/auth

Shared auth UI components for [Just Apps](https://justapps.co) projects — login, terms agreement, my page, account deletion, and user menu.

All components are **pure view components**. Business logic (Supabase, routing, state management) is injected via props.

## Install

```bash
npm install @just-apps/auth
```

### Peer Dependencies

- `react` >= 18
- `react-dom` >= 18

### Bundled Dependencies

The following are included in the package — you don't need to install them separately:

- `lucide-react` — icons
- `boring-avatars` — user avatars (marble gradient style)
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling utilities

## Setup

### 1. Next.js transpile (required)

This package exports raw TypeScript/TSX source. You **must** configure Next.js to transpile it:

```js
// next.config.js
const nextConfig = {
  transpilePackages: ["@just-apps/auth"],
};
```

### 2. Tailwind v4 source scan

Add the package to your Tailwind CSS source scan so its classes are included:

```css
/* globals.css */
@import "tailwindcss";
@source "../node_modules/@just-apps/auth/src/**/*.tsx";
```

### 3. CSS variables (theme)

Components use Tailwind CSS variable-based colors. Your project must define these CSS variables:

```
--background, --foreground
--card, --card-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
```

See the [shadcn/ui theming guide](https://ui.shadcn.com/docs/theming) for reference. Light and dark mode variables should both be defined.

### 4. Client components

All components are marked `"use client"`. In Next.js App Router, import them in client components or wrap in a client boundary:

```tsx
// app/login/page.tsx
import { LoginView } from "@just-apps/auth"; // works — page.tsx can import client components
```

## Components

### LoginView

Google OAuth login card.

```tsx
import { LoginView } from "@just-apps/auth";

<LoginView
  locale="ko-KR"
  onGoogleLogin={() => signInWithGoogle()}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `"ko-KR" \| "en-US"` | Yes | UI language |
| `onGoogleLogin` | `() => void` | Yes | Google OAuth handler |
| `translations` | `TranslationOverrides` | No | Override default i18n strings |

---

### TermsAgreementView

Full-page terms agreement with built-in header/footer.

```tsx
import { TermsAgreementView } from "@just-apps/auth";

<TermsAgreementView
  locale="ko-KR"
  theme="dark"
  terms={[
    { id: "1", type: "terms_of_service", title: "이용약관", required: true },
    { id: "2", type: "privacy_policy", title: "개인정보처리방침", required: true },
    { id: "3", type: "marketing", title: "마케팅 정보 수신", required: false },
  ]}
  onToggleLocale={() => toggleLocale()}
  onToggleTheme={() => toggleTheme()}
  termsViewUrl={(type, locale) => `https://justapps.co/terms/${type}/${locale}`}
  onSubmit={async (agreed) => {
    // agreed = { terms_of_service: true, privacy_policy: true, marketing: false }
    await saveAgreements(agreed);
  }}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | UI language |
| `theme` | `Theme` | Yes | Current theme for icon display |
| `terms` | `TermItem[]` | Yes | List of terms to agree to |
| `onToggleLocale` | `() => void` | Yes | Locale toggle handler |
| `onToggleTheme` | `() => void` | No | Theme toggle handler. If omitted, toggle button is hidden |
| `onSubmit` | `(agreed: Record<string, boolean>) => Promise<void>` | Yes | Called with `{ [term.type]: checked }` map |
| `termsViewUrl` | `(type: string, locale: Locale) => string` | No | URL builder for "View" links. If omitted, links are hidden |
| `logoText` | `string` | No | Header logo text. Default: `"Just Apps"` |
| `logoHref` | `string` | No | Header logo link. Default: `"/"` |
| `headerSlot` | `ReactNode` | No | Replace the entire default header |
| `footerSlot` | `ReactNode` | No | Replace the entire default footer |
| `translations` | `TranslationOverrides` | No | Override default i18n strings |

#### Terms View URL

The `termsViewUrl` prop controls where the "View" link on each term item points to:

```tsx
// Same project — relative path
termsViewUrl={(type, locale) => `/terms/${type}/${locale}`}

// Different project — use full Just Apps URL
termsViewUrl={(type, locale) => `https://justapps.co/terms/${type}/${locale}`}
```

If `termsViewUrl` is not provided, the "View" links are not shown.

---

### MyPageView

User profile card — email, join date, sign out, delete account.

```tsx
import { MyPageView } from "@just-apps/auth";

<MyPageView
  locale="ko-KR"
  user={{ id: "123", email: "user@example.com", created_at: "2026-01-01" }}
  onSignOut={() => signOut()}
  onDeleteAccount={() => router.push("/account/delete")}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | UI language |
| `user` | `AuthUser` | Yes | User object |
| `onSignOut` | `() => void` | Yes | Sign out handler |
| `onDeleteAccount` | `() => void` | Yes | Navigate to delete page |
| `translations` | `TranslationOverrides` | No | Override default i18n strings |

---

### AccountDeleteView

Two-step account deletion confirmation. Manages `showConfirm`, `deleting`, and `deleted` states internally.

```tsx
import { AccountDeleteView } from "@just-apps/auth";

<AccountDeleteView
  locale="ko-KR"
  user={user}
  onGoogleLogin={() => signInWithGoogle()}
  onDelete={async () => {
    await deleteAccount();
    await signOut();
  }}
  onGoHome={() => router.push("/")}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | UI language |
| `user` | `AuthUser \| null` | Yes | Current user, or `null` if not logged in |
| `onGoogleLogin` | `() => void` | Yes | Login handler (shown when user is null) |
| `onDelete` | `() => Promise<void>` | Yes | Delete + sign out logic. On resolve, success screen is shown |
| `onGoHome` | `() => void` | Yes | Navigate home after deletion |
| `translations` | `TranslationOverrides` | No | Override default i18n strings |

**Flow:** Delete button → Confirm dialog → `onDelete()` called → success screen → "Go Home" button calls `onGoHome()`.

---

### AuthCallbackView

OAuth callback loading UI. Shows a spinner while auth state is loading, then calls `onRoute` to navigate.

```tsx
import { AuthCallbackView } from "@just-apps/auth";

<AuthCallbackView
  loading={loading}
  user={user}
  isNewUser={isNewUser}
  onRoute={(dest) => {
    if (dest === "login") router.replace("/login");
    else if (dest === "terms") router.replace("/terms");
    else router.replace("/");
  }}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `loading` | `boolean` | Yes | `true` while auth state is being checked |
| `user` | `AuthUser \| null` | No | Current user |
| `isNewUser` | `boolean` | No | `true` if user hasn't completed terms agreement |
| `onRoute` | `(dest: "login" \| "terms" \| "home") => void` | Yes | Called when loading completes |

**Routing logic** (when `loading` becomes `false`):
- No user → `onRoute("login")`
- New user (hasn't agreed to terms) → `onRoute("terms")`
- Existing user → `onRoute("home")`

---

### UserMenu

Avatar dropdown menu for the header. Stateful — manages open/close and click-outside detection internally.

```tsx
import { UserMenu } from "@just-apps/auth";

<UserMenu
  locale="ko-KR"
  user={{ id: "123", email: "user@example.com" }}
  role="user"
  onMyPage={() => router.push("/mypage")}
  onAdmin={() => router.push("/admin")}
  onSignOut={() => signOut()}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | UI language |
| `user` | `AuthUser` | Yes | User object |
| `role` | `"admin" \| "user"` | Yes | Determines which menu item to show |
| `onMyPage` | `() => void` | Yes | Shown when `role="user"` |
| `onAdmin` | `() => void` | Yes | Shown when `role="admin"` |
| `onSignOut` | `() => void` | Yes | Sign out handler |
| `translations` | `TranslationOverrides` | No | Override default i18n strings |

Menu items are **mutually exclusive** based on `role`: admins see "Admin Dashboard", regular users see "My Page".

## Translation Override

All components accept a `translations` prop to override built-in Korean/English strings:

```tsx
<LoginView
  locale="ko-KR"
  onGoogleLogin={handleLogin}
  translations={{
    "login.title": { "ko-KR": "시작하기", "en-US": "Get Started" },
  }}
/>
```

Overrides take priority. Missing keys fall back to built-in translations.

## Types

```ts
import type { Locale, Theme, AuthUser, TermItem, TranslationOverrides } from "@just-apps/auth";
```

| Type | Definition |
|------|-----------|
| `Locale` | `"ko-KR" \| "en-US"` |
| `Theme` | `"light" \| "dark"` |
| `AuthUser` | `{ id: string; email?: string \| null; created_at?: string }` |
| `TermItem` | `{ id: string; type: string; title: string; required: boolean; content?: string }` |
| `TranslationOverrides` | `Partial<Record<string, Record<Locale, string>>>` |

## Also Exported

UI primitives available for direct use:

```ts
import { Button, Spinner, GoogleIcon, BoringAvatar, cn } from "@just-apps/auth";
```

### BoringAvatar

Marble gradient avatar generated from user name/id. Each user gets a unique gradient pattern.

```tsx
import { BoringAvatar } from "@just-apps/auth";

<BoringAvatar name={user.id} size={32} />
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | Yes | Seed for avatar generation (user id, email, etc.) |
| `size` | `number` | No | Avatar size in px. Default: `32` |

Default palette: `#818CF8`, `#C084FC`, `#F472B6`, `#34D399`, `#60A5FA`
