"use client";

import type { Locale, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { Button } from "../ui/button";
import { GoogleIcon } from "../ui/google-icon";

export interface LoginViewProps {
  locale: Locale;
  onGoogleLogin: () => void;
  translations?: TranslationOverrides;
}

export function LoginView({
  locale,
  onGoogleLogin,
  translations,
}: LoginViewProps) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {t("login.title", locale, translations)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("login.subtitle", locale, translations)}
        </p>
      </div>
      <Button
        className="mt-8 w-full gap-3"
        variant="outline"
        size="lg"
        onClick={onGoogleLogin}
      >
        <GoogleIcon />
        {t("login.google", locale, translations)}
      </Button>
    </div>
  );
}
