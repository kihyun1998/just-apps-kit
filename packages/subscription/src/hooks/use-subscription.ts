import { useSubscriptionStore } from "../stores/useSubscriptionStore";
import type { Subscription } from "../types";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSubscription(): UseSubscriptionReturn {
  const subscription = useSubscriptionStore((s) => s.subscription);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const error = useSubscriptionStore((s) => s.error);

  return { subscription, isLoading, error };
}
