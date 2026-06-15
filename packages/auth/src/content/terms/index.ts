import type { Locale } from "../../types";
import termsOfServiceKo from "./terms_of_service.ko-KR.md";
import termsOfServiceEn from "./terms_of_service.en-US.md";
import privacyPolicyKo from "./privacy_policy.ko-KR.md";
import privacyPolicyEn from "./privacy_policy.en-US.md";
import marketingKo from "./marketing.ko-KR.md";
import marketingEn from "./marketing.en-US.md";

/**
 * 가족 전체의 단일 terms 소스 (ADR: just-learn 0008). 콘텐츠·버전은 여기 한 곳에만 살고,
 * homepage·just-learn 등 모든 앱이 이걸 import한다. 마크다운은 패키지 빌드(tsup의 .md
 * text 로더)가 문자열로 인라인하므로 소비 앱의 `?raw` 지원에 의존하지 않는다.
 */
export interface TermData {
  id: string;
  type: string;
  title: string;
  content: string;
  required: boolean;
  version: number;
  effective_date: string;
}

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, content: match[2].trim() };
}

function toTermData(raw: string, id: string): TermData {
  const { meta, content } = parseFrontmatter(raw);
  const parsedVersion = meta.version ? parseInt(meta.version, 10) : 1;
  return {
    id,
    type: meta.type ?? id,
    title: meta.title ?? "",
    content,
    required: meta.required === "true",
    version: Number.isFinite(parsedVersion) ? parsedVersion : 1,
    effective_date: meta.effective_date ?? "",
  };
}

const allTerms: Record<Locale, TermData[]> = {
  "ko-KR": [
    toTermData(termsOfServiceKo, "terms_of_service_ko-KR"),
    toTermData(privacyPolicyKo, "privacy_policy_ko-KR"),
    toTermData(marketingKo, "marketing_ko-KR"),
  ],
  "en-US": [
    toTermData(termsOfServiceEn, "terms_of_service_en-US"),
    toTermData(privacyPolicyEn, "privacy_policy_en-US"),
    toTermData(marketingEn, "marketing_en-US"),
  ],
};

export function getTermsByLocale(locale: Locale | string): TermData[] {
  return allTerms[locale as Locale] ?? allTerms["en-US"];
}

export function getTermByType(
  type: string,
  locale: Locale | string,
): TermData | null {
  return getTermsByLocale(locale).find((t) => t.type === type) ?? null;
}
