# @just-apps/subscription

Just Apps shared **subscription package**, split into three entries so each app only pulls in what it uses:

| Entry | Contents | Runs on |
|---|---|---|
| `@just-apps/subscription` | UI components (subscription status, payment-failure banner) | client (`"use client"`) |
| `@just-apps/subscription/core` | types, the value lists they come from (`SUBSCRIPTION_STATUSES`, `ENTITLEMENT_SOURCES`, `PLAN_IDS` and their `is*` guards) and plan constants (`PLAN_ENTITLEMENTS`, `PLAN_LABELS`) | anywhere — import this from route handlers and other server code |
| `@just-apps/subscription/store` | `useSubscriptionStore` (Zustand, over the shared `just_entitlements` / `just_subscriptions` tables), `useSubscription`, `useEntitlement`, `useAllEntitlements`, `useCheckout` (Lemon Squeezy) | client (`"use client"`) |

> Webhook handling, admin grant/revoke APIs and the checkout / status endpoints stay in the app. The Supabase client is created by the app and handed to the store with `init(supabase)`.

---

## 1. Overview

### What's included

- **2 React components** — `SubscriptionView`, `PaymentFailedBanner`
- **3 internal UI primitives** — `Badge` (11 variants), `Button`, `Spinner`. The components use them; the package does not export them
- **Types** — `PlanId`, `SubscriptionStatus`, `EntitlementSource`, `Subscription`, `Entitlement`, `Locale`, `TranslationOverrides`
- **Constants** — `PLAN_ENTITLEMENTS`, `PLAN_LABELS` (also on `/core`, which is server-safe)
- **Data layer** (`/store`) — `useSubscriptionStore`, `useSubscription`, `useEntitlement`, `useAllEntitlements`, `useCheckout`
- **i18n** — built-in `t()` function (supports parameter substitution) + ko-KR / en-US
- **Utilities** — `cn`

### What's **not** included

- ❌ Creating the Supabase client (the app passes its own to `useSubscriptionStore.getState().init(supabase)`)
- ❌ Server-only `hasAccess()`
- ❌ Lemon Squeezy webhook handlers
- ❌ Admin grant/revoke APIs

### Design principles

Same as the auth package:

The principles below apply to the UI components; the `/store` entry is the data layer that feeds them.

1. **Props-only** — all data (`subscription`, `entitlements`) and handlers (`onStartSubscription`, `onUpgrade`, `onManageBilling`) are passed as props
2. **Framework-agnostic** — no `next/*` imports; Tauri/Vite compatible
3. **Stateless components** — business state is injected from outside; the current components hold no state of their own
4. **Provider-agnostic** — not coupled to Lemon Squeezy, Stripe, Paddle, or any specific provider

---

## 2. Installation

```bash
pnpm add @just-apps/subscription
```

### Peer Dependencies

- `react` ^19, `react-dom` ^19
- `lucide-react` ^1
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `zustand` ^5, `@supabase/supabase-js` ^2 — only when using `/store` (optional peers)

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

Initialise the store once with your Supabase client (e.g. in your auth store when a session appears), then feed the hooks into the components.

```tsx
import { SubscriptionView } from "@just-apps/subscription";
import { useSubscription, useAllEntitlements, useCheckout } from "@just-apps/subscription/store";

export function SubscriptionPanel() {
  const { subscription, isLoading, error } = useSubscription();
  const { entitlements } = useAllEntitlements();
  const { startCheckout } = useCheckout();

  return (
    <SubscriptionView
      locale="ko-KR"
      subscription={subscription}
      entitlements={entitlements}
      isLoading={isLoading}
      error={error}
      onStartSubscription={() => startCheckout("monthly")}
      onCancelSubscription={() => {/* open your cancel dialog */}}
      onResubscribe={() => startCheckout("monthly")}
      onManageBilling={() => {/* open the billing portal */}}
      onUpgrade={() => startCheckout("monthly")}
    />
  );
}
```

---

## 4. Components API

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

### `<PaymentFailedBanner />`

Payment failure notice. It's rendered automatically inside the `past_due` section of `SubscriptionView`, but you can also use it elsewhere if needed.

```tsx
interface PaymentFailedBannerProps {
  locale: Locale;
  onManageBilling: () => void;
}
```

---

## 5. UI Primitives

These are internal: the components below are built on them, and no entry exports them. Their APIs are described so a change to a component's look can be traced to them.

### `<Badge />`

Badge with built-in color variants for subscription states / entitlement sources.

```tsx
// packages/subscription/src/ui/badge.tsx — internal, not exported
<Badge variant="active">Pro</Badge>
```

**Variants (11):**

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

### `<Spinner />`

Same as the auth package (Loader2 wrapper).

