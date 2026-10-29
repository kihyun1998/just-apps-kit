"use client";

import type { Locale, TranslationOverrides } from "../types";
import { errorMessage, t } from "../i18n";
import { Button } from "../ui/button";
import { GoogleIcon } from "../ui/google-icon";

export interface LoginViewProps {
  locale: Locale;
  onGoogleLogin: () => void;
  /** Sign-in failure code, e.g. `"auth_failed"`. Shown as `login.error.<code>`, or `login.error.generic` when that key has no text. */
  error?: string;
  translations?: TranslationOverrides;
}

export function LoginView({
  locale,
  onGoogleLogin,
  error,
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
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
        >
          {errorMessage("login.error", error, locale, translations)}
        </p>
      )}
      <Button
        className={error ? "mt-4 w-full gap-3" : "mt-8 w-full gap-3"}
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
