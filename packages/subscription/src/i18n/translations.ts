import type { Locale } from "../types";

export const dict = {
  "subscription.title": { "ko-KR": "구독 관리", "en-US": "Manage Subscription" },
  "subscription.active": { "ko-KR": "구독 중", "en-US": "Active" },
  "subscription.canceled": { "ko-KR": "취소됨", "en-US": "Canceled" },
  "subscription.past_due": { "ko-KR": "결제 실패", "en-US": "Past Due" },
  "subscription.paused": { "ko-KR": "일시정지", "en-US": "Paused" },
  "subscription.trialing": { "ko-KR": "체험 중", "en-US": "Trial" },
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

  "trial.banner": {
    "ko-KR": "Pro 체험 중 — {days}일 남음",
    "en-US": "Pro trial — {days} days left",
  },
  "trial.upgrade": { "ko-KR": "Pro로 전환", "en-US": "Upgrade to Pro" },

  "app.logo": { "ko-KR": "Just Make Logo", "en-US": "Just Make Logo" },

  "common.error": {
    "ko-KR": "구독 정보를 확인할 수 없습니다. 새로고침해 주세요.",
    "en-US": "Unable to load subscription info. Please refresh.",
  },
} satisfies Record<string, Record<Locale, string>>;
