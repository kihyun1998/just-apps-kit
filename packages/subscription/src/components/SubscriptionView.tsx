"use client";

import { CreditCard, Calendar, Sparkles, Zap } from "lucide-react";
import { t } from "../i18n";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { PaymentFailedBanner } from "./PaymentFailedBanner";
import type { Locale, Subscription, Entitlement, SubscriptionStatus } from "../types";

export interface SubscriptionViewProps {
  locale: Locale;
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

function appLabel(appId: string, locale: Locale): string {
  return t(`app.${appId}`, locale) !== `app.${appId}`
    ? t(`app.${appId}`, locale)
    : appId;
}

export function SubscriptionView({
  locale,
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
          {t("common.error", locale)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <h3 className="text-lg font-semibold">{t("subscription.title", locale)}</h3>

      {/* Status section */}
      {!subscription ? (
        <NoneSection locale={locale} onStartSubscription={onStartSubscription} />
      ) : (
        <StatusSection
          locale={locale}
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
            {locale === "ko-KR" ? "활성 권한" : "Active Entitlements"}
          </p>
          <div className="flex flex-wrap gap-2">
            {entitlements.map((ent) => (
              <div
                key={`${ent.appId}-${ent.source}`}
                className="flex items-center gap-1.5"
              >
                <Badge variant={ent.source}>{appLabel(ent.appId, locale)}</Badge>
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
  subscription: Subscription;
  onCancelSubscription: () => void;
  onResubscribe: () => void;
  onManageBilling: () => void;
  onUpgrade: () => void;
}

function StatusSection({
  locale,
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
          subscription={subscription}
          onCancelSubscription={onCancelSubscription}
          onManageBilling={onManageBilling}
        />
      );
    case "canceled":
      return (
        <CanceledSection
          locale={locale}
          subscription={subscription}
          onResubscribe={onResubscribe}
        />
      );
    case "past_due":
      return <PastDueSection locale={locale} onManageBilling={onManageBilling} />;
    case "paused":
      return <PausedSection locale={locale} onResubscribe={onResubscribe} />;
    case "trialing":
      return (
        <TrialingSection
          locale={locale}
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
  status: Exclude<SubscriptionStatus, "expired">;
  icon?: React.ReactNode;
}

function StatusHeader({ locale, status, icon }: StatusHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">Pro</span>
      <Badge variant={status}>{t(`subscription.${status}`, locale)}</Badge>
    </div>
  );
}

interface NoneSectionProps {
  locale: Locale;
  onStartSubscription: () => void;
}

function NoneSection({ locale, onStartSubscription }: NoneSectionProps) {
  return (
    <div className="text-center py-4 space-y-4">
      <CreditCard className="h-8 w-8 text-muted-foreground/40 mx-auto" />
      <p className="text-sm text-muted-foreground">
        {t("subscription.none", locale)}
      </p>
      <Button onClick={onStartSubscription}>
        {t("subscription.start", locale)}
      </Button>
    </div>
  );
}

interface ActiveSectionProps {
  locale: Locale;
  subscription: Subscription;
  onCancelSubscription: () => void;
  onManageBilling: () => void;
}

function ActiveSection({ locale, subscription, onCancelSubscription, onManageBilling }: ActiveSectionProps) {
  return (
    <div className="space-y-4">
      <StatusHeader
        locale={locale}
        status="active"
        icon={<Zap className="h-4 w-4 text-brand" />}
      />
      {subscription.currentPeriodEnd && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {t("subscription.available_until", locale, undefined, {
            date: formatDate(subscription.currentPeriodEnd, locale),
          })}
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onManageBilling}>
          {t("subscription.manage_billing", locale)}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancelSubscription} className="text-destructive hover:text-destructive">
          {t("subscription.cancel", locale)}
        </Button>
      </div>
    </div>
  );
}

interface CanceledSectionProps {
  locale: Locale;
  subscription: Subscription;
  onResubscribe: () => void;
}

function CanceledSection({ locale, subscription, onResubscribe }: CanceledSectionProps) {
  return (
    <div className="space-y-4">
      <StatusHeader locale={locale} status="canceled" />
      {subscription.currentPeriodEnd && (
        <p className="text-sm text-muted-foreground">
          {t("subscription.available_until", locale, undefined, {
            date: formatDate(subscription.currentPeriodEnd, locale),
          })}
        </p>
      )}
      <Button onClick={onResubscribe}>
        {t("subscription.resubscribe", locale)}
      </Button>
    </div>
  );
}

interface PastDueSectionProps {
  locale: Locale;
  onManageBilling: () => void;
}

function PastDueSection({ locale, onManageBilling }: PastDueSectionProps) {
  return (
    <div className="space-y-4">
      <StatusHeader locale={locale} status="past_due" />
      <PaymentFailedBanner locale={locale} onManageBilling={onManageBilling} />
    </div>
  );
}

interface PausedSectionProps {
  locale: Locale;
  onResubscribe: () => void;
}

function PausedSection({ locale, onResubscribe }: PausedSectionProps) {
  return (
    <div className="space-y-4">
      <StatusHeader locale={locale} status="paused" />
      <Button onClick={onResubscribe}>
        {t("subscription.resubscribe", locale)}
      </Button>
    </div>
  );
}

interface TrialingSectionProps {
  locale: Locale;
  subscription: Subscription;
  onUpgrade: () => void;
}

function TrialingSection({ locale, subscription, onUpgrade }: TrialingSectionProps) {
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
        status="trialing"
        icon={<Sparkles className="h-4 w-4 text-brand" />}
      />
      {subscription.trialEndsAt && (
        <p className="text-sm text-muted-foreground">
          {t("trial.banner", locale, undefined, { days: String(daysLeft) })}
        </p>
      )}
      <Button onClick={onUpgrade}>
        {t("trial.upgrade", locale)}
      </Button>
    </div>
  );
}
