/** Share of each plan that goes into the artist pool after the store fee. */
export const ARTIST_POOL_RATIO = 0.7;

/** Store fee stand-in taken before the artist pool splits. */
export const STORE_FEE_RATIO = 0.3;

export const TIER_CENTS = {
  "4.99": 499,
  "9.99": 999,
} as const;

export type PriceTier = keyof typeof TIER_CENTS;

/** Max fans returned by the thank-you shortlist. */
export const THANK_YOU_SHORTLIST = 12;

export function periodKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function previousPeriodKey(date: Date = new Date()): string {
  const prior = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1)
  );
  return periodKey(prior);
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function artistShareCents(
  tierCents: number,
  routedCount: number
): number {
  if (routedCount <= 0) {
    return 0;
  }
  const pool = Math.floor(tierCents * ARTIST_POOL_RATIO);
  return Math.floor(pool / routedCount);
}

/** One artist's slice of the full subscription for a month already on record. */
export function recordedShareCents(
  tierCents: number,
  routedCount: number
): number {
  if (routedCount <= 0 || tierCents <= 0) {
    return 0;
  }
  return Math.floor(tierCents / routedCount);
}

/** Whole-subscription share shown on Impact. One artist is 100. Three artists are 33. */
export function equalSharePercent(count: number): number {
  if (count <= 0) {
    return 0;
  }
  return Math.floor(100 / count);
}

/**
 * Split a subscription into equal cents that still add up to the price.
 * The earliest artists get any leftover cent.
 */
export function equalSplitCents(totalCents: number, count: number): number[] {
  if (count <= 0 || totalCents <= 0) {
    return [];
  }
  const base = Math.floor(totalCents / count);
  let remainder = totalCents - base * count;
  return Array.from({ length: count }, () => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return base + extra;
  });
}
