# @just-apps/subscription

Just Apps shared **subscription UI component library**. A pure presentational library that the Next.js homepage and Tauri desktop apps use to share pricing / subscription status / upgrade / trial / payment-failure banner / post-payment activation waiting screens, and so on.

> **This package contains no subscription state management or payment logic.** The Supabase client, the `useSubscriptionStore` Zustand store, the Lemon Squeezy checkout hook, entitlement lookup hooks, and webhook handling are all implemented by the consuming app and injected via props. Swapping payment providers (Lemon Squeezy / Stripe, etc.) is also the app's concern.

---

## 1. Overview

### What's included

- **6 React components** — `PricingView`, `SubscriptionView`, `UpgradeModal`, `TrialBanner`, `PaymentFailedBanner`, `CheckoutActivation`
- **4 UI primitives** — `Badge` (8 variants), `Button`, `Modal`, `Spinner`
- **Types** — `PlanId`, `SubscriptionStatus`, `EntitlementSource`, `Subscription`, `Entitlement`, `Locale`, `TranslationOverrides`
- **Constants** — `PLAN_ENTITLEMENTS`, `PLAN_LABELS`
- **i18n** — built-in `t()` function (supports parameter substitution) + ko-KR / en-US
- **Utilities** — `cn`

### What's **not** included

- ❌ `useSubscriptionStore` / `useSubscription` / `useEntitlement` / `useAllEntitlements` hooks (live in the app)
- ❌ `useCheckout` hook — loads the Lemon Squeezy script + polls an API endpoint → lives in the app
- ❌ Supabase table queries (`just_entitlements`, `just_subscriptions`)
- ❌ Server-only `hasAccess()`
- ❌ Lemon Squeezy webhook handlers
- ❌ Admin grant/revoke APIs

### Design principles

Same as the auth package:

1. **Props-only** — all data (`subscription`, `entitlements`) and handlers (`onStartSubscription`, `onUpgrade`, `onPoll`) are passed as props
2. **Framework-agnostic** — no `next/*` imports; Tauri/Vite compatible
3. **Stateless components** — `useState` is used only for internal UI state (interval toggle, confirmation step, etc.); business state is injected from outside
4. **Provider-agnostic** — not coupled to Lemon Squeezy, Stripe, Paddle, or any specific provider

---

## 2. Installation

```bash
pnpm add @just-apps/subscription
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

**⚠️ This step is mandatory. If you skip it the components will render but look broken** — padding, background colors, borders, and margins will silently disappear.

Tailwind v4 (and v3) does **not** scan `node_modules` by default, so any utility class that is only used inside this package is purged from the final CSS unless you explicitly point Tailwind at the package.

Pick the snippet that matches how you consume the package:

**Tailwind v4 — installed from npm (the usual case):**

```css
@import "tailwindcss";
@source "../node_modules/@just-apps/subscription/dist/**/*.{js,mjs}";
```

The `dist` output is produced by tsup and preserves `className` strings as plain literals, so Tailwind's static scanner can pick them up. Adjust the relative path so it resolves from your CSS file to your project's `node_modules`.

**Tailwind v3 — installed from npm:**

```ts
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@just-apps/subscription/dist/**/*.{js,mjs}",
  ],
};
```

Required tokens (same as the auth package, plus the following):

- `--brand`, `--brand-foreground` — Pro emphasis color. Used by the Badge `active` / `admin` / `subscription` variants

---

## 3. Quick Start

Implement the app-side data layer first (Supabase store / hooks), then inject it into the package components.

```tsx
import { PricingView } from "@just-apps/subscription";
import { useSubscription, useCheckout } from "@/subscription"; // app hooks

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

Free / Pro two-plan cards + monthly/yearly interval toggle.

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

| Prop | Description |
|---|---|
| `currentPlanId` | The currently subscribed plan (`null` means Free) |
| `onSelectPlan` | Called when Pro is selected. `interval` reflects the internal toggle state |
| `freeFeatures` / `proFeatures` | (optional) Replace the default feature strings. Defaults exist per language |

**Behavior:**
- The monthly/yearly interval is internal `useState`
- The current plan's card shows a "Current plan" badge
- The Pro button shows a spinner while `isLoading`

