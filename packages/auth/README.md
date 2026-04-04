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

These are included in the package — no separate installation needed:

- `lucide-react` — icons
- `boring-avatars` — avatar generation (marble gradient style)
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

See the [shadcn/ui theming guide](https://ui.shadcn.com/docs/theming) for reference. Define both light and dark mode variables.

### 4. Client components

All components are marked `"use client"`. You can import them directly in Next.js App Router:

```tsx
import { LoginView } from "@just-apps/auth";
```

---

## Auth Flow Overview

How the components fit together in the full authentication flow:

```
[User visits]
     |
     v
 LoginView --(Google OAuth)--> [Supabase OAuth]
                                      |
                                      v
                              AuthCallbackView
                               |-- new user --> TermsAgreementView
                               '-- existing --> home
                                                  |
                                                  v
                                            [Authenticated]
                                             |-- UserMenu (header)
                                             |-- MyPageView (profile)
                                             '-- AccountDeleteView
```

Each component handles UI only. Supabase calls and routing are passed in via props.

---

## Components

### LoginView

Google OAuth login card.

```tsx
import { LoginView } from "@just-apps/auth";

<LoginView
  locale="ko-KR"
  onGoogleLogin={() => supabase.auth.signInWithOAuth({ provider: "google" })}
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
import type { TermItem } from "@just-apps/auth";

const terms: TermItem[] = [
  { id: "1", type: "terms_of_service", title: "Terms of Service", required: true },
  { id: "2", type: "privacy_policy", title: "Privacy Policy", required: true },
  { id: "3", type: "marketing", title: "Marketing emails", required: false },
];

<TermsAgreementView
  locale="ko-KR"
  theme="dark"
  terms={terms}
  onToggleLocale={() => toggleLocale()}
  onToggleTheme={() => toggleTheme()}
  termsViewUrl={(type, locale) => `/terms/${type}/${locale}`}
  onSubmit={async (agreed) => {
    // agreed = { terms_of_service: true, privacy_policy: true, marketing: false }
    await supabase.from("user_agreements").insert({
      user_id: user.id,
      terms_agreed: agreed.terms_of_service ?? false,
      privacy_agreed: agreed.privacy_policy ?? false,
    });
  }}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | UI language |
| `theme` | `Theme` | Yes | Current theme (for icon display) |
| `terms` | `TermItem[]` | Yes | List of terms to agree to |
| `onToggleLocale` | `() => void` | Yes | Locale toggle handler |
| `onToggleTheme` | `() => void` | No | Theme toggle handler. Hidden if omitted |
| `onSubmit` | `(agreed: Record<string, boolean>) => Promise<void>` | Yes | Called with `{ [term.type]: checked }` map |
| `termsViewUrl` | `(type: string, locale: Locale) => string` | No | URL builder for "View" links. Hidden if omitted |
| `logoText` | `string` | No | Header logo text. Default: `"Just Apps"` |
| `logoHref` | `string` | No | Header logo link. Default: `"/"` |
| `headerSlot` | `ReactNode` | No | Custom header replacing the default |
| `footerSlot` | `ReactNode` | No | Custom footer replacing the default |
| `translations` | `TranslationOverrides` | No | Override default i18n strings |

> **Note:** Use a relative path (`/terms/...`) for same-project routes, or a full URL (`https://justapps.co/terms/...`) for external projects.

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
- No user -> `onRoute("login")`
- New user (terms not agreed) -> `onRoute("terms")`
- Existing user -> `onRoute("home")`

---

### MyPageView

User profile card — email, join date, sign out, and delete account buttons.

```tsx
import { MyPageView, Spinner } from "@just-apps/auth";

// Show spinner while loading
if (loading) return <Spinner size="lg" />;

// Redirect unauthenticated users
if (!user) {
  router.replace("/login");
  return null;
}

<MyPageView
  locale="ko-KR"
  user={user}
  onSignOut={async () => {
    await supabase.auth.signOut();
    router.push("/");
  }}
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

> **Tip:** MyPageView only renders the profile card. To add more sections (e.g. subscription info), stack them together:
>
> ```tsx
> <div className="w-full max-w-md space-y-6">
>   <MyPageView locale={locale} user={user} ... />
>   <SubscriptionView locale={locale} ... />
> </div>
> ```

---

### AccountDeleteView

Two-step account deletion confirmation. Manages confirm dialog, deleting, and deleted states internally.

```tsx
import { AccountDeleteView } from "@just-apps/auth";

<AccountDeleteView
  locale="ko-KR"
  user={user}
  onGoogleLogin={() => supabase.auth.signInWithOAuth({ provider: "google" })}
  onDelete={async () => {
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) throw error;
    await supabase.auth.signOut();
  }}
  onGoHome={() => router.push("/")}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | UI language |
