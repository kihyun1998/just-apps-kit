"use client";

import type { Locale, Theme, TermItem, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { TermsAgreementCard } from "./TermsAgreementCard";

export interface TermsAgreementViewProps {
  locale: Locale;
  theme: Theme;
  terms: TermItem[];
  onToggleLocale: () => void;
  onToggleTheme?: () => void;
  onSubmit: (agreed: Record<string, boolean>) => Promise<void>;
  /** Called when the user declines. When set, a "Decline and leave" link appears under the submit button;
   *  the app wires it to sign-out, going home, or whatever it needs. */
  onCancel?: () => void;
  termsViewUrl?: (type: string, locale: Locale) => string;
  logoText?: string;
  logoHref?: string;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  /** When true, the default header (logo + locale/theme toggles) is not rendered. */
  hideHeader?: boolean;
  /** When true, the default © footer is not rendered. */
  hideFooter?: boolean;
  translations?: TranslationOverrides;
}

export function TermsAgreementView({
  locale,
  theme,
  terms,
  onToggleLocale,
  onToggleTheme,
  onSubmit,
  onCancel,
  termsViewUrl,
  logoText = "Just Apps",
  logoHref = "/",
  headerSlot,
  footerSlot,
  hideHeader = false,
  hideFooter = false,
  translations,
}: TermsAgreementViewProps) {
  const defaultHeader = (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href={logoHref} className="text-lg font-bold tracking-tight">
          {logoText}
        </a>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLocale}
            className="text-xs font-medium px-2"
          >
            {locale === "ko-KR" ? "EN" : "KO"}
          </Button>
          {onToggleTheme && (
            <Button variant="ghost" size="icon" onClick={onToggleTheme}>
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );

  const defaultFooter = (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("footer.copyright", locale, translations)}
        </p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && (headerSlot ?? defaultHeader)}

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <TermsAgreementCard
          locale={locale}
          terms={terms}
          onSubmit={onSubmit}
          onCancel={onCancel}
          termsViewUrl={termsViewUrl}
          translations={translations}
        />
      </main>

      {!hideFooter && (footerSlot ?? defaultFooter)}
    </div>
  );
}