---

### `<SubscriptionView />`

Subscription status card for the my page. Automatically branches into sections by state.

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

**State machine:**

| `subscription` state | Section shown | Active buttons |
|---|---|---|
| `null` | Empty state (card icon + "Start subscription") | `onStartSubscription` |
| `active` | Pro badge + expiry date + manage/cancel buttons | `onManageBilling`, `onCancelSubscription` |
| `canceled` | canceled badge + expiry date + resubscribe button | `onResubscribe` |
| `past_due` | past_due badge + `<PaymentFailedBanner />` | `onManageBilling` |
| `paused` | paused badge + resubscribe button | `onResubscribe` |
| `trialing` | trialing badge + days remaining + upgrade button | `onUpgrade` |

When `entitlements.length > 0`, an "Active entitlements" section is appended at the bottom of the card (listing badges per appId).

`isLoading` / `error` states replace the entire card with a loading/error placeholder.

---

### `<UpgradeModal />`

Upgrade-prompt modal shown from feature gates.

```tsx
interface UpgradeModalProps {
  locale: Locale;
  open: boolean;
  feature?: string;
  onUpgrade: () => void;
  onClose: () => void;
}
```

| Prop | Description |
|---|---|
| `feature` | (optional) Name of the gated feature. If present, produces a "To use X..." message |
| `onUpgrade` | Upgrade button click |

Built on the `<Modal />` primitive. ESC / outside click / focus trap are handled automatically.

---

### `<TrialBanner />`

Banner shown at the top of the page with the remaining trial time.

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

Payment failure notice. It's rendered automatically inside the `past_due` section of `SubscriptionView`, but you can also use it elsewhere if needed.

```tsx
interface PaymentFailedBannerProps {
  locale: Locale;
  onManageBilling: () => void;
}
```

---

### `<CheckoutActivation />`

Polling UI shown between payment completion and the backend webhook → entitlement reflection.

```tsx
interface CheckoutActivationProps {
  locale: Locale;
  /** Polling function called every 2s. Returning true means activation is complete. */
  onPoll: () => Promise<boolean>;
  onSuccess: () => void;
  onTimeout: () => void;
  maxWaitMs?: number; // default 30000
  intervalMs?: number; // default 2000
}
```

**Behavior:**

1. Calls `onPoll()` immediately on mount
2. Returning `true` → success UI (checkmark icon + "Activation complete") + `onSuccess()`
3. Returning `false` → retries after `intervalMs`
4. Exceeding `maxWaitMs` → timeout UI + `onTimeout()`
5. Throws from `onPoll` are ignored (tolerates flaky networks)

**Key point:** callback refs are stabilized via `useRef`, so consumers don't have to use `useCallback` to avoid infinite re-renders.

---

## 5. UI Primitives

### `<Badge />`

Badge with built-in color variants for subscription states / entitlement sources.

```tsx
import { Badge, type BadgeVariant } from "@just-apps/subscription";

<Badge variant="active">Pro</Badge>
```

**Variants (8):**

| Variant | Use | Default style |
|---|---|---|
| `active` | Active subscription | brand color |
| `trialing` | Trialing | accent |
| `canceled` | Canceled | muted |
| `expired` | Expired | muted + opacity-60 |
| `past_due` | Payment failed | destructive |
| `paused` | Paused | secondary |
| `admin` / `subscription` | Entitlement source | brand |
| `promo` / `trial` | Entitlement source | accent |
| `default` | Fallback | muted |

### `<Button />`

Same shadcn-style Button as the auth package (identical variants/sizes). Deduplication is possible later, but currently each package owns its own to stay independent.

### `<Modal />`

Accessibility-aware modal. ESC, outside click, focus trap (Tab cycling), and body scroll lock are handled automatically.

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;      // max-w-2xl vs max-w-md
  noPadding?: boolean; // removes inner padding
}
```

### `<Spinner />`

Same as the auth package (Loader2 wrapper).

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
  provider: string;         // "lemon_squeezy", etc.
  canceledAt: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
}

export interface Entitlement {
  appId: string;            // "logo", "insight", "mlb", etc.
  source: EntitlementSource;
  expiresAt: string | null;
}

export type TranslationOverrides = Partial<
  Record<string, Record<Locale, string>>
>;
```

