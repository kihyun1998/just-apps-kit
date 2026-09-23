import { useSubscriptionStore } from "../store/useSubscriptionStore";
import type { Entitlement } from "../types";

interface UseAllEntitlementsReturn {
  entitlements: Entitlement[];
  isLoading: boolean;
  error: Error | null;
}

export function useAllEntitlements(): UseAllEntitlementsReturn {
  const entitlements = useSubscriptionStore((s) => s.entitlements);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const error = useSubscriptionStore((s) => s.error);

  return { entitlements, isLoading, error };
}
