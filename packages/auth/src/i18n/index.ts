import type { Locale, TranslationOverrides } from "../types";

const dict: Record<string, Record<Locale, string>> = {
  // Login
  "login.title": { "ko-KR": "로그인", "en-US": "Login" },
  "login.subtitle": {
    "ko-KR": "Google 계정으로 시작하세요.",
    "en-US": "Get started with your Google account.",
  },
  "login.google": { "ko-KR": "Google로 로그인", "en-US": "Sign in with Google" },

  // Terms Agreement
  "terms.title": { "ko-KR": "약관 동의", "en-US": "Terms Agreement" },
  "terms.subtitle": {
    "ko-KR": "서비스 이용을 위해 약관에 동의해주세요.",
    "en-US": "Please agree to the terms to use our service.",
  },
  "terms.agree_all": { "ko-KR": "전체 동의", "en-US": "Agree to all" },
  "terms.required": { "ko-KR": "필수", "en-US": "Required" },
  "terms.optional": { "ko-KR": "선택", "en-US": "Optional" },
  "terms.agree_suffix": { "ko-KR": "동의", "en-US": "" },
  "terms.view": { "ko-KR": "보기", "en-US": "View" },
  "terms.submit": { "ko-KR": "동의하고 시작하기", "en-US": "Agree and Get Started" },
  "terms.decline": {
    "ko-KR": "동의하지 않고 나가기",
    "en-US": "Decline and leave",
  },

  // My Page
  "mypage.title": { "ko-KR": "마이페이지", "en-US": "My Page" },
  "mypage.email": { "ko-KR": "이메일", "en-US": "Email" },
  "mypage.joined": { "ko-KR": "가입일", "en-US": "Joined" },
  "mypage.delete_account": { "ko-KR": "계정 삭제", "en-US": "Delete Account" },
  "mypage.logout": { "ko-KR": "로그아웃", "en-US": "Sign Out" },

  // Account Delete
  "delete.title": { "ko-KR": "계정 삭제", "en-US": "Delete Account" },
  "delete.subtitle": {
    "ko-KR": "Just Apps 계정을 삭제하면 관련된 모든 데이터가 영구적으로 삭제됩니다.",
    "en-US": "Deleting your Just Apps account will permanently remove all associated data.",
  },
  "delete.login_required": {
    "ko-KR": "계정 삭제를 진행하려면 먼저 로그인해주세요.",
    "en-US": "Please sign in first to delete your account.",
  },
  "delete.login": { "ko-KR": "Google로 로그인", "en-US": "Sign in with Google" },
  "delete.data_title": { "ko-KR": "삭제되는 데이터", "en-US": "Data to be deleted" },
  "delete.data_email": {
    "ko-KR": "이메일 주소 (계정 정보)",
    "en-US": "Email address (account info)",
  },
  "delete.data_agreements": {
    "ko-KR": "약관 동의 기록",
    "en-US": "Terms agreement records",
  },
  "delete.data_activity": {
    "ko-KR": "앱 활동 데이터",
    "en-US": "App activity data",
  },
  "delete.warning": {
    "ko-KR": "삭제된 계정과 데이터는 복구할 수 없습니다. 모든 데이터는 요청 즉시 삭제됩니다.",
    "en-US": "Deleted accounts and data cannot be recovered. All data is deleted immediately upon request.",
  },
  "delete.confirm_button": { "ko-KR": "계정 삭제", "en-US": "Delete Account" },
  "delete.confirm_title": {
    "ko-KR": "정말 삭제하시겠습니까?",
    "en-US": "Are you sure?",
  },
  "delete.confirm_message": {
    "ko-KR": "이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.",
    "en-US": "This action cannot be undone. All your data will be permanently deleted.",
  },
  "delete.confirm_yes": { "ko-KR": "삭제", "en-US": "Delete" },
  "delete.confirm_cancel": { "ko-KR": "취소", "en-US": "Cancel" },
  "delete.processing": { "ko-KR": "삭제 중...", "en-US": "Deleting..." },
  "delete.success": {
    "ko-KR": "계정이 삭제되었습니다.",
    "en-US": "Your account has been deleted.",
  },

  // UserMenu
  "usermenu.admin": { "ko-KR": "관리자 페이지", "en-US": "Admin Dashboard" },
  "usermenu.admin_badge": { "ko-KR": "Admin", "en-US": "Admin" },
  "usermenu.mypage": { "ko-KR": "마이페이지", "en-US": "My Page" },
  "usermenu.logout": { "ko-KR": "로그아웃", "en-US": "Logout" },

  // Common
  "common.loading": { "ko-KR": "로딩 중...", "en-US": "Loading..." },
  "common.auth_processing": {
    "ko-KR": "로그인 처리 중...",
    "en-US": "Processing login...",
  },
  "common.login": { "ko-KR": "로그인", "en-US": "Login" },
  "common.go_home": { "ko-KR": "홈으로", "en-US": "Go Home" },

  // Footer (TermsAgreementView 간이 푸터)
  "footer.copyright": {
    "ko-KR": "\u00a9 2026 Just Apps. All rights reserved.",
    "en-US": "\u00a9 2026 Just Apps. All rights reserved.",
  },
};

export type TranslationKey = keyof typeof dict;

export function t(
  key: string,
  locale: Locale,
  overrides?: TranslationOverrides
): string {
  if (overrides?.[key]?.[locale]) {
    return overrides[key][locale];
  }
  return dict[key]?.[locale] ?? key;
}
