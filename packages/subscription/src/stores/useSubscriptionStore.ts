import { create } from "zustand";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Subscription,
  Entitlement,
  SubscriptionStatus,
  EntitlementSource,
  PlanId,
} from "../types";

const VALID_SOURCES: EntitlementSource[] = ["subscription", "admin", "promo", "trial"];
const VALID_STATUSES: SubscriptionStatus[] = [
  "active", "past_due", "canceled", "expired", "paused", "trialing",
];
const VALID_PLANS: PlanId[] = ["just_apps_pro", "just_apps_ult"];

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
        // 초기화 실패 시 재시도 가능하도록 initialized를 리셋
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
          .select("id, plan_id, status, canceled_at, current_period_end, trial_ends_at")
          .in("status", ["active", "trialing", "past_due", "paused", "canceled"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (entitlementResult.error) throw entitlementResult.error;
      if (subscriptionResult.error) throw subscriptionResult.error;

      const entitlements: Entitlement[] = (entitlementResult.data ?? [])
        .filter((row: { source: string }) =>
          VALID_SOURCES.includes(row.source as EntitlementSource)
        )
        .map((row: { app_id: string; source: string; expires_at: string | null }) => ({
          appId: row.app_id,
          source: row.source as EntitlementSource,
          expiresAt: row.expires_at,
        }));

      const sub = subscriptionResult.data;
      const subscription: Subscription | null =
        sub &&
        VALID_STATUSES.includes(sub.status as SubscriptionStatus) &&
        VALID_PLANS.includes(sub.plan_id as PlanId)
          ? {
              id: sub.id as string,
              planId: sub.plan_id as PlanId,
              status: sub.status as SubscriptionStatus,
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
    }
  },

  clear: () => {
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
