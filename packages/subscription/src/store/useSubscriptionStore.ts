import { create } from "zustand";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SUBSCRIPTION_STATUSES,
  isEntitlementSource,
  isPlanId,
  isSubscriptionStatus,
  type Subscription,
  type Entitlement,
} from "../types";

const LISTED_STATUSES = SUBSCRIPTION_STATUSES.filter((s) => s !== "expired");

export interface SubscriptionStoreOptions {
  /** The app ids whose entitlements this app reads. Omitted, every entitlement row the user can see is read. */
  appIds?: string[];
}

interface SubscriptionStore {
  entitlements: Entitlement[];
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;

  init: (supabaseClient: SupabaseClient, options?: SubscriptionStoreOptions) => void;
  refetch: () => Promise<void>;
  clear: () => void;
}

let client: SupabaseClient | null = null;
let appIds: string[] | undefined;

function sameIds(a: string[] | undefined, b: string[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((id, i) => id === b[i]);
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  entitlements: [],
  subscription: null,
  isLoading: true,
  error: null,
  initialized: false,

  init: (supabaseClient: SupabaseClient, options?: SubscriptionStoreOptions) => {
    const scopeChanged = !sameIds(appIds, options?.appIds);
    if (get().initialized && client === supabaseClient && !scopeChanged) return;

    client = supabaseClient;
    appIds = options?.appIds;
    set({ initialized: true });

    void get()
      .refetch()
      .then(() => {
        // A failed load leaves init() retryable.
        if (get().error) set({ initialized: false });
      });
  },

  refetch: async () => {
    const supabase = client;
    if (!supabase) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ isLoading: false });
        return;
      }

      set({ isLoading: true, error: null });

      const now = new Date().toISOString();

      let entitlementQuery = supabase
        .from("just_entitlements")
        .select("app_id, source, expires_at")
        .or(`expires_at.is.null,expires_at.gt.${now}`);
      if (appIds) entitlementQuery = entitlementQuery.in("app_id", appIds);

      const [entitlementResult, subscriptionResult] = await Promise.all([
        entitlementQuery,
        supabase
          .from("just_subscriptions")
          .select("id, plan_id, status, provider, canceled_at, current_period_end, trial_ends_at")
          .in("status", LISTED_STATUSES)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (entitlementResult.error) throw entitlementResult.error;
      if (subscriptionResult.error) throw subscriptionResult.error;

      const entitlements: Entitlement[] = [];
      for (const row of (entitlementResult.data ?? []) as {
        app_id: string;
        source: string;
        expires_at: string | null;
      }[]) {
        if (!isEntitlementSource(row.source)) continue;
        entitlements.push({ appId: row.app_id, source: row.source, expiresAt: row.expires_at });
      }

      const sub = subscriptionResult.data;
      const subscription: Subscription | null =
        sub && isSubscriptionStatus(sub.status) && isPlanId(sub.plan_id)
          ? {
              id: sub.id as string,
              planId: sub.plan_id,
              status: sub.status,
              provider: sub.provider as string,
              canceledAt: sub.canceled_at as string | null,
              currentPeriodEnd: sub.current_period_end as string | null,
              trialEndsAt: sub.trial_ends_at as string | null,
            }
          : null;

      set({ entitlements, subscription, isLoading: false, error: null });
    } catch (e) {
      set({
        error: e instanceof Error ? e : new Error("Failed to fetch subscription"),
        isLoading: false,
      });
      console.error("[sub] refetch error", JSON.stringify(e, null, 2));
    }
  },

  clear: () => {
    client = null;
    appIds = undefined;
    set({
      entitlements: [],
      subscription: null,
      isLoading: false,
      error: null,
      initialized: false,
    });
  },
}));
