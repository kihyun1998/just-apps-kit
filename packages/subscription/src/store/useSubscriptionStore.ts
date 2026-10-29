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

interface SubscriptionStore {
  entitlements: Entitlement[];
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;
  _supabase: SupabaseClient | null;

  init: (supabaseClient: SupabaseClient) => void;
  refetch: () => Promise<void>;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  entitlements: [],
  subscription: null,
  isLoading: true,
  error: null,
  initialized: false,
  _supabase: null,

  init: (supabaseClient: SupabaseClient) => {
    if (get().initialized) return;
    set({ initialized: true, _supabase: supabaseClient });

    (async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (!session?.user) {
          set({ isLoading: false });
          return;
        }

        await get().refetch();
      } catch (e) {
        // Reset initialized so the next init() retries
        set({
          error: e instanceof Error ? e : new Error("Failed to initialize subscription"),
          isLoading: false,
          initialized: false,
        });
      }
    })();
  },

  refetch: async () => {
    const supabase = get()._supabase;
    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      set({ isLoading: true, error: null });

      const now = new Date().toISOString();

      const [entitlementResult, subscriptionResult] = await Promise.all([
        supabase
          .from("just_entitlements")
          .select("app_id, source, expires_at")
          .or(`expires_at.is.null,expires_at.gt.${now}`),
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
    console.log("[sub] clear");
    set({
      entitlements: [],
      subscription: null,
      isLoading: false,
      error: null,
      initialized: false,
      _supabase: null,
    });
  },
}));
