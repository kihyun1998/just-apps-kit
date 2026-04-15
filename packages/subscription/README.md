# @just-apps/subscription

Just Apps 공통 **구독(Subscription) UI 컴포넌트 라이브러리**. Next.js 홈페이지와 Tauri 데스크톱 앱들이 pricing / 구독 상태 / 업그레이드 / 트라이얼 / 결제 실패 배너 / 결제 후 활성화 대기 화면 등을 공유하기 위한 순수 presentational 라이브러리.

> **이 패키지는 구독 상태 관리나 결제 로직을 포함하지 않습니다.** Supabase client, `useSubscriptionStore` Zustand store, Lemon Squeezy 체크아웃 훅, entitlement 조회 hook, 웹훅 처리 등은 모두 소비 앱이 각자 구현하고 props로 주입합니다. 결제 provider (Lemon Squeezy / Stripe 등) 교체도 앱 영역입니다.

---

## 1. 개요

### 포함된 것

- **React 컴포넌트 6개** — `PricingView`, `SubscriptionView`, `UpgradeModal`, `TrialBanner`, `PaymentFailedBanner`, `CheckoutActivation`
- **UI 프리미티브 4개** — `Badge` (8 variant), `Button`, `Modal`, `Spinner`
- **타입** — `PlanId`, `SubscriptionStatus`, `EntitlementSource`, `Subscription`, `Entitlement`, `Locale`, `TranslationOverrides`
- **상수** — `PLAN_ENTITLEMENTS`, `PLAN_LABELS`
- **i18n** — 자체 `t()` 함수 (파라미터 치환 지원) + ko-KR / en-US
- **유틸** — `cn`

### 포함되지 **않는** 것

- ❌ `useSubscriptionStore` / `useSubscription` / `useEntitlement` / `useAllEntitlements` hooks (앱에 거주)
- ❌ `useCheckout` hook — Lemon Squeezy 스크립트 로드 + API 엔드포인트 폴링 → 앱 거주
- ❌ Supabase 테이블 쿼리 (`just_entitlements`, `just_subscriptions`)
- ❌ 서버 전용 `hasAccess()`
- ❌ Lemon Squeezy 웹훅 핸들러
- ❌ 관리자 grant/revoke API

### 설계 원칙

auth 패키지와 동일:

1. **Props-only** — 모든 데이터(`subscription`, `entitlements`)와 핸들러(`onStartSubscription`, `onUpgrade`, `onPoll`)를 props로
2. **Framework-agnostic** — `next/*` import 없음, Tauri/Vite 호환
3. **상태 없는 컴포넌트** — 내부 UI 상태(interval toggle, 확인 단계 등)만 `useState` 사용, 비즈니스 상태는 외부 주입
4. **Provider-agnostic** — Lemon Squeezy / Stripe / Paddle 어느 것에도 결합되지 않음

---

## 2. 설치

### pnpm 워크스페이스

```json
{
  "dependencies": {
    "@just-apps/subscription": "workspace:*"
  }
}
```

### Next.js

```ts
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ["@just-apps/subscription"],
};
```

### Peer Dependencies

- `react` ^19, `react-dom` ^19
- `lucide-react` ^1
- `class-variance-authority`, `clsx`, `tailwind-merge`

### Tailwind

```css
/* globals.css (Tailwind v4) */
@import "tailwindcss";
@source "../../packages/subscription/src/**/*.{ts,tsx}";
```

필요한 토큰 (auth 패키지와 동일 + 아래 추가):

- `--brand`, `--brand-foreground` — Pro 강조 색상. Badge `active` / `admin` / `subscription` variant에서 사용

---

## 3. Quick Start

앱 쪽 데이터 layer를 먼저 구현하고 (Supabase store / hook), 패키지 컴포넌트에 주입합니다.

```tsx
import { PricingView } from "@just-apps/subscription";
import { useSubscription, useCheckout } from "@/subscription"; // 앱 hook

export function PricingPage() {
  const { subscription } = useSubscription();
  const { startCheckout, status } = useCheckout();

  return (
    <PricingView
      locale="ko-KR"
      currentPlanId={subscription?.planId ?? null}
      isLoading={status === "loading"}
      onSelectPlan={(planId, interval) => startCheckout(interval)}
    />
  );
}
```

