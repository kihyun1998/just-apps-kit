# @just-apps/subscription

Shared subscription UI components, hooks, and types for Just Apps ecosystem.

One subscription covers all Just Apps — this package provides the full client-side integration: Zustand store, React hooks, UI components, and bilingual i18n (ko-KR / en-US).

## Installation

```bash
pnpm add @just-apps/subscription
```

### Peer Dependencies

```json
{
  "@supabase/supabase-js": ">=2",
  "react": ">=18",
  "react-dom": ">=18",
  "zustand": ">=4"
}
```

### TailwindCSS

This package uses TailwindCSS classes and CSS variables. Your app's Tailwind config must include the package path:

```ts
// tailwind.config.ts
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@just-apps/subscription/src/**/*.{ts,tsx}", // add this
  ],
};
```

Required CSS variables (set in your global CSS):

```css
--brand        /* brand accent color */
--background
--foreground
--card
--border
--muted
--muted-foreground
--destructive
```

---

## Quick Start

### 1. Initialize the store (auth integration)

The subscription store must be initialized after authentication. Connect it to your auth store:

```ts
// stores/useAuth.ts
import { useSubscriptionStore } from "@just-apps/subscription";
import { supabase } from "@/lib/supabase";

// On sign-in:
const subStore = useSubscriptionStore.getState();
if (subStore.initialized) {
  subStore.refetch();
} else {
  subStore.init(supabase);
}

// On sign-out:
useSubscriptionStore.getState().clear();

// On window focus (refetch stale data):
window.addEventListener("focus", () => {
  if (currentUser) {
    useSubscriptionStore.getState().refetch();
  }
});
```

### 2. Check entitlements (client-side)

```tsx
import { useEntitlement } from "@just-apps/subscription";

function MyFeature() {
  const { hasPro, isLoading, error, source } = useEntitlement("logo");

  if (isLoading) return <Spinner />;
  if (!hasPro) return <UpgradePrompt />;
  return <ProFeature />;
}
```

### 3. Check access (server-side)

```ts
// lib/subscription-server.ts
import "server-only";
import { supabaseAdmin } from "./supabase-admin";

export async function hasAccess(userId: string, appId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("just_entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("app_id", appId)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to check access: ${error.message}`);
  return data !== null;
}
```

> `hasAccess()` is implemented per-app (not in this package) because it requires `server-only` and `supabaseAdmin` (service_role key).

---

## Hooks

### `useEntitlement(appId: string)`

Check Pro access for a specific app.

```ts
const {
  hasPro,       // boolean — true if active entitlement exists
  isLoading,    // boolean
  error,        // Error | null
  source,       // "subscription" | "admin" | "promo" | "trial" | null
  entitlements, // Entitlement[] — all active entitlements for this app
} = useEntitlement("logo");
```

- Filters out expired entitlements (`expires_at` < now)
- On error, `hasPro` defaults to `false` (safe fallback)

### `useAllEntitlements()`

Get all active entitlements across all apps.

```ts
const {
  entitlements, // Entitlement[]
  isLoading,    // boolean
  error,        // Error | null
} = useAllEntitlements();
```

### `useSubscription()`

Get the current subscription status.

```ts
const {
  subscription, // Subscription | null
  isLoading,    // boolean
  error,        // Error | null
} = useSubscription();
```

### `useSubscriptionStore`

Direct Zustand store access for advanced use cases.

```ts
import { useSubscriptionStore } from "@just-apps/subscription";

// Read state
const sub = useSubscriptionStore((s) => s.subscription);

// Actions
useSubscriptionStore.getState().init(supabase);
useSubscriptionStore.getState().refetch();
useSubscriptionStore.getState().clear();
```

**Store shape:**

| Field | Type | Description |
|-------|------|-------------|
| `entitlements` | `Entitlement[]` | Active entitlements |
| `subscription` | `Subscription \| null` | Current subscription |
| `isLoading` | `boolean` | Fetching state |
| `error` | `Error \| null` | Last error |
| `initialized` | `boolean` | Whether `init()` was called |

---

## Components

### `PricingView`

Plan comparison with billing interval toggle and plan selection.

```tsx
import { PricingView } from "@just-apps/subscription";

