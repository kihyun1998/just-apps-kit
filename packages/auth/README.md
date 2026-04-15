# @just-apps/auth

Just Apps 공통 **인증 UI 컴포넌트 라이브러리**. Next.js 홈페이지와 Tauri 데스크톱 앱들이 로그인 / 약관 동의 / 마이페이지 / 계정 삭제 / 유저 메뉴 등 인증 화면을 공유하기 위한 순수 presentational 라이브러리.

> **이 패키지는 인증 로직을 포함하지 않습니다.** Supabase client, 세션 store, OAuth flow, 쿠키/저장소 처리 등은 모두 소비 앱(Next.js, Tauri)이 각자 구현하고 props로 주입합니다. 그래서 SSO 같은 세션 공유 문제가 발생할 수 없고, 어떤 프레임워크에도 의존하지 않습니다.

---

## 1. 개요

### 포함된 것

- **React 컴포넌트 7개** — 로그인, 약관 동의, 마이페이지, 계정 삭제, OAuth 콜백, 유저 메뉴, 로그인 버튼
- **UI 프리미티브 4개** — `Button`, `Spinner`, `GoogleIcon`, `MarbleAvatar`
- **타입** — `Locale`, `Theme`, `AuthUser`, `TermItem`, `TranslationOverrides`
- **i18n** — 자체 `t()` 함수 + ko-KR / en-US 번역 사전 (오버라이드 가능)
- **유틸** — `cn` (Tailwind 클래스 머지)

### 포함되지 **않는** 것

- ❌ Supabase client / `@supabase/supabase-js` 호출
- ❌ 세션 관리 (Zustand store, localStorage, 쿠키)
- ❌ OAuth 리다이렉트 / 콜백 처리
- ❌ `user_agreements` 같은 DB 스키마 의존 쿼리
- ❌ Next.js 서버 유틸 / 라우트 핸들러
- ❌ `next/*` 모듈 import (Tauri/Vite 호환을 위해)

### 설계 원칙

1. **Props-only** — 모든 상태와 동작은 props로 주입 (`user`, `onGoogleLogin`, `onSignOut` 등)
2. **Framework-agnostic** — `next/link`, `next/navigation`, `next/image` 등 사용 금지. 필요하면 callback prop으로 위임 (`onRoute(destination)`, `logoHref` 등)
3. **DI 우선** — Supabase client, 라우터, 번역 함수 등을 절대 직접 import하지 않음
4. **슬롯 패턴** — `TermsAgreementView.headerSlot` 같이 앱별로 다른 부분은 ReactNode로 받음
5. **"use client"** — 모든 컴포넌트에 `"use client"` 디렉티브. Next는 인식, Vite는 no-op → 양쪽 호환

---

## 2. 설치

### pnpm 워크스페이스 (현재 monorepo)

루트 `package.json`:

```json
{
  "dependencies": {
    "@just-apps/auth": "workspace:*"
  }
}
```

Next.js 앱의 경우 `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  transpilePackages: ["@just-apps/auth"],
  // ...
};
```

### Peer Dependencies

소비 앱에 다음이 설치돼 있어야 합니다:

- `react` ^19
- `react-dom` ^19
- `lucide-react` ^1
- `boring-avatars` (MarbleAvatar 사용 시)
- `class-variance-authority`, `clsx`, `tailwind-merge` (Button / cn)

### Tailwind 설정

패키지 소스의 className이 최종 CSS에 포함되도록 Tailwind `content` 스캔 경로를 추가하세요.

**Tailwind v4 (globals.css):**

```css
@import "tailwindcss";
@source "../../packages/auth/src/**/*.{ts,tsx}";
```

**Tailwind v3 (tailwind.config.ts):**

```ts
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@just-apps/auth/src/**/*.{ts,tsx}",
  ],
  // ...
};
```

### 필요한 Tailwind 토큰

패키지 컴포넌트는 다음 CSS 변수 기반 색상을 사용합니다. 소비 앱의 디자인 시스템에 이 토큰들이 정의돼 있어야 합니다:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--accent`, `--accent-foreground`
- `--muted`, `--muted-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

