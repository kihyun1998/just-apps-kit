export type { Locale, TranslationOverrides } from "../../../shared/i18n";
import type { Locale } from "../../../shared/i18n";
export type Theme = "light" | "dark";

export interface AuthUser {
  id: string;
  email?: string | null;
  created_at?: string;
}

export interface TermItem {
  id: string;
  type: string;
  title: string;
  required: boolean;
  content?: string;
}
