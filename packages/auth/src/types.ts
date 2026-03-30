export type Locale = "ko-KR" | "en-US";
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

export type TranslationOverrides = Partial<
  Record<string, Record<Locale, string>>
>;