> ⚠️ **주의**: `--secondary`와 `--card`가 너무 가까운 값이면 다크모드에서 영역 구분이 사라집니다. 충분한 명도 차이(최소 ~3%)를 유지하세요.

---

## 3. Quick Start

```tsx
import { LoginView } from "@just-apps/auth";
import { useAuth } from "@/stores/useAuth"; // 앱에서 구현한 auth store
import { useLocale } from "@/stores/useLocale"; // 앱에서 구현한 locale store

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

핵심 패턴: 패키지가 UI를 그리고, 앱이 상태와 동작을 주입한다. 역방향 의존성 없음.

---

## 4. Components API

### `<LoginView />`

Google OAuth 로그인 카드.

```tsx
interface LoginViewProps {
  locale: Locale;
  onGoogleLogin: () => void;
  translations?: TranslationOverrides;
}
```

| Prop | 설명 |
|---|---|
| `locale` | 표시 언어 (`"ko-KR"` / `"en-US"`) |
| `onGoogleLogin` | Google 버튼 클릭 시 호출. 앱의 OAuth flow 시작 함수 주입 |
| `translations` | (선택) 앱별 번역 오버라이드 |

**예제:**

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

헤더 등에 쓰는 작은 "로그인" 버튼.

```tsx
interface LoginButtonProps {
  locale: Locale;
  onClick: () => void;
  translations?: TranslationOverrides;
}
```

---

### `<UserMenu />`

아바타 + 드롭다운 메뉴 (마이페이지 / 관리자 / 로그아웃).

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

| Prop | 설명 |
|---|---|
| `user` | `{ id, email?, created_at? }` — 앱의 세션 유저 객체 |
| `role` | `"admin"`이면 관리자 메뉴, 아니면 마이페이지 메뉴 |
| `onMyPage` / `onAdmin` / `onSignOut` | 각 메뉴 클릭 핸들러 |

**동작:**
- 바깥 클릭 시 닫힘 (mousedown 리스너)
- 아바타는 `MarbleAvatar`로 자동 생성 (이메일/ID 해시 기반)

---

### `<MyPageView />`

마이페이지 프로필 카드 + 로그아웃 / 계정 삭제 버튼.

```tsx
interface MyPageViewProps {
  locale: Locale;
  user: AuthUser;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  translations?: TranslationOverrides;
}
```

표시: 이메일, 가입일(`user.created_at` 기반, `toLocaleDateString`), 로그아웃 버튼, 계정 삭제 링크.

---

### `<TermsAgreementView />`

약관 동의 화면. 전체 페이지 레이아웃(헤더·푸터 포함)으로 렌더되며, 슬롯으로 커스터마이즈 가능.

```tsx
interface TermsAgreementViewProps {
  locale: Locale;
  theme: Theme;
  terms: TermItem[];
  onToggleLocale: () => void;
  onToggleTheme?: () => void;
  onSubmit: (agreed: Record<string, boolean>) => Promise<void>;
  termsViewUrl?: (type: string, locale: Locale) => string;
  logoText?: string;
  logoHref?: string;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  translations?: TranslationOverrides;
}
```

| Prop | 설명 |
|---|---|
| `terms` | 약관 항목 배열. 각 항목은 `{ id, type, title, required }` |
| `onSubmit` | 제출 시 호출. 인수는 `{ [type]: boolean }` 맵 (예: `{ terms_of_service: true, privacy_policy: true }`) |
| `termsViewUrl` | (선택) 각 약관 "보기" 링크 URL 생성 함수 |
| `logoText` / `logoHref` | (선택) 기본 헤더의 로고 (기본값 `"Just Apps"` / `"/"`) |
| `headerSlot` / `footerSlot` | (선택) 기본 헤더/푸터 대체 |
| `onToggleTheme` | (선택) 생략하면 테마 토글 버튼 숨김 (테마 강제 상황용) |

**기본 동작:**
- "전체 동의" 체크박스 → 모든 항목 토글
- 필수 약관 전부 체크돼야 제출 버튼 활성화
- 제출 중 로딩 스피너 표시

---

### `<AccountDeleteView />`

계정 삭제 경고 + 확인 2단계 UI.

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

**상태 머신:**

1. `user === null` → 로그인 안내 + Google 로그인 버튼
2. 로그인 상태 → "계정 삭제" 버튼
3. 클릭 → "정말 삭제하시겠습니까?" 확인 다이얼로그
4. 확인 → `onDelete()` 호출, 진행 중 로딩, 실패 시 에러 로그
5. 성공 → "계정이 삭제되었습니다" + 홈으로 버튼

---

### `<AuthCallbackView />`

OAuth 콜백 대기 화면 + 자동 라우팅 트리거.

```tsx
interface AuthCallbackViewProps {
  loading: boolean;
  user?: AuthUser | null;
  isNewUser?: boolean;
  onRoute: (destination: "login" | "terms" | "home") => void;
}
```

**로직:**

- `loading` 동안 스피너 표시
- 로딩 끝나면 `useEffect`에서 `onRoute(destination)` 호출:
  - `!user` → `"login"`
  - `isNewUser` → `"terms"`
  - 그 외 → `"home"`

앱은 `onRoute` 내부에서 자기 라우터(Next `useRouter`, react-router 등)로 실제 이동.

---

## 5. UI 프리미티브

### `<Button />`

shadcn 스타일 버튼. 5개 variant × 4개 size.

```tsx
import { Button, buttonVariants, type ButtonProps } from "@just-apps/auth";