| `user` | `AuthUser \| null` | Yes | Current user. Shows login screen when `null` |
| `onGoogleLogin` | `() => void` | Yes | Login handler (shown when user is null) |
| `onDelete` | `() => Promise<void>` | Yes | Delete + sign out logic. Shows success screen on resolve |
| `onGoHome` | `() => void` | Yes | Navigate home after deletion |
| `translations` | `TranslationOverrides` | No | Override default i18n strings |

**Flow:** Delete button -> Confirm dialog -> `onDelete()` called -> success screen -> "Go Home" calls `onGoHome()`.

---

### UserMenu

Avatar dropdown menu for the header. Manages open/close and click-outside detection internally.

```tsx
import { UserMenu } from "@just-apps/auth";

// Don't render if no user
if (!user) return null;

<UserMenu
  locale="ko-KR"
  user={user}
  role={role === "admin" ? "admin" : "user"}
  onMyPage={() => router.push("/mypage")}
  onAdmin={() => router.push("/admin")}
  onSignOut={() => supabase.auth.signOut()}
/>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | UI language |
| `user` | `AuthUser` | Yes | User object |
| `role` | `"admin" \| "user"` | Yes | Determines which menu items to show |
| `onMyPage` | `() => void` | Yes | Shown when `role="user"` |
| `onAdmin` | `() => void` | Yes | Shown when `role="admin"` |
| `onSignOut` | `() => void` | Yes | Sign out handler |
| `translations` | `TranslationOverrides` | No | Override default i18n strings |

> Menu items are **mutually exclusive** by `role`: admins see "Admin Dashboard", regular users see "My Page".

---

## Integration Guide

Typical patterns for building auth pages with this package.

### 1. Login Page

```tsx
// src/app/login/page.tsx
import { LoginView } from "@just-apps/auth";

export default function LoginPage() {
  const signInWithGoogle = useAuth((s) => s.signInWithGoogle);
  const locale = useLocale((s) => s.locale);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginView locale={locale} onGoogleLogin={() => signInWithGoogle()} />
    </div>
  );
}
```

### 2. OAuth Callback

Exchange the OAuth code server-side, then route client-side:

```tsx
// src/app/auth/callback/route.ts (server)
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL("/auth/callback-client", request.url));
}

// src/app/auth/callback-client/page.tsx (client)
import { AuthCallbackView } from "@just-apps/auth";

export default function AuthCallbackClientPage() {
  const { user, isNewUser, loading } = useAuth();
  const router = useRouter();

  return (
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
  );
}
```

### 3. Terms Agreement Page

```tsx
// src/app/terms/page.tsx
import { TermsAgreementView } from "@just-apps/auth";
import type { TermItem } from "@just-apps/auth";

export default function TermsPage() {
  const user = useAuth((s) => s.user);
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();
  const [terms, setTerms] = useState<TermItem[]>([]);

  useEffect(() => {
    fetchTerms(locale).then(setTerms);
  }, [locale]);

  return (
    <TermsAgreementView
      locale={locale}
      theme={theme}
      terms={terms}
      onToggleLocale={toggleLocale}
      onToggleTheme={toggleTheme}
      termsViewUrl={(type, loc) => `/terms/${type}/${loc}`}
      onSubmit={async (agreed) => {
        if (!user) return;
        await supabase.from("user_agreements").insert({
          user_id: user.id,
          terms_agreed: agreed.terms_of_service ?? false,
          privacy_agreed: agreed.privacy_policy ?? false,
        });
        router.replace("/");
      }}
    />
  );
}
```

### 4. My Page

```tsx
// src/app/mypage/page.tsx
import { MyPageView, Spinner } from "@just-apps/auth";

export default function MyPage() {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const signOut = useAuth((s) => s.signOut);
  const locale = useLocale((s) => s.locale);
  const router = useRouter();

  // Auth guard: redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      {loading ? (
        <Spinner size="lg" />
      ) : user ? (
        <div className="w-full max-w-md space-y-6">
          <MyPageView
            locale={locale}
            user={user}
            onSignOut={async () => {
              await signOut();
              router.push("/");
            }}
            onDeleteAccount={() => router.push("/account/delete")}
          />
          {/* Additional sections (e.g. subscription) */}
        </div>
      ) : null}
    </main>
  );
}
```

### 5. Account Delete Page

```tsx
// src/app/account/delete/page.tsx
import { AccountDeleteView } from "@just-apps/auth";