---

## 7. Constants

### `PLAN_ENTITLEMENTS`

List of apps (appIds) bundled with each plan.

```ts
export const PLAN_ENTITLEMENTS: Record<string, string[]> = {
  just_apps_pro: ["logo"],
};
```

Represents the policy that buying Pro automatically grants the `logo` app's entitlement. Add to this array when adding a new Pro app.

### `PLAN_LABELS`

Plan labels for UI display.

```ts
export const PLAN_LABELS: Record<string, { ko: string; en: string }> = {
  just_apps_pro: { ko: "Pro", en: "Pro" },
};
```

> ⚠️ `just_apps_ult` exists in the type but is currently commented out in the constants. Enable it when the Ultimate plan launches.

---

## 8. i18n

### The `t()` function

Almost identical to the auth package, but with **parameter substitution**:

```ts
import { t } from "@just-apps/subscription";

t("trial.banner", "ko-KR", undefined, { days: "5" });
// → "트라이얼 5일 남음"

t("subscription.available_until", "ko-KR", undefined, { date: "2026년 5월 1일" });
// → "2026년 5월 1일까지 이용 가능"
```

`{key}` tokens inside a string are substituted with `params[key]`.

### Translation key namespaces

| Namespace | Purpose |
|---|---|
| `pricing.*` | PricingView (title, monthly/yearly, free/pro, current_plan, select, ...) |
| `subscription.*` | SubscriptionView (active, canceled, past_due, paused, trialing, available_until, manage_billing, cancel, resubscribe, start, none, ...) |
| `trial.*` | TrialBanner (banner, upgrade) |
| `upgrade.*` | UpgradeModal (title, description, description.feature, button, cancel) |
| `payment_failed.*` | PaymentFailedBanner (title, description, action) |
| `checkout.*` | CheckoutActivation (activating, success, timeout) |
| `app.*` | `app.{appId}` — per-appId label (for entitlement badges, etc.) |
| `common.*` | Shared (error, etc.) |

See `packages/subscription/src/i18n/translations.ts` for the exact key list.

### Override pattern

Same as auth:

```tsx
<PricingView
  locale="ko-KR"
  currentPlanId={null}
  isLoading={false}
  onSelectPlan={...}
  // no translations prop — PricingView currently doesn't support overrides (uses defaults)
/>
```

> ⚠️ Some components don't have a `translations` prop. If you need it, add the prop to the specific component (see the auth/TermsAgreementView pattern).

---

## 9. App integration guide

### Next.js (this repo)

**Core split of responsibilities:**

- `src/subscription/stores/useSubscriptionStore.ts` — Zustand store, Supabase table queries
- `src/subscription/hooks/use-subscription.ts` — store selector
- `src/subscription/hooks/use-entitlement.ts` — per-appId entitlement lookup
- `src/subscription/hooks/use-checkout.ts` — loads the Lemon Squeezy script + fetches the checkout API + polls
- `@just-apps/subscription` → **UI only**

**Integration example (`src/views/MyPage.tsx`):**

```tsx
import { SubscriptionView } from "@just-apps/subscription";
import {
  useSubscription,
  useAllEntitlements,
  useCheckout,
  useSubscriptionStore,
} from "@/subscription"; // app hooks

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

### Tauri / Vite apps

The Tauri app implements its own subscription store and checkout flow. Only the UI components are reused:

```tsx
// packages/just-cut/src/pages/Pricing.tsx
import { PricingView } from "@just-apps/subscription";
import { useSubscription } from "./lib/subscription-store"; // the Tauri app's own store

