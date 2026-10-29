"use client";

import { AlertTriangle } from "lucide-react";
import { t } from "../i18n";
import { Button } from "../ui/button";
import type { Locale, TranslationOverrides } from "../types";

export interface PaymentFailedBannerProps {
  locale: Locale;
  translations?: TranslationOverrides;
  onManageBilling: () => void;
}

export function PaymentFailedBanner({ locale, translations, onManageBilling }: PaymentFailedBannerProps) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg bg-destructive/10 px-4 py-3">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">
          {t("payment_failed.title", locale, translations)}
        </p>
        <p className="text-xs text-destructive/80 mt-0.5">
          {t("payment_failed.description", locale, translations)}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onManageBilling} className="shrink-0">
        {t("payment_failed.action", locale, translations)}
      </Button>
    </div>
  );
}
