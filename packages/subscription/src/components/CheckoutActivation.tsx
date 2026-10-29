"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { t } from "../i18n";
import { Spinner } from "../ui/spinner";
import type { Locale } from "../types";

export interface CheckoutActivationProps {
  locale: Locale;
  /** Polling function called every intervalMs. Returning true means activation is complete. */
  onPoll: () => Promise<boolean>;
  /** Called when activation succeeds. */
  onSuccess: () => void;
  /** Called on timeout. */
  onTimeout: () => void;
  /** Maximum polling time in ms. Defaults to 30 s. */
  maxWaitMs?: number;
  /** Polling interval in ms. Defaults to 2 s. */
  intervalMs?: number;
}

export function CheckoutActivation({
  locale,
  onPoll,
  onSuccess,
  onTimeout,
  maxWaitMs = 30_000,
  intervalMs = 2_000,
}: CheckoutActivationProps) {
  const [status, setStatus] = useState<"polling" | "success" | "timeout">("polling");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());
  const mountedRef = useRef(true);

  // Callbacks are read through refs, deliberately — docs/map/territory/checkout.md
  const onPollRef = useRef(onPoll);
  const onSuccessRef = useRef(onSuccess);
  const onTimeoutRef = useRef(onTimeout);
  onPollRef.current = onPoll;
  onSuccessRef.current = onSuccess;
  onTimeoutRef.current = onTimeout;

  const stablePoll = useCallback(async () => {
    try {
      const activated = await onPollRef.current();
      if (!mountedRef.current) return;

      if (activated) {
        setStatus("success");
        if (timerRef.current) clearInterval(timerRef.current);
        onSuccessRef.current();
        return;
      }
    } catch {
      // Failures are ignored, deliberately — docs/map/territory/checkout.md
    }

    if (Date.now() - startRef.current >= maxWaitMs) {
      if (!mountedRef.current) return;
      setStatus("timeout");
      if (timerRef.current) clearInterval(timerRef.current);
      onTimeoutRef.current();
    }
  }, [maxWaitMs]);

  useEffect(() => {
    mountedRef.current = true;
    startRef.current = Date.now();

    stablePoll();
    timerRef.current = setInterval(stablePoll, intervalMs);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stablePoll, intervalMs]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      {status === "polling" && (
        <>
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">
            {t("checkout.activating", locale)}
          </p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="h-10 w-10 text-brand" />
          <p className="text-sm font-medium text-foreground">
            {t("checkout.success", locale)}
          </p>
        </>
      )}
      {status === "timeout" && (
        <>
          <Clock className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            {t("checkout.timeout", locale)}
          </p>
        </>
      )}
    </div>
  );
}
