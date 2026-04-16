"use client";

import { useState, useEffect } from "react";
import type { Locale, TermItem, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { ShieldCheck } from "lucide-react";

interface CheckableTerm {
  id: string;
  type: string;
  title: string;
  required: boolean;
  checked: boolean;
}

export interface TermsAgreementCardProps {
  locale: Locale;
  terms: TermItem[];
  onSubmit: (agreed: Record<string, boolean>) => Promise<void>;
  onCancel?: () => void;
  termsViewUrl?: (type: string, locale: Locale) => string;
  translations?: TranslationOverrides;
  /** 카드 최외곽 div에 추가로 붙일 className. 너비 / margin / 배경 커스터마이즈용. */
  className?: string;
}

export function TermsAgreementCard({
  locale,
  terms: termItems,
  onSubmit,
  onCancel,
  termsViewUrl,
  translations,
  className,
}: TermsAgreementCardProps) {
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

  const baseClassName =
    "w-full max-w-md rounded-xl border border-border bg-card p-8";

  return (
    <div className={className ? `${baseClassName} ${className}` : baseClassName}>
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
            <div key={term.id} className="flex items-center justify-between">
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

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("terms.decline", locale, translations)}
        </button>
      )}
    </div>
  );
}
