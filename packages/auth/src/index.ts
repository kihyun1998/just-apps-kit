export { LoginView, type LoginViewProps } from "./components/LoginView";
export {
  TermsAgreementView,
  type TermsAgreementViewProps,
} from "./components/TermsAgreementView";
export {
  TermsAgreementCard,
  type TermsAgreementCardProps,
} from "./components/TermsAgreementCard";
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
export {
  LoginButton,
  type LoginButtonProps,
} from "./components/LoginButton";

export { Button, type ButtonProps, buttonVariants } from "./ui/button";
export { Spinner } from "./ui/spinner";
export { GoogleIcon } from "./ui/google-icon";
export { MarbleAvatar } from "./ui/marble-avatar";

export { t, type TranslationKey } from "./i18n";

export type {
  Locale,
  Theme,
  AuthUser,
  TermItem,
  TranslationOverrides,
} from "./types";

export { cn } from "./lib/utils";

// Terms exports live in the server-safe "./terms" entry, not here — docs/map/invariant/client-server-entry-split.md
