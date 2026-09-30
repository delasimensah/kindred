/** RevenueCat entitlement id. Both monthly prices grant this same access. */
export const SUPPORTER_ENTITLEMENT = "supporter";

/** RevenueCat product id for the $4.99 monthly plan. */
export const SUPPORTER_PRODUCT_499 = "supporter_monthly_499";

/** RevenueCat product id for the $9.99 monthly plan. */
export const SUPPORTER_PRODUCT_999 = "supporter_monthly_999";

/** The first people to route to an artist. Later joiners do not take a slot if someone leaves. */
export const FOUNDING_SUPPORTER_LIMIT = 10;

export function isFoundingSupporter(routesStartedBefore: number): boolean {
  return routesStartedBefore < FOUNDING_SUPPORTER_LIMIT;
}
