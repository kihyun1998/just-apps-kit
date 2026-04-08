"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type CheckoutStatus = "idle" | "loading" | "overlay" | "polling" | "success" | "timeout" | "error";

interface UseCheckoutOptions {
  /** Checkout API endpoint. Defaults to "/api/checkout". */
  checkoutApiUrl?: string;
  /** Subscription status polling endpoint. Defaults to "/api/subscription/status". */
  statusApiUrl?: string;
  /** Max polling duration in ms. Defaults to 30000. */
  maxWaitMs?: number;
  /** Polling interval in ms. Defaults to 2000. */
  intervalMs?: number;
  /** Called when subscription is activated. */
  onSuccess?: () => void;
  /** Called when polling times out. */
  onTimeout?: () => void;
}

interface UseCheckoutReturn {
  status: CheckoutStatus;
  error: string | null;
  startCheckout: (interval: "monthly" | "yearly") => Promise<void>;
  reset: () => void;
}

const LEMON_SQUEEZY_SCRIPT_URL = "https://app.lemonsqueezy.com/js/lemon.js";
const ALLOWED_CHECKOUT_ORIGIN = "https://app.lemonsqueezy.com";
const SCRIPT_LOAD_TIMEOUT_MS = 10_000;
const MAX_CONSECUTIVE_POLL_FAILURES = 5;

function isLemonScriptReady(): boolean {
  return typeof window !== "undefined" && typeof (window as any).LemonSqueezy !== "undefined";
}

function loadLemonScript(): Promise<void> {
  if (isLemonScriptReady()) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Check if another call is already loading the script
    if (document.querySelector(`script[src="${LEMON_SQUEEZY_SCRIPT_URL}"]`)) {
      let waited = 0;
      const check = setInterval(() => {
        waited += 50;
        if (isLemonScriptReady()) {
          clearInterval(check);
          resolve();
        } else if (waited >= SCRIPT_LOAD_TIMEOUT_MS) {
          clearInterval(check);
          reject(new Error("Lemon Squeezy script load timed out"));
        }
      }, 50);
      return;
    }

    const script = document.createElement("script");
    script.src = LEMON_SQUEEZY_SCRIPT_URL;
    script.defer = true;
    script.onload = () => {
      if (typeof (window as any).createLemonSqueezy === "function") {
        (window as any).createLemonSqueezy();
      }
      resolve();
    };
    script.onerror = () => {
      reject(new Error("Failed to load Lemon Squeezy script"));
    };
    document.head.appendChild(script);
  });
}

function validateCheckoutUrl(url: string): void {
  if (!url.startsWith(ALLOWED_CHECKOUT_ORIGIN)) {
    throw new Error("Unexpected checkout URL origin");
  }
}

function setupLemonEventHandler(onCheckoutSuccess: () => void): void {
  const ls = (window as any).LemonSqueezy;
  if (ls?.Setup) {
    ls.Setup({
      eventHandler: (event: { event: string }) => {
        if (event.event === "Checkout.Success") {
          onCheckoutSuccess();
        }
      },
    });
  }
}

function openCheckoutOverlay(url: string, fallback: () => void): void {
  const ls = (window as any).LemonSqueezy;
  if (ls?.Url?.Open) {
    ls.Url.Open(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
    fallback();
  }
}

export function useCheckout(options: UseCheckoutOptions = {}): UseCheckoutReturn {
  const {
    checkoutApiUrl = "/api/checkout",
    statusApiUrl = "/api/subscription/status",
    maxWaitMs = 30_000,
    intervalMs = 2_000,
    onSuccess,
    onTimeout,
  } = options;

  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onTimeoutRef = useRef(onTimeout);
  onSuccessRef.current = onSuccess;
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = useCallback(() => {
    setStatus("polling");
    const start = Date.now();
    let consecutiveFailures = 0;

    const poll = async () => {
      try {
        const res = await fetch(statusApiUrl);
        if (!res.ok) {
          consecutiveFailures++;
        } else {
          consecutiveFailures = 0;
          const data = await res.json();
          if (data.hasActiveSubscription) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (!mountedRef.current) return;
            setStatus("success");
            onSuccessRef.current?.();
            return;
          }
        }
      } catch {
        consecutiveFailures++;
      }

      if (consecutiveFailures >= MAX_CONSECUTIVE_POLL_FAILURES) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (!mountedRef.current) return;
        setStatus("error");
        setError("Polling failed after multiple attempts");
        return;
      }

      if (Date.now() - start >= maxWaitMs) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (!mountedRef.current) return;
        setStatus("timeout");
        onTimeoutRef.current?.();
      }
    };

    poll();
    pollingRef.current = setInterval(poll, intervalMs);
  }, [statusApiUrl, maxWaitMs, intervalMs]);

  const startCheckout = useCallback(async (interval: "monthly" | "yearly") => {
    setStatus("loading");
    setError(null);

    try {
      await loadLemonScript();

      const res = await fetch(checkoutApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Checkout failed" }));
        throw new Error(data.error || `Checkout failed: ${res.status}`);
      }

      const { url } = await res.json();
      if (!url) throw new Error("No checkout URL returned");
      validateCheckoutUrl(url);

      if (!mountedRef.current) return;
      setStatus("overlay");

      setupLemonEventHandler(startPolling);
      openCheckoutOverlay(url, startPolling);
    } catch (e) {
      if (!mountedRef.current) return;
      setStatus("error");
      setError(e instanceof Error ? e.message : "Checkout failed");
    }
  }, [checkoutApiUrl, startPolling]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
  }, []);

  return { status, error, startCheckout, reset };
}
