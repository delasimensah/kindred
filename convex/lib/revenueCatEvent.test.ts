import { describe, expect, it } from "vitest";

import {
  entitlementFromSubscriber,
  entitlementFromWebhook,
  priceTierForProduct,
  withoutReservedKeys,
} from "./revenueCatEvent";

describe("revenueCatEvent", () => {
  it("drops RevenueCat attribute names that start with $", () => {
    const safe = withoutReservedKeys({
      event: {
        id: "evt_1",
        subscriber_attributes: {
          $attConsentStatus: { value: "denied" },
          displayName: { value: "Efua" },
        },
      },
    });
    expect(safe).toEqual({
      event: {
        id: "evt_1",
        subscriber_attributes: {
          displayName: { value: "Efua" },
        },
      },
    });
  });

  it("maps a test-store purchase onto the $4.99 tier", () => {
    const applied = entitlementFromWebhook({
      event: {
        id: "evt_1",
        type: "INITIAL_PURCHASE",
        app_user_id: "profile_1",
        product_id: "supporter_monthly_499",
        expiration_at_ms: 1_700_000_000_000,
        store: "TEST_STORE",
      },
    });
    expect(applied).toMatchObject({
      profileId: "profile_1",
      status: "active",
      priceTier: "4.99",
      store: "test_store",
      willRenew: true,
      eventId: "evt_1",
    });
  });

  it("keeps access after cancel and ends it on expiration", () => {
    const cancelled = entitlementFromWebhook({
      event: {
        id: "evt_2",
        type: "CANCELLATION",
        app_user_id: "profile_1",
        product_id: "supporter_monthly_999",
        expiration_at_ms: 1_800_000_000_000,
        store: "APP_STORE",
      },
    });
    expect(cancelled).toMatchObject({
      status: "active",
      priceTier: "9.99",
      willRenew: false,
      store: "app_store",
    });
    const expired = entitlementFromWebhook({
      event: {
        id: "evt_3",
        type: "EXPIRATION",
        app_user_id: "profile_1",
        product_id: "supporter_monthly_999",
        expiration_at_ms: 1_800_000_000_000,
        store: "PLAY_STORE",
      },
    });
    expect(expired).toMatchObject({
      status: "expired",
      store: "play_store",
      willRenew: false,
    });
  });

  it("ignores a billing issue and reads an active subscriber payload", () => {
    expect(
      entitlementFromWebhook({
        event: {
          id: "evt_4",
          type: "BILLING_ISSUE",
          app_user_id: "profile_1",
        },
      })
    ).toEqual({ ignore: true, eventId: "evt_4", eventType: "BILLING_ISSUE" });

    expect(priceTierForProduct("supporter_monthly_999")).toBe("9.99");
    const row = entitlementFromSubscriber(
      "profile_1",
      {
        subscriber: {
          entitlements: {
            supporter: {
              expires_date: "2099-01-01T00:00:00Z",
              product_identifier: "supporter_monthly_499",
            },
          },
          subscriptions: {
            supporter_monthly_499: { store: "TEST_STORE" },
          },
        },
      },
      Date.parse("2026-01-01T00:00:00Z")
    );
    expect(row).toMatchObject({ status: "active", store: "test_store" });
  });
});
