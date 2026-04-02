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
}

const FREE_FEATURES = {
  "ko-KR": ["기본 기능 사용", "워터마크 포함"],
  "en-US": ["Basic features", "With watermark"],
};

const PRO_FEATURES = {
  "ko-KR": ["모든 앱 Pro 기능", "워터마크 제거", "우선 지원"],
  "en-US": ["All apps Pro features", "No watermark", "Priority support"],
};

export function PricingView({
  locale,
  currentPlanId,
  isLoading,
  onSelectPlan,
}: PricingViewProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const ko = locale === "ko-KR";
  const proApps = PLAN_ENTITLEMENTS.just_apps_pro ?? [];

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
          aria-pressed={interval === "monthly"}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            interval === "monthly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setInterval("monthly")}
        >
          {t("pricing.monthly", locale)}
        </button>
        <button
          type="button"
          aria-pressed={interval === "yearly"}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            interval === "yearly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setInterval("yearly")}
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
            {FREE_FEATURES[locale].map((feature) => (
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
            {PRO_FEATURES[locale].map((feature) => (
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
              onClick={() => onSelectPlan("just_apps_pro", interval)}
            >
              {isLoading ? <Spinner size="sm" /> : t("pricing.select", locale)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