<Button variant="outline" size="lg" onClick={...}>...</Button>
```

**Variants:** `default` | `destructive` | `outline` | `ghost` | `link`
**Sizes:** `default` | `sm` | `lg` | `icon`

`buttonVariants` cva 함수도 export되어 다른 컴포넌트에서 스타일 재사용 가능.

### `<Spinner />`

로딩 스피너 (`lucide-react`의 `Loader2` 래퍼).

```tsx
<Spinner size="lg" className="text-primary" />
```

Sizes: `sm` (16px) | `md` (24px, 기본) | `lg` (32px)

### `<GoogleIcon />`

Google 로고 SVG (공식 4색). `className` prop으로 크기 조절 (기본 `h-5 w-5`).

### `<MarbleAvatar />`

[boring-avatars](https://github.com/boringdesigners/boring-avatars) 기반 해시 아바타.

```tsx
<MarbleAvatar name={`justapps:${user.email ?? user.id}`} size={32} />
```

- 같은 `name` → 항상 같은 아바타 (결정적)
- 5색 팔레트 고정: `#818CF8 #C084FC #F472B6 #34D399 #60A5FA`
- `justapps:` 프리픽스 권장 (다른 서비스의 같은 이메일과 충돌 방지)

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
  type: string;       // 예: "terms_of_service", "privacy_policy", "marketing"
  title: string;
  required: boolean;
  content?: string;
}

export type TranslationOverrides = Partial<
  Record<string, Record<Locale, string>>
>;
```

> `AuthUser`는 의도적으로 Supabase의 `User` 타입과 구조적으로 호환되게 좁혀져 있습니다. Supabase 세션에서 꺼낸 객체를 그대로 넘겨도 동작합니다.

---

## 7. i18n

### `t()` 함수

```ts
import { t } from "@just-apps/auth";

