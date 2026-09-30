import { SUPPORTER_PRODUCT_499, SUPPORTER_PRODUCT_999 } from "shared";

/** Practice purchases use RevenueCat's Test Store, and only on the dev app. */
export function canUseTestStore(bundleId: string | null | undefined): boolean {
  return bundleId?.endsWith(".dev") === true;
}

/** Where the phone's store lists this person's subscriptions. */
export function storeSubscriptionsUrl(platform: string): string {
  if (platform === "android") {
    return "https://play.google.com/store/account/subscriptions";
  }
  return "https://apps.apple.com/account/subscriptions";
}

export const PAYWALL_BULLETS = [
  "Exclusives from routed artists",
  "Offline listening for entitled tracks",
  "See your impact on artists",
] as const;

export const PAYWALL_PLANS = [
  {
    id: SUPPORTER_PRODUCT_499,
    name: "Supporter",
    price: "$4.99",
    badge: null,
  },
  {
    id: SUPPORTER_PRODUCT_999,
    name: "Champion",
    price: "$9.99",
    badge: "Most supportive",
  },
] as const;
