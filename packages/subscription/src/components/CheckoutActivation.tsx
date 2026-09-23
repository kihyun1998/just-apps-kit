"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { t } from "../i18n";
import { Spinner } from "../ui/spinner";
import type { Locale } from "../types";

export interface CheckoutActivationProps {
  locale: Locale;
  /** intervalMs 간격으로 호출되는 폴링 함수. true 반환 시 활성화 완료. */
  onPoll: () => Promise<boolean>;
  /** 활성화 성공 시 호출 */
  onSuccess: () => void;
  /** 타임아웃 시 호출 */
  onTimeout: () => void;
  /** 최대 폴링 시간(ms). 기본 30초. */
  maxWaitMs?: number;
  /** 폴링 간격(ms). 기본 2초. */
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

  // 콜백을 ref로 읽는 것은 의도적 — docs/map/territory/checkout.md
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
      // 실패 무시는 의도적 — docs/map/territory/checkout.md
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
