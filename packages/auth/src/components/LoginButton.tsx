"use client";

import type { Locale, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { Button } from "../ui/button";
import { LogIn } from "lucide-react";

export interface LoginButtonProps {
  locale: Locale;
  onClick: () => void;
  translations?: TranslationOverrides;
}

export function LoginButton({
  locale,
  onClick,
  translations,
}: LoginButtonProps) {
  return (
    <Button variant="default" size="sm" onClick={onClick}>
      <LogIn className="h-4 w-4" />
      {t("common.login", locale, translations)}
    </Button>
  );
}
