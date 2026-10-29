export type Locale = "ko-KR" | "en-US";

export type TranslationOverrides = Partial<
  Record<string, Record<Locale, string>>
>;

export type Dictionary = Record<string, Record<Locale, string>>;

/**
 * The text for `key`: an override for that key and locale (an empty string counts), then the
 * dictionary, then the key itself. Each `{name}` in the text is replaced with `params[name]`.
 */
export function translate(
  dictionary: Dictionary,
  key: string,
  locale: Locale,
  overrides?: TranslationOverrides,
  params?: Record<string, string>
): string {
  let value = overrides?.[key]?.[locale] ?? dictionary[key]?.[locale] ?? key;
  if (params) {
    for (const [name, replacement] of Object.entries(params)) {
      value = value.split(`{${name}}`).join(replacement);
    }
  }
  return value;
}