export default function AccountDeletePage() {
  const user = useAuth((s) => s.user);
  const signInWithGoogle = useAuth((s) => s.signInWithGoogle);
  const signOut = useAuth((s) => s.signOut);
  const locale = useLocale((s) => s.locale);
  const router = useRouter();

  return (
    <AccountDeleteView
      locale={locale}
      user={user}
      onGoogleLogin={signInWithGoogle}
      onDelete={async () => {
        const { error } = await supabase.functions.invoke("delete-account");
        if (error) throw error;
        await signOut();
      }}
      onGoHome={() => router.push("/")}
    />
  );
}
```

### 6. UserMenu in Header

```tsx
// src/components/Header.tsx
import { UserMenu } from "@just-apps/auth";

function Header() {
  const { user, role, signOut } = useAuth();
  const locale = useLocale((s) => s.locale);
  const router = useRouter();

  return (
    <header>
      <nav>{/* ... */}</nav>
      {user && (
        <UserMenu
          locale={locale}
          user={user}
          role={role === "admin" ? "admin" : "user"}
          onMyPage={() => router.push("/mypage")}
          onAdmin={() => router.push("/admin")}
          onSignOut={() => signOut()}
        />
      )}
    </header>
  );
}
```

### Auth Guard Pattern

Common pattern for pages that require authentication:

```tsx
const user = useAuth((s) => s.user);
const loading = useAuth((s) => s.loading);

useEffect(() => {
  if (!loading && !user) {
    router.replace("/login");
  }
}, [loading, user, router]);

if (loading) return <Spinner size="lg" />;
if (!user) return null;
```

---

## Translation Override

All components accept a `translations` prop to override built-in Korean/English strings:

```tsx
<LoginView
  locale="ko-KR"
  onGoogleLogin={handleLogin}
  translations={{
    "login.title": { "ko-KR": "Get Started", "en-US": "Get Started" },
  }}
/>
```

Overrides take priority. Missing keys fall back to built-in translations.

### Available Translation Keys

| Component | Key | Default (ko-KR) | Default (en-US) |
|-----------|-----|-----------------|-----------------|
| LoginView | `login.title` | 로그인 | Login |
| | `login.subtitle` | Google 계정으로 시작하세요. | Get started with your Google account. |
| | `login.google` | Google로 로그인 | Sign in with Google |
| TermsAgreementView | `terms.title` | 약관 동의 | Terms Agreement |
| | `terms.subtitle` | 서비스 이용을 위해 약관에 동의해주세요. | Please agree to the terms to use our service. |
| | `terms.agree_all` | 전체 동의 | Agree to all |
| | `terms.required` | 필수 | Required |
| | `terms.optional` | 선택 | Optional |
| | `terms.view` | 보기 | View |
| | `terms.submit` | 동의하고 시작하기 | Agree and Get Started |
| MyPageView | `mypage.title` | 마이페이지 | My Page |
| | `mypage.email` | 이메일 | Email |
| | `mypage.joined` | 가입일 | Joined |
| | `mypage.delete_account` | 계정 삭제 | Delete Account |
| | `mypage.logout` | 로그아웃 | Sign Out |
| AccountDeleteView | `delete.title` | 계정 삭제 | Delete Account |
| | `delete.confirm_button` | 계정 삭제 | Delete Account |
| | `delete.confirm_title` | 정말 삭제하시겠습니까? | Are you sure? |
| | `delete.confirm_yes` | 삭제 | Delete |
| | `delete.confirm_cancel` | 취소 | Cancel |
| UserMenu | `usermenu.admin` | 관리자 페이지 | Admin Dashboard |
| | `usermenu.mypage` | 마이페이지 | My Page |
| | `usermenu.logout` | 로그아웃 | Logout |
| Common | `common.loading` | 로딩 중... | Loading... |
| | `common.go_home` | 홈으로 | Go Home |

---

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

---

## Also Exported

UI primitives and utilities available for direct use:

```ts
import { Button, Spinner, GoogleIcon, MarbleAvatar, cn, t } from "@just-apps/auth";
```

| Export | Description |
|--------|-------------|
| `Button` | CVA-based button with `variant` and `size` props |
| `Spinner` | Loading spinner. Accepts `size` prop (`"sm"`, `"md"`, `"lg"`) |
| `GoogleIcon` | Google logo SVG icon |
| `MarbleAvatar` | Marble gradient avatar generated from a seed string. Props: `name` (string, required), `size` (number, default `32`) |
| `cn` | `clsx` + `tailwind-merge` utility |
| `t` | i18n function: `t(key, locale, overrides?)` |

### MarbleAvatar

Each user gets a unique marble gradient pattern based on their name/ID.

```tsx
import { MarbleAvatar } from "@just-apps/auth";

<MarbleAvatar name={user.id} size={40} />
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | Yes | Seed for avatar generation (user id, email, etc.) |
| `size` | `number` | No | Avatar size in px. Default: `32` |