<PricingView
  locale="ko-KR"
  currentPlanId={null}        // null = free, "just_apps_pro" = pro
  isLoading={false}
  onSelectPlan={(planId, interval) => {
    // planId: "just_apps_pro"
    // interval: "monthly" | "yearly"
    startCheckout(planId, interval);
  }}
  // Optional: override default feature lists per app
  freeFeatures={["Basic logo creation", "Limited storage"]}
  proFeatures={["Advanced templates", "Expanded storage", "HD export"]}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | `"ko-KR"` or `"en-US"` |
| `currentPlanId` | `PlanId \| null` | Yes | Current plan, `null` for free |
| `isLoading` | `boolean` | Yes | Disables button during checkout |
| `onSelectPlan` | `(planId, interval) => void` | Yes | Called when user selects a plan |
| `freeFeatures` | `string[]` | No | Override Free plan feature list |
| `proFeatures` | `string[]` | No | Override Pro plan feature list |

Default features when not overridden:
- **Free:** Basic features, Limited storage
- **Pro:** Expanded storage, All premium features, New apps included

---

### `SubscriptionView`

Full subscription management panel. Renders different UI based on subscription status.

```tsx
import { useSubscription, useAllEntitlements, SubscriptionView } from "@just-apps/subscription";

function MyPage() {
  const { subscription, isLoading: subLoading, error: subError } = useSubscription();
  const { entitlements, isLoading: entLoading, error: entError } = useAllEntitlements();

  return (
    <SubscriptionView
      locale="ko-KR"
      subscription={subscription}
      entitlements={entitlements}
      isLoading={subLoading || entLoading}
      error={subError || entError}
      onStartSubscription={() => router.push("/pricing")}
      onCancelSubscription={() => cancelSubscription()}
      onResubscribe={() => router.push("/pricing")}
      onManageBilling={() => openBillingPortal()}
      onUpgrade={() => router.push("/pricing")}
    />
  );
}
```

**Status-based rendering:**

| Status | UI |
|--------|----|
| `null` (no subscription) | "No active subscription" + Start CTA |
| `active` | Plan info + period end + Cancel button |
| `canceled` | "Available until {date}" + Resubscribe CTA |
| `past_due` | PaymentFailedBanner + Manage billing |
| `paused` | Paused notice |
| `trialing` | Days left + Upgrade CTA |

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | |
| `subscription` | `Subscription \| null` | Yes | From `useSubscription()` |
| `entitlements` | `Entitlement[]` | Yes | From `useAllEntitlements()` |
| `isLoading` | `boolean` | Yes | |
| `error` | `Error \| null` | Yes | |
| `onStartSubscription` | `() => void` | Yes | No subscription → start |
| `onCancelSubscription` | `() => void` | Yes | Active → cancel |
| `onResubscribe` | `() => void` | Yes | Canceled → resubscribe |
| `onManageBilling` | `() => void` | Yes | Past due → fix payment |
| `onUpgrade` | `() => void` | Yes | Trialing → upgrade |

---

### `UpgradeModal`

Modal prompting upgrade when a Pro feature is accessed.

```tsx
import { UpgradeModal } from "@just-apps/subscription";

<UpgradeModal
  locale="ko-KR"
  open={showModal}
  feature="HD Export"           // optional — shown in description
  onUpgrade={() => startCheckout()}
  onClose={() => setShowModal(false)}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `Locale` | Yes | |
| `open` | `boolean` | Yes | Show/hide modal |
| `feature` | `string` | No | Feature name to display |
| `onUpgrade` | `() => void` | Yes | Upgrade button handler |
| `onClose` | `() => void` | Yes | Close handler |

---

### `PaymentFailedBanner`

Alert banner for `past_due` subscriptions.

```tsx
import { PaymentFailedBanner } from "@just-apps/subscription";

<PaymentFailedBanner
  locale="ko-KR"
  onManageBilling={() => openBillingPortal()}
/>
```

---

### `TrialBanner`

Banner showing trial days remaining with upgrade CTA.

```tsx
import { TrialBanner } from "@just-apps/subscription";