---

## 4. Components API

### `<PricingView />`

Free / Pro 2 플랜 카드 + 월/연 주기 토글.

```tsx
interface PricingViewProps {
  locale: Locale;
  currentPlanId: PlanId | null;
  isLoading: boolean;
  onSelectPlan: (planId: PlanId, interval: "monthly" | "yearly") => void;
  freeFeatures?: string[];
  proFeatures?: string[];
}
```

| Prop | 설명 |
|---|---|
| `currentPlanId` | 현재 구독 중인 플랜 (`null`이면 Free) |
| `onSelectPlan` | Pro 선택 시 호출. `interval`은 내부 토글 상태 |
| `freeFeatures` / `proFeatures` | (선택) 기본 feature 문구 대체. 언어별 기본값 존재 |

**동작:**
- 월/연 주기는 컴포넌트 내부 `useState`
- 현재 플랜 카드에는 "현재 플랜" 배지
- Pro 버튼은 `isLoading` 시 스피너

---

### `<SubscriptionView />`

마이페이지용 구독 상태 카드. 상태별 섹션 자동 분기.

```tsx
interface SubscriptionViewProps {
  locale: Locale;
  subscription: Subscription | null;
  entitlements: Entitlement[];
  isLoading: boolean;
  error: Error | null;
  onStartSubscription: () => void;
  onCancelSubscription: () => void;
  onResubscribe: () => void;
  onManageBilling: () => void;
  onUpgrade: () => void;
}
```

**상태 머신:**

| `subscription` 상태 | 표시되는 섹션 | 활성 버튼 |
|---|---|---|
| `null` | 빈 상태 (카드 아이콘 + "구독 시작") | `onStartSubscription` |
| `active` | Pro 배지 + 만료일 + 관리/취소 버튼 | `onManageBilling`, `onCancelSubscription` |
| `canceled` | canceled 배지 + 만료일 + 재구독 버튼 | `onResubscribe` |
| `past_due` | past_due 배지 + `<PaymentFailedBanner />` | `onManageBilling` |
| `paused` | paused 배지 + 재구독 버튼 | `onResubscribe` |
| `trialing` | trialing 배지 + 남은 일수 + 업그레이드 버튼 | `onUpgrade` |

`entitlements.length > 0`이면 카드 하단에 "활성 권한" 섹션 추가 (appId별 Badge 나열).

`isLoading` / `error` 상태는 카드 전체를 로딩/에러 placeholder로 교체.

---

### `<UpgradeModal />`

기능 게이트에서 띄우는 업그레이드 유도 모달.

```tsx
interface UpgradeModalProps {
  locale: Locale;
  open: boolean;
  feature?: string;
  onUpgrade: () => void;
  onClose: () => void;
}
```

| Prop | 설명 |
|---|---|
| `feature` | (선택) 차단된 기능 이름. 있으면 "X 기능을 사용하려면..." 형태 메시지 |
| `onUpgrade` | 업그레이드 버튼 클릭 |

`<Modal />` 프리미티브 기반. ESC / 바깥 클릭 / 포커스 트랩 자동 처리.

---

### `<TrialBanner />`

페이지 상단에 표시하는 트라이얼 남은 기간 배너.

```tsx
interface TrialBannerProps {
  locale: Locale;
  daysLeft: number;
  onUpgrade: () => void;
}
```

```tsx
<TrialBanner locale="ko-KR" daysLeft={5} onUpgrade={() => router.push("/pricing")} />
```

---

### `<PaymentFailedBanner />`

결제 실패 알림. `SubscriptionView`의 `past_due` 섹션에서 자동 렌더되기도 하지만, 필요하면 다른 곳에서도 사용 가능.

```tsx
interface PaymentFailedBannerProps {
  locale: Locale;
  onManageBilling: () => void;
}
```

---

### `<CheckoutActivation />`

결제 완료 후 백엔드가 webhook → entitlement 반영까지 걸리는 시간 동안 보여주는 폴링 UI.

```tsx
interface CheckoutActivationProps {
  locale: Locale;
  /** 2초 간격으로 호출되는 폴링 함수. true 반환 시 활성화 완료. */
  onPoll: () => Promise<boolean>;
  onSuccess: () => void;
  onTimeout: () => void;
  maxWaitMs?: number; // 기본 30000
  intervalMs?: number; // 기본 2000
}
```

