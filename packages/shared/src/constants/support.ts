/** The first people to route to an artist. Later joiners do not take a slot if someone leaves. */
export const FOUNDING_SUPPORTER_LIMIT = 10;

export function isFoundingSupporter(routesStartedBefore: number): boolean {
  return routesStartedBefore < FOUNDING_SUPPORTER_LIMIT;
}
