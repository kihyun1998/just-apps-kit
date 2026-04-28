"use client";

import { DropdownMenu as DM } from "radix-ui";
import { LogOut, Settings, User } from "lucide-react";
import type { Locale, AuthUser, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { MarbleAvatar } from "../ui/marble-avatar";

export interface UserMenuProps {
  locale: Locale;
  user: AuthUser;
  role: "admin" | "user";
  onMyPage: () => void;
  onAdmin: () => void;
  onSignOut: () => void;
  translations?: TranslationOverrides;
}

const itemClass =
  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm outline-none cursor-default " +
  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground transition-colors";

export function UserMenu({
  locale,
  user,
  role,
  onMyPage,
  onAdmin,
  onSignOut,
  translations,
}: UserMenuProps) {
  const isAdmin = role === "admin";

  return (
    <DM.Root>
      <DM.Trigger asChild>
        <button
          type="button"
          aria-label={user.email ?? undefined}
          className="flex items-center rounded-full transition-[opacity,transform] duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MarbleAvatar name={`justapps:${user.email ?? user.id}`} size={32} />
        </button>
      </DM.Trigger>

      <DM.Portal>
        <DM.Content
          align="end"
          sideOffset={8}
          className={
            "z-50 w-48 rounded-lg border border-border bg-card p-1 shadow-md outline-none " +
            "data-[state=open]:animate-in data-[state=closed]:animate-out " +
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          }
        >
          <DM.Label className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium truncate">{user.email}</p>
            {isAdmin && (
              <span className="text-xs text-muted-foreground">
                {t("usermenu.admin_badge", locale, translations)}
              </span>
            )}
          </DM.Label>

          {isAdmin ? (
            <DM.Item onSelect={onAdmin} className={itemClass}>
              <Settings className="h-4 w-4" />
              {t("usermenu.admin", locale, translations)}
            </DM.Item>
          ) : (
            <DM.Item onSelect={onMyPage} className={itemClass}>
              <User className="h-4 w-4" />
              {t("usermenu.mypage", locale, translations)}
            </DM.Item>
          )}

          <DM.Item
            onSelect={onSignOut}
            className={`${itemClass} text-destructive`}
          >
            <LogOut className="h-4 w-4" />
            {t("usermenu.logout", locale, translations)}
          </DM.Item>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}
