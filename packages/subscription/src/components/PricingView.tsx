"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { t } from "../i18n";
import { PLAN_ENTITLEMENTS } from "../constants";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import type { Locale, PlanId } from "../types";

export interface PricingViewProps {
  locale: Locale;
  currentPlanId: PlanId | null;
  isLoading: boolean;
  onSelectPlan: (planId: PlanId, interval: "monthly" | "yearly") => void;
  freeFeatures?: string[];
  proFeatures?: string[];
}

const DEFAULT_FREE_FEATURES: Record<Locale, string[]> = {
  "ko-KR": ["기본 기능 사용", "제한된 저장 공간"],
  "en-US": ["Basic features", "Limited storage"],
};

const DEFAULT_PRO_FEATURES: Record<Locale, string[]> = {
  "ko-KR": ["확장된 저장 공간", "모든 프리미엄 기능", "새로운 앱 자동 포함"],
  "en-US": ["Expanded storage", "All premium features", "New apps included"],
};

export function PricingView({
  locale,
  currentPlanId,
  isLoading,
  onSelectPlan,
  freeFeatures,
  proFeatures,
}: PricingViewProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const ko = locale === "ko-KR";
  const proApps = PLAN_ENTITLEMENTS.just_apps_pro ?? [];
  const resolvedFreeFeatures = freeFeatures ?? DEFAULT_FREE_FEATURES[locale];
  const resolvedProFeatures = proFeatures ?? DEFAULT_PRO_FEATURES[locale];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t("pricing.title", locale)}</h2>
        <p className="text-sm text-muted-foreground">
          {t("pricing.subtitle", locale)}
        </p>
      </div>

      {/* Interval toggle */}
      <div
        role="group"
        aria-label={ko ? "결제 주기 선택" : "Billing interval"}
        className="flex justify-center gap-1 p-1 rounded-lg bg-muted w-fit mx-auto"
      >
        <button
          type="button"
          aria-pressed={billingInterval === "monthly"}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            billingInterval === "monthly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setBillingInterval("monthly")}
        >
          {t("pricing.monthly", locale)}
        </button>
        <button
          type="button"
          aria-pressed={billingInterval === "yearly"}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            billingInterval === "yearly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setBillingInterval("yearly")}
        >
          {t("pricing.yearly", locale)}
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {/* Free plan */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t("pricing.free", locale)}</h3>
            <p className="text-2xl font-bold mt-2">
              {ko ? "₩0" : "$0"}
              <span className="text-sm font-normal text-muted-foreground">
                /{ko ? "월" : "mo"}
              </span>
            </p>
          </div>
          <ul className="space-y-2">
            {resolvedFreeFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          {currentPlanId === null ? (
            <Badge variant="default" className="w-fit">
              {t("pricing.current_plan", locale)}
            </Badge>
          ) : (
            <div className="h-9" />
          )}
        </div>

        {/* Pro plan */}
        <div className="rounded-xl border-2 border-brand bg-card p-6 space-y-4 relative">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand" />
              <h3 className="text-lg font-semibold">{t("pricing.pro", locale)}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {ko
                ? proApps.length === 1
                  ? "모든 Pro 기능 포함"
                  : `${proApps.length}개 앱 모두 포함`
                : proApps.length === 1
                  ? "All Pro features included"
                  : `All ${proApps.length} apps included`}
            </p>
          </div>
          <ul className="space-y-2">
            {resolvedProFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-brand shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          {currentPlanId === "just_apps_pro" ? (
            <Badge variant="active" className="w-fit">
              {t("pricing.current_plan", locale)}
            </Badge>
          ) : (
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={() => onSelectPlan("just_apps_pro", billingInterval)}
            >
              {isLoading ? <Spinner size="sm" /> : t("pricing.select", locale)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
