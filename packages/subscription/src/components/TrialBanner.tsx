"use client";

import { Sparkles } from "lucide-react";
import { t } from "../i18n";
import { Button } from "../ui/button";
import type { Locale } from "../types";

export interface TrialBannerProps {
  locale: Locale;
  daysLeft: number;
  onUpgrade: () => void;
}

export function TrialBanner({ locale, daysLeft, onUpgrade }: TrialBannerProps) {
  return (
    <div role="status" className="flex items-center gap-3 rounded-lg bg-accent px-4 py-3">
      <Sparkles className="h-5 w-5 text-brand shrink-0" />
      <p className="flex-1 text-sm font-medium text-accent-foreground">
        {t("trial.banner", locale, undefined, { days: String(daysLeft) })}
      </p>
      <Button size="sm" onClick={onUpgrade} className="shrink-0">
        {t("trial.upgrade", locale)}
      </Button>
    </div>
  );
}