**동작:**

1. 마운트 즉시 `onPoll()` 호출
2. `true` 반환 → 성공 UI (체크 아이콘 + "활성화 완료") + `onSuccess()`
3. `false` 반환 → `intervalMs` 후 재시도
4. `maxWaitMs` 초과 → 타임아웃 UI + `onTimeout()`
5. `onPoll`이 throw해도 무시 (네트워크 불안정 대응)

**핵심:** 콜백 참조는 `useRef`로 안정화돼서 소비 측이 `useCallback`을 안 써도 무한 재렌더링 없음.

---

## 5. UI 프리미티브

### `<Badge />`

구독 상태 / entitlement 소스별 색상 variant가 내장된 배지.

```tsx
import { Badge, type BadgeVariant } from "@just-apps/subscription";

<Badge variant="active">Pro</Badge>
```

**Variants (8개):**

| Variant | 용도 | 기본 스타일 |
|---|---|---|
| `active` | 활성 구독 | brand 색상 |
| `trialing` | 트라이얼 | accent |
| `canceled` | 취소됨 | muted |
| `expired` | 만료 | muted + opacity-60 |
| `past_due` | 결제 실패 | destructive |
| `paused` | 일시정지 | secondary |
| `admin` / `subscription` | entitlement 소스 | brand |
| `promo` / `trial` | entitlement 소스 | accent |
| `default` | 폴백 | muted |

### `<Button />`

auth 패키지의 Button과 동일한 shadcn 스타일 (동일 variant/size). 중복 정의는 향후 통합 가능하지만 현재는 패키지 독립성 유지를 위해 각자 소유.

### `<Modal />`

접근성 대응 모달. ESC, 바깥 클릭, 포커스 트랩(Tab 순환), body scroll lock 자동 처리.

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;      // max-w-2xl vs max-w-md
  noPadding?: boolean; // 내부 padding 제거
}
```

### `<Spinner />`

auth 패키지와 동일 (Loader2 래퍼).

---

## 6. Types

```ts
export type Locale = "ko-KR" | "en-US";

export type PlanId = "just_apps_pro" | "just_apps_ult";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "paused"
  | "trialing";

export type EntitlementSource = "subscription" | "admin" | "promo" | "trial";

export interface Subscription {
  id: string;
  planId: PlanId;
  status: SubscriptionStatus;
  provider: string;         // "lemon_squeezy" 등
  canceledAt: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
}

export interface Entitlement {
  appId: string;            // "logo", "insight", "mlb" 등
  source: EntitlementSource;
  expiresAt: string | null;
}

export type TranslationOverrides = Partial<
  Record<string, Record<Locale, string>>
>;
```

---

## 7. 상수

### `PLAN_ENTITLEMENTS`

플랜별로 포함되는 앱(appId) 목록.

```ts
export const PLAN_ENTITLEMENTS: Record<string, string[]> = {
  just_apps_pro: ["logo"],
};
```

Pro 구매 시 `logo` 앱에 대한 entitlement가 자동 부여되는 정책을 표현. 새 Pro 앱 추가 시 이 배열에 추가.

### `PLAN_LABELS`

UI 표시용 플랜 라벨.

```ts
export const PLAN_LABELS: Record<string, { ko: string; en: string }> = {
  just_apps_pro: { ko: "Pro", en: "Pro" },
};
```

> ⚠️ `just_apps_ult`는 타입에는 있지만 현재 상수에서는 주석 처리. Ultimate 플랜 도입 시 활성화.

---

## 8. i18n

### `t()` 함수

auth 패키지와 거의 동일하지만 **파라미터 치환** 기능이 추가됨:

```ts
import { t } from "@just-apps/subscription";

t("trial.banner", "ko-KR", undefined, { days: "5" });
// → "트라이얼 5일 남음"

