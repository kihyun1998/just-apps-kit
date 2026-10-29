import { translate, type Dictionary } from "../../../../shared/i18n";
import type { Locale, TranslationOverrides } from "../types";
import { dict } from "./translations";

const lookup: Dictionary = dict;

export type TranslationKey = keyof typeof dict;

export function t(
  key: string,
  locale: Locale,
  overrides?: TranslationOverrides,
  params?: Record<string, string>
): string {
  return translate(lookup, key, locale, overrides, params);
}
