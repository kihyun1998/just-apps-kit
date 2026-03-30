"use client";

import { useState } from "react";
import type { Locale, AuthUser, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { Button } from "../ui/button";
import { GoogleIcon } from "../ui/google-icon";
import { AlertTriangle, Trash2 } from "lucide-react";

export interface AccountDeleteViewProps {
  locale: Locale;
  user: AuthUser | null;
  onGoogleLogin: () => void;
  onDelete: () => Promise<void>;
  onGoHome: () => void;
  translations?: TranslationOverrides;
}

export function AccountDeleteView({
  locale,
  user,
  onGoogleLogin,
  onDelete,
  onGoHome,
  translations,
}: AccountDeleteViewProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
      setDeleted(true);
      setShowConfirm(false);
    } catch (e) {
      console.error("Delete account error:", e);
    } finally {
      setDeleting(false);
    }
  };

  const dataItems = [
    t("delete.data_email", locale, translations),
    t("delete.data_agreements", locale, translations),
    t("delete.data_activity", locale, translations),
  ];

  if (deleted) {
    return (
      <div className="w-full max-w-md text-center">
        <p className="text-lg font-medium">
          {t("delete.success", locale, translations)}
        </p>
        <Button className="mt-6" variant="outline" onClick={onGoHome}>
          {t("common.go_home", locale, translations)}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h1 className="text-xl font-bold">
            {t("delete.title", locale, translations)}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {t("delete.subtitle", locale, translations)}
        </p>

        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3">
            {t("delete.data_title", locale, translations)}
          </h2>
          <ul className="space-y-2">
            {dataItems.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 rounded-lg bg-destructive/10 p-4 mb-6">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            {t("delete.warning", locale, translations)}
          </p>
        </div>

        {user ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
            {!showConfirm ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowConfirm(true)}
              >
                {t("delete.confirm_button", locale, translations)}
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
                <p className="text-sm font-medium">
                  {t("delete.confirm_title", locale, translations)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("delete.confirm_message", locale, translations)}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirm(false)}
                    disabled={deleting}
                  >
                    {t("delete.confirm_cancel", locale, translations)}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting
                      ? t("delete.processing", locale, translations)
                      : t("delete.confirm_yes", locale, translations)}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t("delete.login_required", locale, translations)}
            </p>
            <Button
              variant="outline"
              className="w-full gap-3"
              size="lg"
              onClick={onGoogleLogin}
            >
              <GoogleIcon />
              {t("delete.login", locale, translations)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
