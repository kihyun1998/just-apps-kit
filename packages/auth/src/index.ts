// Components
export { LoginView, type LoginViewProps } from "./components/LoginView";
export {
  TermsAgreementView,
  type TermsAgreementViewProps,
} from "./components/TermsAgreementView";
export { MyPageView, type MyPageViewProps } from "./components/MyPageView";
export {
  AccountDeleteView,
  type AccountDeleteViewProps,
} from "./components/AccountDeleteView";
export {
  AuthCallbackView,
  type AuthCallbackViewProps,
} from "./components/AuthCallbackView";
export { UserMenu, type UserMenuProps } from "./components/UserMenu";

// UI
export { Button, type ButtonProps, buttonVariants } from "./ui/button";
export { Spinner } from "./ui/spinner";
export { GoogleIcon } from "./ui/google-icon";
export { BoringAvatar } from "./ui/boring-avatar";

// i18n
export { t, type TranslationKey } from "./i18n";

// Types
export type {
  Locale,
  Theme,
  AuthUser,
  TermItem,
  TranslationOverrides,
} from "./types";

// Utils
export { cn } from "./lib/utils";
