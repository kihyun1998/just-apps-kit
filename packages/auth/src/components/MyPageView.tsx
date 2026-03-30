"use client";

import type { Locale, AuthUser, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { Button } from "../ui/button";
import { LogOut, Trash2, Mail, Calendar } from "lucide-react";

export interface MyPageViewProps {
  locale: Locale;
  user: AuthUser;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  translations?: TranslationOverrides;
}

export function MyPageView({
  locale,
  user,
  onSignOut,
  onDeleteAccount,
  translations,
}: MyPageViewProps) {
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6">
        {t("mypage.title", locale, translations)}
      </h1>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">
              {t("mypage.email", locale, translations)}
            </p>
            <p className="text-sm font-medium">{user.email ?? "-"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">
              {t("mypage.joined", locale, translations)}
            </p>
            <p className="text-sm font-medium">{joinedDate}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          {t("mypage.logout", locale, translations)}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={onDeleteAccount}
        >
          <Trash2 className="h-4 w-4" />
          {t("mypage.delete_account", locale, translations)}
        </Button>
      </div>
    </div>
  );
}