export function PricingPage() {
  const { subscription } = useSubscription();

  return (
    <PricingView
      locale="ko-KR"
      currentPlanId={subscription?.planId ?? null}
      isLoading={false}
      onSelectPlan={async (planId, interval) => {
        // Tauri: open the checkout URL in the browser
        const { url } = await fetchCheckoutUrl(planId, interval);
        await open(url); // @tauri-apps/api/shell
      }}
    />
  );
}
```

---

## 10. Server / API contract

This package does not provide a server API, but the homepage app is structured as below and Tauri apps can reuse the same components by implementing something similar:

- `POST /api/checkout` → `{ url: string }` (Lemon Squeezy checkout URL)
- `GET /api/subscription/status` → `{ hasActiveSubscription: boolean }` (for polling)
- `POST /api/subscription/cancel` → cancel subscription
- `POST /api/webhooks/lemon-squeezy` → receive webhooks (provider → DB reflection)

The `useCheckout` hook's `checkoutApiUrl` and `statusApiUrl` options point at these endpoints. A Tauri app can reuse the same hook by pointing them at its own backend (or a Supabase Edge Function) URLs.

---

## 11. DB schema assumptions

Supabase tables queried by `useSubscriptionStore` (on the app side):

### `just_subscriptions`

| Column | Type | Note |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users |
| `plan_id` | text | `just_apps_pro`, etc. |
| `status` | text | `active` / `trialing` / `past_due` / ... |
| `provider` | text | `lemon_squeezy` |
| `canceled_at` | timestamptz | nullable |
| `current_period_end` | timestamptz | nullable |
| `trial_ends_at` | timestamptz | nullable |
| `created_at` | timestamptz | |

### `just_entitlements`

| Column | Type | Note |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | |
| `app_id` | text | `logo`, `insight`, `mlb`, etc. |
| `source` | text | `subscription` / `admin` / `promo` / `trial` |
| `expires_at` | timestamptz | nullable |

The RLS policy allows SELECT where `user_id = auth.uid()`. Writes go through the server (service_role) or admin APIs.

> ⚠️ **For another app to reuse this package's types as-is, it must follow the same schema.** If the schema differs, write the store in the app and build a mapping layer against the package types.

---

## 12. FAQ

**Q. Why isn't the `useCheckout` hook in the package?**
A. It mixes a hardcoded Lemon Squeezy script URL, a dependency on the `/api/checkout` Next API endpoint, polling logic, and so on — it crosses the "pure UI" boundary. A version with only the endpoint as an option is theoretically possible, but Tauri apps are likely to use a completely different provider instead of Lemon Squeezy, so per-app implementations are currently cleaner.

**Q. `CheckoutActivation` contains polling logic — why is it in the package?**
A. The polling **function** is injected as the `onPoll` prop, so the package is only responsible for timer/state management. It doesn't call Supabase or a specific API directly. I drew the logic-vs-presentation line at "is the side effect injected via DI?"

**Q. The Badge variants are too subscription-centric. I want a general-purpose badge.**
A. The current Badge is optimized for this package's internal use. If you need a general-purpose Badge, split it into a separate UI package or build your own in the app.

**Q. When I add an app to PLAN_ENTITLEMENTS, where else do I need to change?**
A. Only `packages/subscription/src/constants.ts`. However, make sure that the entitlement row for that appId is actually inserted into the DB by checking the issuance logic in `src/app/api/webhooks/lemon-squeezy/route.ts`.

**Q. Does switching to Stripe require a lot of changes in this package?**
A. Almost none. The package components only know the `Subscription` / `Entitlement` types, and the provider name is just the `subscription.provider: string` field. As long as the Stripe webhook → the same tables in the same structure, the UI side keeps working as-is.

---

## 13. Versioning / changelog

Published to npm from [just-apps-kit](https://github.com/kihyun1998/just-apps-kit) via [Changesets](https://github.com/changesets/changesets). Each release's notes are in `CHANGELOG.md`. While the version is `0.x`, a minor bump may be breaking and `^0.x.y` ranges do not pick it up — bump consumers explicitly.

---

## 14. Related docs

- [`docs/ROADMAP_PACKAGE_MIGRATION.md`](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/ROADMAP_PACKAGE_MIGRATION.md) (just-apps-homepage) — packaging roadmap
- [`docs/ROADMAP_SUBSCRIPTION.md`](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/ROADMAP_SUBSCRIPTION.md) (just-apps-homepage) — subscription system design
- [`docs/SPEC_SUBSCRIPTION.md`](https://github.com/kihyun1998/just-apps-homepage/blob/main/docs/SPEC_SUBSCRIPTION.md) (just-apps-homepage) — subscription API / schema spec
- `packages/auth/README.md` — authentication UI package (sibling package)
