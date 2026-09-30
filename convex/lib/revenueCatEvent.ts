import {
  SUPPORTER_ENTITLEMENT,
  SUPPORTER_PRODUCT_499,
  SUPPORTER_PRODUCT_999,
} from "shared";

export { SUPPORTER_ENTITLEMENT };

export const PRODUCT_499 = SUPPORTER_PRODUCT_499;
export const PRODUCT_999 = SUPPORTER_PRODUCT_999;

/** Convex rejects object keys that start with `$`. RevenueCat sends those on attributes. */
export function withoutReservedKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => withoutReservedKeys(item));
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  const safe: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith("$")) {
      continue;
    }
    safe[key] = withoutReservedKeys(child);
  }
  return safe;
}

export type PriceTier = "4.99" | "9.99";
export type EntitlementStore = "app_store" | "play_store" | "test_store";
export type EntitlementStatus = "active" | "expired";

export type AppliedEntitlement = {
  profileId: string;
  status: EntitlementStatus;
  productId: string;
  priceTier: PriceTier;
  store: EntitlementStore;
  currentPeriodEnd: number;
  willRenew: boolean;
  eventId: string;
};

const ACTIVE_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
]);

export function priceTierForProduct(productId: string): PriceTier {
  if (productId.includes("999") || productId.endsWith("9.99")) {
    return "9.99";
  }
  return "4.99";
}

export function storeForRevenueCat(
  store: string | undefined
): EntitlementStore {
  if (store === "PLAY_STORE") {
    return "play_store";
  }
  if (store === "APP_STORE" || store === "MAC_APP_STORE") {
    return "app_store";
  }
  return "test_store";
}

type WebhookEvent = {
  id?: unknown;
  type?: unknown;
  app_user_id?: unknown;
  product_id?: unknown;
  expiration_at_ms?: unknown;
  store?: unknown;
};

function asEvent(body: unknown): WebhookEvent | null {
  if (typeof body !== "object" || body === null || !("event" in body)) {
    return null;
  }
  const event = (body as { event?: unknown }).event;
  if (typeof event !== "object" || event === null) {
    return null;
  }
  return event as WebhookEvent;
}

/**
 * Turns one RevenueCat webhook body into the entitlement write, or null when
 * the event should be acknowledged and ignored (billing issues, unknown types).
 */
export function entitlementFromWebhook(
  body: unknown
):
  | AppliedEntitlement
  | { ignore: true; eventId: string; eventType: string }
  | null {
  const event = asEvent(body);
  if (event === null) {
    return null;
  }
  const eventId = typeof event.id === "string" ? event.id : "";
  const eventType = typeof event.type === "string" ? event.type : "";
  const profileId =
    typeof event.app_user_id === "string" ? event.app_user_id : "";
  if (eventId.length === 0 || profileId.length === 0) {
    return null;
  }
  if (eventType === "BILLING_ISSUE" || !knownType(eventType)) {
    return { ignore: true, eventId, eventType };
  }

  const productId =
    typeof event.product_id === "string" && event.product_id.length > 0
      ? event.product_id
      : PRODUCT_499;
  const expiration =
    typeof event.expiration_at_ms === "number" ? event.expiration_at_ms : 0;

  if (eventType === "EXPIRATION") {
    return {
      profileId,
      status: "expired",
      productId,
      priceTier: priceTierForProduct(productId),
      store: storeForRevenueCat(
        typeof event.store === "string" ? event.store : undefined
      ),
      currentPeriodEnd: expiration,
      willRenew: false,
      eventId,
    };
  }

  return {
    profileId,
    status: "active",
    productId,
    priceTier: priceTierForProduct(productId),
    store: storeForRevenueCat(
      typeof event.store === "string" ? event.store : undefined
    ),
    currentPeriodEnd: expiration,
    willRenew: eventType !== "CANCELLATION",
    eventId,
  };
}

function knownType(eventType: string): boolean {
  return (
    ACTIVE_TYPES.has(eventType) ||
    eventType === "CANCELLATION" ||
    eventType === "EXPIRATION"
  );
}

type SubscriberEntitlement = {
  expires_date?: string | null;
  product_identifier?: string;
};

type SubscriberPayload = {
  subscriber?: {
    entitlements?: Record<string, SubscriberEntitlement | undefined>;
    subscriptions?: Record<
      string,
      { store?: string; unsubscribe_detected_at?: string | null } | undefined
    >;
  };
};

/** Reads the Supporter entitlement from RevenueCat's subscriber REST payload. */
export function entitlementFromSubscriber(
  profileId: string,
  payload: unknown,
  now: number
): AppliedEntitlement | { none: true } {
  if (typeof payload !== "object" || payload === null) {
    return { none: true };
  }
  const supporter = (payload as SubscriberPayload).subscriber?.entitlements?.[
    SUPPORTER_ENTITLEMENT
  ];
  if (supporter === undefined) {
    return { none: true };
  }
  const productId = supporter.product_identifier ?? PRODUCT_499;
  const expiresAt = Date.parse(supporter.expires_date ?? "");
  const currentPeriodEnd = Number.isFinite(expiresAt) ? expiresAt : 0;
  const subscription = (payload as SubscriberPayload).subscriber
    ?.subscriptions?.[productId];
  const active = currentPeriodEnd > now;
  return {
    profileId,
    status: active ? "active" : "expired",
    productId,
    priceTier: priceTierForProduct(productId),
    store: storeForRevenueCat(subscription?.store),
    currentPeriodEnd,
    willRenew: active && subscription?.unsubscribe_detected_at == null,
    eventId: `sync:${profileId}:${currentPeriodEnd}`,
  };
}
