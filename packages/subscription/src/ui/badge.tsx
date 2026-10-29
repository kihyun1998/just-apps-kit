import { cn } from "../lib/utils";
import type { EntitlementSource, SubscriptionStatus } from "../types";

const statusVariants: Record<SubscriptionStatus, string> = {
  active: "bg-brand/15 text-brand dark:bg-brand/20 dark:text-brand",
  trialing: "bg-accent text-accent-foreground",
  canceled: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground opacity-60",
  past_due: "bg-destructive/15 text-destructive dark:bg-destructive/20",
  paused: "bg-secondary text-secondary-foreground",
};

const sourceVariants: Record<EntitlementSource, string> = {
  admin: "bg-brand/15 text-brand dark:bg-brand/20 dark:text-brand",
  subscription: "bg-brand/15 text-brand dark:bg-brand/20 dark:text-brand",
  promo: "bg-accent text-accent-foreground",
  trial: "bg-accent text-accent-foreground",
};

const variants: Record<string, string> = {
  ...statusVariants,
  ...sourceVariants,
  default: "bg-muted text-muted-foreground",
};

export type BadgeVariant = SubscriptionStatus | EntitlementSource | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant] ?? variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