t("subscription.available_until", "ko-KR", undefined, { date: "2026년 5월 1일" });
// → "2026년 5월 1일까지 이용 가능"
```

문자열 내 `{key}` 토큰이 `params[key]` 값으로 치환됩니다.

### 번역 키 Namespace

| Namespace | 용도 |
|---|---|
| `pricing.*` | PricingView (title, monthly/yearly, free/pro, current_plan, select, ...) |
| `subscription.*` | SubscriptionView (active, canceled, past_due, paused, trialing, available_until, manage_billing, cancel, resubscribe, start, none, ...) |
| `trial.*` | TrialBanner (banner, upgrade) |
| `upgrade.*` | UpgradeModal (title, description, description.feature, button, cancel) |
| `payment_failed.*` | PaymentFailedBanner (title, description, action) |
| `checkout.*` | CheckoutActivation (activating, success, timeout) |
| `app.*` | `app.{appId}` — appId별 레이블 (entitlement 배지 등) |
| `common.*` | 공통 (error 등) |

정확한 키 리스트는 `packages/subscription/src/i18n/translations.ts` 참조.

### 오버라이드 패턴

auth와 동일:

```tsx
<PricingView
  locale="ko-KR"
  currentPlanId={null}
  isLoading={false}
  onSelectPlan={...}
  // translations prop 없음 — PricingView는 현재 오버라이드 미지원 (기본 번역 사용)
/>
```

> ⚠️ 일부 컴포넌트는 `translations` prop이 없습니다. 필요하면 각 컴포넌트에 prop 추가 필요 (auth/TermsAgreementView 패턴 참고).

---

## 9. 앱 통합 가이드

### Next.js (이 저장소)

**핵심 분업:**

- `src/subscription/stores/useSubscriptionStore.ts` — Zustand store, Supabase 테이블 쿼리
- `src/subscription/hooks/use-subscription.ts` — store selector
- `src/subscription/hooks/use-entitlement.ts` — appId별 entitlement 조회
- `src/subscription/hooks/use-checkout.ts` — Lemon Squeezy 스크립트 로드 + checkout API fetch + polling
- `@just-apps/subscription` → **UI만**

**통합 예제 (`src/views/MyPage.tsx`):**

```tsx
import { SubscriptionView } from "@just-apps/subscription";
import {
  useSubscription,
  useAllEntitlements,
  useCheckout,
  useSubscriptionStore,
} from "@/subscription"; // 앱 hooks

export function MyPage() {
  const { subscription, isLoading: subLoading, error: subError } = useSubscription();
  const { entitlements, isLoading: entLoading, error: entError } = useAllEntitlements();
  const refetchSub = useSubscriptionStore((s) => s.refetch);
  const { startCheckout } = useCheckout({ onSuccess: () => refetchSub() });

  return (
    <SubscriptionView
      locale={locale}
      subscription={subscription}
      entitlements={entitlements}
      isLoading={subLoading || entLoading}
      error={subError || entError}
      onStartSubscription={() => startCheckout("monthly")}
      onCancelSubscription={() => setCancelDialogOpen(true)}
      onResubscribe={() => startCheckout("monthly")}
      onManageBilling={() => window.open(BILLING_PORTAL_URL, "_blank")}
      onUpgrade={() => startCheckout("monthly")}
    />
  );
}
```

### Tauri / Vite 앱

Tauri 앱은 자체 subscription store와 checkout flow를 구현합니다. UI 컴포넌트만 재사용:

```tsx
// packages/just-cut/src/pages/Pricing.tsx
import { PricingView } from "@just-apps/subscription";
import { useSubscription } from "./lib/subscription-store"; // Tauri 앱 자체 store