t("login.title", "ko-KR");        // "로그인"
t("login.title", "en-US");        // "Login"
t("missing.key", "ko-KR");        // "missing.key" (fallback: key 그대로)
```

### 번역 오버라이드

앱별로 특정 키의 문구만 바꾸고 싶을 때:

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

오버라이드된 키는 해당 컴포넌트 트리 내에서만 적용됩니다 (전역 X).

### 번역 키 전체 목록

| Namespace | Keys |
|---|---|
| `login.*` | `title`, `subtitle`, `google` |
| `terms.*` | `title`, `subtitle`, `agree_all`, `required`, `optional`, `agree_suffix`, `view`, `submit` |
| `mypage.*` | `title`, `email`, `joined`, `delete_account`, `logout` |
| `delete.*` | `title`, `subtitle`, `login_required`, `login`, `data_title`, `data_email`, `data_agreements`, `data_activity`, `warning`, `confirm_button`, `confirm_title`, `confirm_message`, `confirm_yes`, `confirm_cancel`, `processing`, `success` |
| `usermenu.*` | `admin`, `admin_badge`, `mypage`, `logout` |
| `common.*` | `loading`, `auth_processing`, `login`, `go_home` |
| `footer.*` | `copyright` |

키 타입 안전성이 필요하면:

```ts
import type { TranslationKey } from "@just-apps/auth";
```

---

## 8. 앱 통합 가이드

### Next.js (이 저장소)

현재 홈페이지의 adapter 패턴:

**`src/components/common/UserMenu.tsx`** — 앱 상태를 주입하는 얇은 래퍼:

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

**원칙**: 페이지 shell (라우팅, 세션 접근, 헤더/푸터 조립)은 앱에, presentational 껍데기는 패키지에.

### Tauri / Vite 앱

기본적으로 Next와 동일 패턴:

```tsx
// packages/xxx-tauri-app/src/pages/Login.tsx
import { LoginView } from "@just-apps/auth";
import { supabase } from "./lib/supabase"; // Tauri 앱의 자체 Supabase client

export function LoginPage() {
  return (
    <LoginView
      locale="ko-KR"
      onGoogleLogin={async () => {
        // Tauri용 loopback OAuth flow
        await startLoopbackOAuth();
      }}
    />
  );
}
```

**주의사항:**

1. Tauri 앱의 Tailwind 설정에 패키지 경로 추가 필요
2. OAuth redirect는 Next처럼 `window.location.origin + "/auth/callback"`을 쓸 수 없음 → loopback 서버 / deep link 사용
3. `next/*` import는 패키지 안에 단 하나도 없으므로 Tauri 빌드에 문제 없음

---

## 9. FAQ

**Q. Supabase client를 패키지가 들고 있으면 안 되나요?**
A. 안 됩니다. 패키지가 `@supabase/supabase-js`를 import하는 순간 앱마다 중복 인스턴스가 생기고, 세션 singleton이 깨지며, SSR cookie adapter 같은 프레임워크 의존이 끼어듭니다. 과거 시도에서 이것 때문에 전체 롤백한 적 있습니다 (`9c1f98e`). 각 앱이 자기 client를 만들고 props/callback으로 주입하세요.

**Q. `useAuth` 같은 hook을 패키지에 넣으면 안 되나요?**
A. auth store는 앱마다 스키마가 다릅니다 (`user_agreements` 테이블, `role` 컬럼, 약관 규칙 등). 일반화하려면 모든 것을 DI로 받아야 해서 배보다 배꼽이 커집니다. 앱별로 직접 구현하세요.

**Q. 다크모드 색상이 이상해요.**
A. 이 패키지는 Tailwind CSS 토큰(`--card`, `--secondary` 등)을 소비 앱의 디자인 시스템에 의존합니다. 특히 `--secondary`와 `--card`가 가까운 값이면 영역 구분이 안 됩니다. 소비 앱의 `globals.css` 다크 토큰을 조정하거나, 해당 컴포넌트의 Tailwind 클래스를 조정해주세요.

**Q. Tauri에서도 `"use client"` 디렉티브가 필요한가요?**
A. 필요 없지만 무해합니다. Vite는 이 디렉티브를 무시하고, Next에서는 필수이므로 양쪽 호환을 위해 그대로 둡니다.

**Q. i18n 오버라이드 말고 새 언어 추가는요?**
A. 현재 `Locale` 타입이 `"ko-KR" | "en-US"` 두 개로 하드코딩돼 있습니다. 새 언어가 필요하면 패키지 자체 수정이 필요합니다.

---

## 10. 버전 / 변경 이력

현재 `0.0.0` (private workspace 전용). 외부 npm 배포는 아직 지원하지 않습니다. 버전 정책 / changelog는 추후 Phase 7에서 도입 예정.

---

## 11. 관련 문서

- `docs/ROADMAP_PACKAGE_MIGRATION.md` — 패키지화 로드맵 & 설계 결정
- `packages/subscription/README.md` — 구독 UI 패키지 (자매 패키지)
- `README.md` (루트) — 전체 모노레포 구조
