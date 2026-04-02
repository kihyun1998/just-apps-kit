import type { Locale } from "../types";

export const dict: Record<string, Record<Locale, string>> = {
  // Pricing
  "pricing.title": { "ko-KR": "요금제", "en-US": "Pricing" },
  "pricing.subtitle": {
    "ko-KR": "하나의 구독으로 모든 앱의 Pro 기능을 이용하세요.",
    "en-US": "Unlock Pro features across all apps with one subscription.",
  },
  "pricing.monthly": { "ko-KR": "월간", "en-US": "Monthly" },
  "pricing.yearly": { "ko-KR": "연간", "en-US": "Yearly" },
  "pricing.free": { "ko-KR": "Free", "en-US": "Free" },
  "pricing.pro": { "ko-KR": "Pro", "en-US": "Pro" },
  "pricing.current_plan": { "ko-KR": "현재 플랜", "en-US": "Current Plan" },
  "pricing.select": { "ko-KR": "선택하기", "en-US": "Get Started" },

  // Subscription status
  "subscription.title": { "ko-KR": "구독 관리", "en-US": "Manage Subscription" },
  "subscription.active": { "ko-KR": "구독 중", "en-US": "Active" },
  "subscription.canceled": { "ko-KR": "취소됨", "en-US": "Canceled" },
  "subscription.past_due": { "ko-KR": "결제 실패", "en-US": "Past Due" },
  "subscription.paused": { "ko-KR": "일시정지", "en-US": "Paused" },
  "subscription.trialing": { "ko-KR": "체험 중", "en-US": "Trial" },
  "subscription.expired": { "ko-KR": "만료됨", "en-US": "Expired" },
  "subscription.none": {
    "ko-KR": "구독 중인 플랜이 없습니다.",
    "en-US": "You don't have an active subscription.",
  },
  "subscription.cancel": { "ko-KR": "구독 취소", "en-US": "Cancel Subscription" },
  "subscription.resubscribe": { "ko-KR": "다시 구독하기", "en-US": "Resubscribe" },
  "subscription.manage_billing": {
    "ko-KR": "결제 수단 관리",
    "en-US": "Manage Billing",
  },
  "subscription.available_until": {
    "ko-KR": "{date}까지 이용 가능",
    "en-US": "Available until {date}",
  },
  "subscription.start": { "ko-KR": "구독 시작하기", "en-US": "Start Subscription" },

  // Upgrade modal
  "upgrade.title": { "ko-KR": "Pro로 업그레이드", "en-US": "Upgrade to Pro" },
  "upgrade.description": {
    "ko-KR": "이 기능은 Pro 플랜에서 사용할 수 있습니다.",
    "en-US": "This feature is available on the Pro plan.",
  },
  "upgrade.description.feature": {
    "ko-KR": "{feature} 기능은 Pro 플랜에서 사용할 수 있습니다.",
    "en-US": "{feature} is available on the Pro plan.",
  },
  "upgrade.button": { "ko-KR": "업그레이드", "en-US": "Upgrade" },
  "upgrade.cancel": { "ko-KR": "닫기", "en-US": "Close" },

  // Payment failed banner
  "payment_failed.title": {
    "ko-KR": "결제에 실패했습니다.",
    "en-US": "Payment failed.",
  },
  "payment_failed.description": {
    "ko-KR": "결제 수단을 확인해주세요. 해결되지 않으면 구독이 중단됩니다.",
    "en-US":
      "Please check your payment method. Your subscription will be suspended if not resolved.",
  },
  "payment_failed.action": {
    "ko-KR": "결제 수단 관리",
    "en-US": "Manage Payment",
  },

  // Trial banner
  "trial.banner": {
    "ko-KR": "Pro 체험 중 — {days}일 남음",
    "en-US": "Pro trial — {days} days left",
  },
  "trial.upgrade": { "ko-KR": "Pro로 전환", "en-US": "Upgrade to Pro" },
  "trial.start": { "ko-KR": "7일 무료 체험 시작", "en-US": "Start 7-day free trial" },

  // Badge
  "badge.pro": { "ko-KR": "Pro", "en-US": "Pro" },
  "badge.free": { "ko-KR": "Free", "en-US": "Free" },

  // App names
  "app.logo": { "ko-KR": "Just Make Logo", "en-US": "Just Make Logo" },

  // Common
  "common.loading": { "ko-KR": "로딩 중...", "en-US": "Loading..." },
  "common.error": {
    "ko-KR": "구독 정보를 확인할 수 없습니다. 새로고침해 주세요.",
    "en-US": "Unable to load subscription info. Please refresh.",
  },
};