export function PricingPage() {
  const { subscription } = useSubscription();

  return (
    <PricingView
      locale="ko-KR"
      currentPlanId={subscription?.planId ?? null}
      isLoading={false}
      onSelectPlan={async (planId, interval) => {
        // Tauri용: 브라우저로 체크아웃 URL 열기
        const { url } = await fetchCheckoutUrl(planId, interval);
        await open(url); // @tauri-apps/api/shell
      }}
    />
  );
}
```

---

## 10. 서버 / API 계약

이 패키지는 서버 API를 제공하지 않지만, 홈페이지 앱은 다음과 같이 구성되어 있고 Tauri 앱도 유사하게 구현하면 기존 컴포넌트를 그대로 쓸 수 있습니다:

- `POST /api/checkout` → `{ url: string }` (Lemon Squeezy checkout URL)
- `GET /api/subscription/status` → `{ hasActiveSubscription: boolean }` (폴링용)
- `POST /api/subscription/cancel` → 구독 취소
- `POST /api/webhooks/lemon-squeezy` → 웹훅 수신 (provider → DB 반영)

`useCheckout` hook의 `checkoutApiUrl`, `statusApiUrl` 옵션은 이 엔드포인트를 가리킵니다. Tauri 앱은 자기 백엔드(or Supabase Edge Function) URL로 바꿔서 동일 hook 재활용 가능.

---

## 11. DB 스키마 가정

`useSubscriptionStore`(앱 쪽)가 쿼리하는 Supabase 테이블:

### `just_subscriptions`

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users |
| `plan_id` | text | `just_apps_pro` 등 |
| `status` | text | `active` / `trialing` / `past_due` / ... |
| `provider` | text | `lemon_squeezy` |
| `canceled_at` | timestamptz | nullable |
| `current_period_end` | timestamptz | nullable |
| `trial_ends_at` | timestamptz | nullable |
| `created_at` | timestamptz | |

### `just_entitlements`

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | |
| `app_id` | text | `logo`, `insight`, `mlb` 등 |
| `source` | text | `subscription` / `admin` / `promo` / `trial` |
| `expires_at` | timestamptz | nullable |

RLS 정책은 `user_id = auth.uid()` 기반 SELECT 허용. 쓰기는 서버(service_role) 또는 관리자 API 경유.

> ⚠️ **다른 앱이 이 패키지의 타입을 그대로 쓰려면 동일 스키마를 따라야 합니다.** 스키마가 다르면 store는 앱에서 직접 작성하고, 패키지 타입과 매핑 레이어를 만드세요.

---

## 12. FAQ

**Q. 왜 `useCheckout` hook이 패키지에 없나요?**
A. Lemon Squeezy 스크립트 URL 하드코딩, `/api/checkout` 같은 Next API 엔드포인트 의존, polling 로직 등이 섞여 있어서 "순수 UI" 경계를 넘습니다. 엔드포인트만 옵션으로 뺀 버전은 이론상 가능하지만, Tauri 앱은 Lemon Squeezy 대신 완전히 다른 provider를 쓸 가능성이 높아서 현재는 앱별 구현이 더 깔끔합니다.

**Q. `CheckoutActivation`은 폴링 로직이 있는데 왜 패키지에 있나요?**
A. 폴링 **함수**를 `onPoll` prop으로 주입받기 때문에 패키지는 타이머/상태 관리만 담당합니다. Supabase나 특정 API를 직접 호출하지 않습니다. 로직 vs 표현의 경계를 "외부 효과가 DI인가"로 판단했습니다.

**Q. Badge의 variant가 너무 구독 중심이에요. 범용으로 쓰고 싶어요.**
A. 현재 Badge는 이 패키지의 내부 사용에 최적화돼 있습니다. 범용 Badge가 필요하면 별도 UI 패키지로 분리하거나 앱에서 자체 Badge를 만드세요.

**Q. PLAN_ENTITLEMENTS에 앱을 추가하면 어디를 같이 바꿔야 하나요?**
A. `packages/subscription/src/constants.ts` 한 곳만 바꾸면 됩니다. 단, 해당 appId의 entitlement row가 실제로 DB에 들어가도록 `src/app/api/webhooks/lemon-squeezy/route.ts`의 발급 로직을 점검하세요.

**Q. Stripe로 바꾸면 이 패키지 수정이 많이 필요한가요?**
A. 거의 없습니다. 패키지 컴포넌트는 `Subscription` / `Entitlement` 타입만 알고, provider 이름은 `subscription.provider: string` 필드뿐입니다. Stripe webhook → 같은 테이블에 동일 구조로 upsert하면 UI 쪽은 그대로 동작합니다.

---

## 13. 버전 / 변경 이력

현재 `0.0.0` (private workspace 전용).

---

## 14. 관련 문서

- `docs/ROADMAP_PACKAGE_MIGRATION.md` — 패키지화 로드맵
- `docs/ROADMAP_SUBSCRIPTION.md` — 구독 시스템 설계
- `docs/SPEC_SUBSCRIPTION.md` — 구독 API / 스키마 명세
- `packages/auth/README.md` — 인증 UI 패키지 (자매 패키지)