<TrialBanner
  locale="ko-KR"
  daysLeft={5}
  onUpgrade={() => startCheckout()}
/>
```

---

### `CheckoutActivation`

Post-checkout polling component. Shows spinner while waiting for webhook to activate subscription.

```tsx
import { CheckoutActivation } from "@just-apps/subscription";

<CheckoutActivation
  locale="ko-KR"
  onPoll={async () => {
    // Return true when subscription is active
    const res = await fetch("/api/subscription/status");
    const data = await res.json();
    return data.status === "active";
  }}
  onSuccess={() => router.push("/mypage")}
  onTimeout={() => showRetryMessage()}
  maxWaitMs={30000}   // default: 30s
  intervalMs={2000}   // default: 2s
/>
```

**States:** polling (spinner) → success (check icon) / timeout (clock icon)

---

## Types

```ts
type Locale = "ko-KR" | "en-US";

type PlanId = "just_apps_pro" | "just_apps_ult";

type SubscriptionStatus =
  | "active" | "past_due" | "canceled"
  | "expired" | "paused" | "trialing";

type EntitlementSource = "subscription" | "admin" | "promo" | "trial";

interface Subscription {
  id: string;
  planId: PlanId;
  status: SubscriptionStatus;
  provider: string;              // "lemonsqueezy" | "manual"
  canceledAt: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
}

interface Entitlement {
  appId: string;                 // e.g. "logo"
  source: EntitlementSource;
  expiresAt: string | null;      // null = permanent
}
```

---

## Constants

```ts
import { PLAN_ENTITLEMENTS, PLAN_LABELS } from "@just-apps/subscription";

// Which apps are included in each plan
PLAN_ENTITLEMENTS.just_apps_pro // ["logo"]

// Display labels
PLAN_LABELS.just_apps_pro // { ko: "Pro", en: "Pro" }
```

---

## i18n

Built-in translations for ko-KR and en-US. Use the `t()` function:

```ts
import { t } from "@just-apps/subscription";

t("pricing.title", "ko-KR");              // "요금제"
t("pricing.title", "en-US");              // "Pricing"
t("trial.banner", "ko-KR", undefined, { days: "5" }); // "Pro 체험 중 — 5일 남음"
```

**Signature:**

```ts
function t(
  key: string,
  locale: Locale,
  overrides?: TranslationOverrides,  // merge custom translations
  params?: Record<string, string>,   // replace {placeholder} tokens
): string;
```

**Available key prefixes:** `pricing.*`, `subscription.*`, `upgrade.*`, `payment_failed.*`, `trial.*`, `badge.*`, `app.*`, `checkout.*`, `common.*`

---

## Database Schema

This package reads from 4 Supabase tables (all prefixed `just_`):

### `just_subscriptions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → auth.users) | |
| `plan_id` | text | `"just_apps_pro"` |
| `status` | text | active, trialing, past_due, paused, canceled, expired |
| `provider` | text | `"lemonsqueezy"` or `"manual"` |
| `provider_subscription_id` | text | Lemon Squeezy subscription ID |
| `current_period_end` | timestamptz | |
| `trial_ends_at` | timestamptz | |
| `canceled_at` | timestamptz | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

**RLS:** User can SELECT own rows only. All writes via service_role.

**Indexes:**
- `user_id`
- `provider_subscription_id`
- Partial unique on `(user_id, plan_id)` WHERE status IN (active, trialing, past_due, paused)

### `just_entitlements`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → auth.users) | |
| `app_id` | text | e.g. `"logo"` |
| `source` | text | subscription, admin, promo, trial |
| `subscription_id` | uuid (FK → just_subscriptions, nullable) | Links subscription entitlements |
| `expires_at` | timestamptz | null = permanent |
| `created_at` | timestamptz | |

**RLS:** User can SELECT own active (non-expired) rows only.

**Indexes:**
- `(user_id, app_id)`
- Partial unique on `(user_id, app_id, subscription_id)` WHERE subscription_id IS NOT NULL
- Partial unique on `(user_id, app_id, source)` WHERE subscription_id IS NULL

