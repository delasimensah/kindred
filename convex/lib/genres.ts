/** Keep in lockstep with packages/shared/src/constants/genres.ts */
export const GENRES = [
  "Afrobeats",
  "Amapiano",
  "Highlife",
  "Alté",
  "Afro-soul and R&B",
  "Afro-house",
  "Hip-hop and Drill",
  "Gospel",
  "Bongo Flava",
  "Francophone Afropop",
  "Reggae and Dancehall",
  "Jazz and Instrumental",
] as const;

export const ONBOARDING_MIN_GENRES = 1;
export const ONBOARDING_MIN_FOLLOWS = 2;

const GENRE_SET = new Set<string>(GENRES);

export function hasUnknownGenre(genres: string[]): boolean {
  return genres.some((genre) => !GENRE_SET.has(genre));
}
