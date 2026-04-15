import type { Locale, TranslationOverrides } from "../types";
import { dict } from "./translations";

export type TranslationKey = keyof typeof dict;

export function t(
  key: string,
  locale: Locale,
  overrides?: TranslationOverrides,
  params?: Record<string, string>
): string {
  let value = overrides?.[key]?.[locale] ?? dict[key]?.[locale] ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, v);
    }
  }

  return value;
}