---

## 6. Types

```ts
export type Locale = "ko-KR" | "en-US";

export const PLAN_IDS = ["just_apps_pro", "just_apps_ult"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const SUBSCRIPTION_STATUSES = [
  "active", "past_due", "canceled", "expired", "paused", "trialing",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const ENTITLEMENT_SOURCES = ["subscription", "admin", "promo", "trial"] as const;
export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number];

// Type guards over the same lists, for rows read from the database
export function isPlanId(value: unknown): value is PlanId;
export function isSubscriptionStatus(value: unknown): value is SubscriptionStatus;
export function isEntitlementSource(value: unknown): value is EntitlementSource;

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

The store reads rows through these guards, so a value outside a list is dropped. Server code that writes or filters these columns can import the same lists from `/core` instead of restating them.

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

In server code (route handlers, webhooks), import constants from `@just-apps/subscription/core`. The main entry is a `"use client"` module, so importing values from it on the server is not safe.

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
// → "Pro 체험 중 — 5일 남음"

t("subscription.available_until", "ko-KR", undefined, { date: "2026년 5월 1일" });
// → "2026년 5월 1일까지 이용 가능"

t("missing.key", "ko-KR");
// → "missing.key" (fallback: the key itself)
```

`{key}` tokens inside a string are substituted with `params[key]`.

### Translation key namespaces

| Namespace | Purpose |
|---|---|
| `subscription.*` | SubscriptionView (title, active, canceled, past_due, paused, trialing, available_until, manage_billing, cancel, resubscribe, start, none) |
| `trial.*` | SubscriptionView's trialing section (banner, upgrade) |
| `payment_failed.*` | PaymentFailedBanner (title, description, action) |
| `app.*` | `app.{appId}` — per-appId label (for entitlement badges, etc.) |
| `common.*` | Shared (error) |

See `packages/subscription/src/i18n/translations.ts` for the exact key list. The exported `TranslationKey` type is the union of those keys; `t()` itself accepts any string, since `app.{appId}` keys are built at runtime.

### Override pattern

Same as auth:

```tsx
<SubscriptionView
  locale="ko-KR"
  {...props}
  // no translations prop — SubscriptionView currently doesn't support overrides (uses defaults)
/>
```

> ⚠️ No subscription component has a `translations` prop yet. If you need it, add the prop to the specific component (see the auth/TermsAgreementView pattern).

---

## 9. App integration guide

### Next.js (this repo)

**Wiring the store** — the app's auth store drives the subscription store's lifecycle:

```ts
import { useSubscriptionStore } from "@just-apps/subscription/store";

// on sign-in / initial session
useSubscriptionStore.getState().init(supabase, { appIds: ["logo"] });
// on sign-out
useSubscriptionStore.getState().clear();
// after a purchase or admin change
useSubscriptionStore.getState().refetch();
```

`appIds` scopes the entitlements the store reads to this app's ids. Without it, the store reads every `just_entitlements` row the user can see, including those other family apps granted on the same Supabase project. Calling `init` again with the same client and the same `appIds` does nothing; a different client or scope reloads. A failed load leaves the store uninitialised, so the next `init` retries.

**Integration example (`src/views/MyPage.tsx`):**

```tsx
import { SubscriptionView } from "@just-apps/subscription";
import {
  useSubscription,
  useAllEntitlements,
  useCheckout,
  useSubscriptionStore,
} from "@just-apps/subscription/store";

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

A Tauri app can use `/store` as-is when it talks to the same Supabase project, or keep its own store and map its rows onto the package's `Subscription` / `Entitlement` types before rendering `SubscriptionView`. `useCheckout` takes its endpoints as options (`checkoutApiUrl`, `statusApiUrl`), so it can point at the app's own backend or a Supabase Edge Function.

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

Supabase tables queried by `useSubscriptionStore`:

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

**Q. `useCheckout` is tied to Lemon Squeezy. What if an app uses another provider?**
A. The endpoints are options (`checkoutApiUrl`, `statusApiUrl`), so any app on Lemon Squeezy can reuse it against its own backend. An app on a different provider writes its own checkout hook and still uses the store and UI.

**Q. The Badge variants are too subscription-centric. I want a general-purpose badge.**
A. The current Badge is optimized for this package's internal use. If you need a general-purpose Badge, split it into a separate UI package or build your own in the app.

**Q. When I add an app to PLAN_ENTITLEMENTS, where else do I need to change?**
A. Only `packages/subscription/src/constants.ts` in this repo, then release and bump consumers. However, make sure that the entitlement row for that appId is actually inserted into the DB by checking the issuance logic in just-apps-homepage's `src/app/api/webhooks/lemon-squeezy/route.ts`.

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
