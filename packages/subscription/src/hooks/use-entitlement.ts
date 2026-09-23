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
  // Select the stored array (stable reference) and filter outside the selector:
  // a selector returning a fresh array makes zustand v5 re-render forever.
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
