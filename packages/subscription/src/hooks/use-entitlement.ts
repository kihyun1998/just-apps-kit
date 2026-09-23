import { useMemo } from "react";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import type { Entitlement, EntitlementSource } from "../types";

interface UseEntitlementReturn {
  hasPro: boolean;
  isLoading: boolean;
  error: Error | null;
  source: EntitlementSource | null;
  entitlements: Entitlement[];
}

export function useEntitlement(appId: string): UseEntitlementReturn {
  // Filtering outside the selector is deliberate — docs/map/territory/entitlement-store.md
  const all = useSubscriptionStore((s) => s.entitlements);
  const entitlements = useMemo(
    () => all.filter((e) => e.appId === appId),
    [all, appId]
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
