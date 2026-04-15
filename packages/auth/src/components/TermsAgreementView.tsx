"use client";

import { useState, useEffect } from "react";
import type { Locale, Theme, TermItem, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Moon, Sun, ShieldCheck } from "lucide-react";

interface CheckableTerm {
  id: string;
  type: string;
  title: string;
  required: boolean;
  checked: boolean;
}

export interface TermsAgreementViewProps {
  locale: Locale;
  theme: Theme;
  terms: TermItem[];
  onToggleLocale: () => void;
  onToggleTheme?: () => void;
  onSubmit: (agreed: Record<string, boolean>) => Promise<void>;
  termsViewUrl?: (type: string, locale: Locale) => string;
  logoText?: string;
  logoHref?: string;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  translations?: TranslationOverrides;
}

export function TermsAgreementView({
  locale,
  theme,
  terms: termItems,
  onToggleLocale,
  onToggleTheme,
  onSubmit,
  termsViewUrl,
  logoText = "Just Apps",
  logoHref = "/",
  headerSlot,
  footerSlot,
  translations,
}: TermsAgreementViewProps) {
  const [terms, setTerms] = useState<CheckableTerm[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTerms(termItems.map((item) => ({ ...item, checked: false })));
  }, [termItems]);

  const allRequiredChecked =
    terms.length > 0 &&
    terms.filter((item) => item.required).every((item) => item.checked);

  const allChecked = terms.length > 0 && terms.every((item) => item.checked);

  const toggleAll = () => {
    const next = !allChecked;
    setTerms((prev) => prev.map((item) => ({ ...item, checked: next })));
  };

  const toggle = (id: string) => {
    setTerms((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!allRequiredChecked) return;
    setSubmitting(true);
    try {
      const agreed: Record<string, boolean> = {};
      for (const term of terms) {
        agreed[term.type] = term.checked;
      }
      await onSubmit(agreed);
    } catch (e) {
      console.error("Terms submission error:", e);
    } finally {
      setSubmitting(false);
    }
  };

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
      {headerSlot ?? defaultHeader}

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">
              {t("terms.title", locale, translations)}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("terms.subtitle", locale, translations)}
            </p>
          </div>

          <div className="mt-8">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-accent px-4 py-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="h-4 w-4 accent-foreground"
              />
              <span className="text-sm font-semibold">
                {t("terms.agree_all", locale, translations)}
              </span>
            </label>

            <div className="my-4 border-t border-border" />

            <div className="flex flex-col gap-3">
              {terms.map((term) => (
                <div
                  key={term.id}
                  className="flex items-center justify-between"
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={term.checked}
                      onChange={() => toggle(term.id)}
                      className="h-4 w-4 accent-foreground"
                    />
                    <span className="text-sm">
                      <span className="text-muted-foreground">
                        [
                        {term.required
                          ? t("terms.required", locale, translations)
                          : t("terms.optional", locale, translations)}
                        ]
                      </span>{" "}
                      {term.title}{" "}
                      {t("terms.agree_suffix", locale, translations)}
                    </span>
                  </label>
                  {termsViewUrl && (
                    <a
                      href={termsViewUrl(term.type, locale)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      {t("terms.view", locale, translations)}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            className="mt-8 w-full"
            size="lg"
            disabled={!allRequiredChecked || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <Spinner size="sm" className="text-primary-foreground" />
            ) : (
              t("terms.submit", locale, translations)
            )}
          </Button>
        </div>
      </main>

      {footerSlot ?? defaultFooter}
    </div>
  );
}
