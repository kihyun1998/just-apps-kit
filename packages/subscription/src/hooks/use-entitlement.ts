import { useSubscriptionStore } from "../stores/useSubscriptionStore";
import type { Entitlement, EntitlementSource } from "../types";

interface UseEntitlementReturn {
  hasPro: boolean;
  isLoading: boolean;
  error: Error | null;
  source: EntitlementSource | null;
  entitlements: Entitlement[];
}

export function useEntitlement(appId: string): UseEntitlementReturn {
  const entitlements = useSubscriptionStore((s) =>
    s.entitlements.filter((e) => e.appId === appId)
  );
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const error = useSubscriptionStore((s) => s.error);

  const active = entitlements[0] ?? null;

  return {
    hasPro: error ? false : active !== null,
    isLoading,
    error,
    source: active?.source ?? null,
    entitlements,
  };
}
