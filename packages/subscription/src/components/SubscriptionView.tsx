"use client";

import { CreditCard, Calendar, Sparkles, Zap } from "lucide-react";
import { PLAN_LABELS } from "../constants";
import { t } from "../i18n";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { PaymentFailedBanner } from "./PaymentFailedBanner";
import type {
  Locale,
  Subscription,
  Entitlement,
  PlanId,
  SubscriptionStatus,
  TranslationOverrides,
} from "../types";

export interface SubscriptionViewProps {
  locale: Locale;
  translations?: TranslationOverrides;
  subscription: Subscription | null;
  entitlements: Entitlement[];
  isLoading: boolean;
  error: Error | null;
  onStartSubscription: () => void;
  onCancelSubscription: () => void;
  onResubscribe: () => void;
  onManageBilling: () => void;
  onUpgrade: () => void;
}

function formatDate(dateStr: string, locale: Locale): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function appLabel(appId: string, locale: Locale, translations?: TranslationOverrides): string {
  const label = t(`app.${appId}`, locale, translations);
  return label !== `app.${appId}` ? label : appId;
}

export function SubscriptionView({
  locale,
  translations,
  subscription,
  entitlements,
  isLoading,
  error,
  onStartSubscription,
  onCancelSubscription,
  onResubscribe,
  onManageBilling,
  onUpgrade,
}: SubscriptionViewProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {t("common.error", locale, translations)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <h3 className="text-lg font-semibold">{t("subscription.title", locale, translations)}</h3>

      {/* Status section */}
      {!subscription ? (
        <NoneSection
          locale={locale}
          translations={translations}
          onStartSubscription={onStartSubscription}
        />
      ) : (
        <StatusSection
          locale={locale}
          translations={translations}
          subscription={subscription}
          onCancelSubscription={onCancelSubscription}
          onResubscribe={onResubscribe}
          onManageBilling={onManageBilling}
          onUpgrade={onUpgrade}
        />
      )}

      {/* Entitlements section */}
      {entitlements.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2">
            {t("subscription.entitlements", locale, translations)}
          </p>
          <div className="flex flex-wrap gap-2">
            {entitlements.map((ent) => (
              <div
                key={`${ent.appId}-${ent.source}`}
                className="flex items-center gap-1.5"
              >
                <Badge variant={ent.source}>{appLabel(ent.appId, locale, translations)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatusSectionProps {
  locale: Locale;
  translations?: TranslationOverrides;
  subscription: Subscription;
  onCancelSubscription: () => void;
  onResubscribe: () => void;
  onManageBilling: () => void;
  onUpgrade: () => void;
}

function StatusSection({
  locale,
  translations,
  subscription,
  onCancelSubscription,
  onResubscribe,
  onManageBilling,
  onUpgrade,
}: StatusSectionProps) {
  const status = subscription.status;
  switch (status) {
    case "active":
      return (
        <ActiveSection
          locale={locale}
          translations={translations}
          subscription={subscription}
          onCancelSubscription={onCancelSubscription}
          onManageBilling={onManageBilling}
        />
      );
    case "canceled":
      return (
        <CanceledSection
          locale={locale}
          translations={translations}
          subscription={subscription}
          onResubscribe={onResubscribe}
        />
      );
    case "past_due":
      return (
        <PastDueSection
          locale={locale}
          translations={translations}
          planId={subscription.planId}
          onManageBilling={onManageBilling}
        />
      );
    case "paused":
      return (
        <PausedSection
          locale={locale}
          translations={translations}
          planId={subscription.planId}
          onResubscribe={onResubscribe}
        />
      );
    case "trialing":
      return (
        <TrialingSection
          locale={locale}
          translations={translations}
          subscription={subscription}
          onUpgrade={onUpgrade}
        />
      );
    case "expired":
      return null;
    default: {
      const unhandled: never = status;
      return unhandled;
    }
  }
}

interface StatusHeaderProps {
  locale: Locale;
  translations?: TranslationOverrides;
  planId: PlanId;
  status: Exclude<SubscriptionStatus, "expired">;
  icon?: React.ReactNode;
}

function StatusHeader({ locale, translations, planId, status, icon }: StatusHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{PLAN_LABELS[planId]?.[locale] ?? planId}</span>
      <Badge variant={status}>{t(`subscription.${status}`, locale, translations)}</Badge>
    </div>
  );
}

interface NoneSectionProps {
  locale: Locale;
  translations?: TranslationOverrides;
  onStartSubscription: () => void;
}

function NoneSection({ locale, translations, onStartSubscription }: NoneSectionProps) {
  return (
    <div className="text-center py-4 space-y-4">
      <CreditCard className="h-8 w-8 text-muted-foreground/40 mx-auto" />
      <p className="text-sm text-muted-foreground">
        {t("subscription.none", locale, translations)}
      </p>
      <Button onClick={onStartSubscription}>
        {t("subscription.start", locale, translations)}
      </Button>
    </div>
  );
}

interface ActiveSectionProps {
  locale: Locale;
  translations?: TranslationOverrides;
  subscription: Subscription;
  onCancelSubscription: () => void;
  onManageBilling: () => void;
}

function ActiveSection({ locale, translations, subscription, onCancelSubscription, onManageBilling }: ActiveSectionProps) {
  return (
    <div className="space-y-4">
      <StatusHeader
        locale={locale}
        translations={translations}
        planId={subscription.planId}
        status="active"
        icon={<Zap className="h-4 w-4 text-brand" />}
      />
      {subscription.currentPeriodEnd && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {t("subscription.available_until", locale, translations, {
            date: formatDate(subscription.currentPeriodEnd, locale),
          })}
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onManageBilling}>
          {t("subscription.manage_billing", locale, translations)}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancelSubscription} className="text-destructive hover:text-destructive">
          {t("subscription.cancel", locale, translations)}
        </Button>
      </div>
    </div>
  );
}

interface CanceledSectionProps {
  locale: Locale;
  translations?: TranslationOverrides;
  subscription: Subscription;
  onResubscribe: () => void;
}

function CanceledSection({ locale, translations, subscription, onResubscribe }: CanceledSectionProps) {
  return (
    <div className="space-y-4">
      <StatusHeader locale={locale} translations={translations} planId={subscription.planId} status="canceled" />
      {subscription.currentPeriodEnd && (
        <p className="text-sm text-muted-foreground">
          {t("subscription.available_until", locale, translations, {
            date: formatDate(subscription.currentPeriodEnd, locale),
          })}
        </p>
      )}
      <Button onClick={onResubscribe}>
        {t("subscription.resubscribe", locale, translations)}
      </Button>
    </div>
  );
}

interface PastDueSectionProps {
  locale: Locale;
  translations?: TranslationOverrides;
  planId: PlanId;
  onManageBilling: () => void;
}

function PastDueSection({ locale, translations, planId, onManageBilling }: PastDueSectionProps) {
  return (
    <div className="space-y-4">
      <StatusHeader locale={locale} translations={translations} planId={planId} status="past_due" />
      <PaymentFailedBanner
        locale={locale}
        translations={translations}
        onManageBilling={onManageBilling}
      />
    </div>
  );
}

interface PausedSectionProps {
  locale: Locale;
  translations?: TranslationOverrides;
  planId: PlanId;
  onResubscribe: () => void;
}

function PausedSection({ locale, translations, planId, onResubscribe }: PausedSectionProps) {
  return (
    <div className="space-y-4">
      <StatusHeader locale={locale} translations={translations} planId={planId} status="paused" />
      <Button onClick={onResubscribe}>
        {t("subscription.resubscribe", locale, translations)}
      </Button>
    </div>
  );
}

interface TrialingSectionProps {
  locale: Locale;
  translations?: TranslationOverrides;
  subscription: Subscription;
  onUpgrade: () => void;
}

function TrialingSection({ locale, translations, subscription, onUpgrade }: TrialingSectionProps) {
  const daysLeft = (() => {
    if (!subscription.trialEndsAt) return 0;
    const end = new Date(subscription.trialEndsAt);
    if (isNaN(end.getTime())) return 0;
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  })();

  return (
    <div className="space-y-4">
      <StatusHeader
        locale={locale}
        translations={translations}
        planId={subscription.planId}
        status="trialing"
        icon={<Sparkles className="h-4 w-4 text-brand" />}
      />
      {subscription.trialEndsAt && (
        <p className="text-sm text-muted-foreground">
          {t("trial.banner", locale, translations, { days: String(daysLeft) })}
        </p>
      )}
      <Button onClick={onUpgrade}>
        {t("trial.upgrade", locale, translations)}
      </Button>
    </div>
  );
}