### `just_trial_history`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `user_id` | uuid (UNIQUE, FK → auth.users) | One trial per user |
| `email` | text | UNIQUE on `lower(email)` |
| `created_at` | timestamptz | |

**RLS:** User can SELECT own row only.

### `just_webhook_logs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `provider_event_id` | text (UNIQUE) | Idempotency key |
| `event_name` | text | e.g. `subscription_created` |
| `payload` | jsonb | Raw webhook payload |
| `status` | text | processing, processed, failed, skipped |
| `error_message` | text | |
| `created_at` | timestamptz | |

**RLS:** No client access. service_role only.

---

## Full Integration Example

A complete example of integrating into a Next.js app:

```tsx
// stores/useAuth.ts — init subscription store on auth
import { useSubscriptionStore } from "@just-apps/subscription";

// In your auth init:
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    const sub = useSubscriptionStore.getState();
    if (sub.initialized) sub.refetch();
    else sub.init(supabase);
  } else {
    useSubscriptionStore.getState().clear();
  }
});

// On window focus:
window.addEventListener("focus", () => {
  if (currentUser) useSubscriptionStore.getState().refetch();
});
```

```tsx
// pages/mypage.tsx — subscription management
import {
  useSubscription,
  useAllEntitlements,
  SubscriptionView,
} from "@just-apps/subscription";

function MyPage() {
  const { subscription, isLoading: subLoading, error: subError } = useSubscription();
  const { entitlements, isLoading: entLoading, error: entError } = useAllEntitlements();

  return (
    <SubscriptionView
      locale="ko-KR"
      subscription={subscription}
      entitlements={entitlements}
      isLoading={subLoading || entLoading}
      error={subError || entError}
      onStartSubscription={() => router.push("/pricing")}
      onCancelSubscription={() => fetch("/api/subscription/cancel", { method: "POST" })}
      onResubscribe={() => router.push("/pricing")}
      onManageBilling={() => window.open(billingUrl)}
      onUpgrade={() => router.push("/pricing")}
    />
  );
}
```

```tsx
// Feature gating pattern
import { useEntitlement, UpgradeModal } from "@just-apps/subscription";

function ProFeatureButton() {
  const { hasPro, isLoading } = useEntitlement("logo");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleClick = () => {
    if (!hasPro) {
      setShowUpgrade(true);
      return;
    }
    doProThing();
  };

  return (
    <>
      <button onClick={handleClick} disabled={isLoading}>
        Save HD
      </button>
      <UpgradeModal
        locale="ko-KR"
        open={showUpgrade}
        feature="HD Export"
        onUpgrade={() => router.push("/pricing")}
        onClose={() => setShowUpgrade(false)}
      />
    </>
  );
}
```

```ts
// Server-side gating in API routes
import { hasAccess } from "@/lib/subscription-server";

export async function POST(request: Request) {
  const userId = session.user.id;

  if (!(await hasAccess(userId, "logo"))) {
    return Response.json({ error: "Pro required" }, { status: 403 });
  }

  // Pro-only logic...
}
```

---

## API Routes (app-side, not in this package)

These routes are implemented per-app using server utilities:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/checkout` | POST | Create Lemon Squeezy checkout URL |
| `/api/webhooks/lemon-squeezy` | POST | Handle payment webhooks |
| `/api/subscription/status` | GET | Poll subscription status |
| `/api/subscription/cancel` | POST | Cancel subscription |

---

## Package Exports

```ts
// Types
export type {
  Locale, TranslationOverrides, PlanId,
  SubscriptionStatus, EntitlementSource,
  Subscription, Entitlement,
};

// Constants
export { PLAN_ENTITLEMENTS, PLAN_LABELS };

// Store
export { useSubscriptionStore };

// Hooks
export { useEntitlement, useAllEntitlements, useSubscription };

// i18n
export { t, type TranslationKey };

// Components
export {
  PricingView, type PricingViewProps,
  UpgradeModal, type UpgradeModalProps,
  SubscriptionView, type SubscriptionViewProps,
  PaymentFailedBanner, type PaymentFailedBannerProps,
  TrialBanner, type TrialBannerProps,
  CheckoutActivation, type CheckoutActivationProps,
};
```
