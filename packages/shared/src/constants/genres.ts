/**
 * Fixed onboarding genre list (system design). Not a table.
 */
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

export type Genre = (typeof GENRES)[number];

/** KIND-44: Continue on genres enables at one pick. */
export const ONBOARDING_MIN_GENRES = 1;

/** KIND-44: Continue on follows enables at two artists. */
export const ONBOARDING_MIN_FOLLOWS = 2;

export function isGenre(value: string): value is Genre {
  return (GENRES as readonly string[]).includes(value);
}

/**
 * Onboarding tile tints. Not brand chrome — each genre gets its own wash.
 * `wash` is unselected fill, `washSelected` is selected fill, `ink` is icon/label.
 */
export const GENRE_ACCENTS: Record<
  Genre,
  { ink: string; wash: string; washSelected: string }
> = {
  Afrobeats: { ink: "#FF8A5B", wash: "#FF7A4599", washSelected: "#FF7A45CC" },
  Amapiano: { ink: "#D4F07A", wash: "#C5E06399", washSelected: "#C5E063CC" },
  Highlife: { ink: "#FFE08A", wash: "#FFD36999", washSelected: "#FFD369CC" },
  Alté: { ink: "#DDD0FF", wash: "#C4B5FD99", washSelected: "#C4B5FDCC" },
  "Afro-soul and R&B": {
    ink: "#FBCFE8",
    wash: "#F9A8D499",
    washSelected: "#F9A8D4CC",
  },
  "Afro-house": {
    ink: "#5EEAD4",
    wash: "#2DD4BF99",
    washSelected: "#2DD4BFCC",
  },
  "Hip-hop and Drill": {
    ink: "#FDA4AF",
    wash: "#FB718599",
    washSelected: "#FB7185CC",
  },
  Gospel: { ink: "#BAE6FD", wash: "#7DD3FC99", washSelected: "#7DD3FCCC" },
  "Bongo Flava": {
    ink: "#FDE68A",
    wash: "#FBBF2499",
    washSelected: "#FBBF24CC",
  },
  "Francophone Afropop": {
    ink: "#93C5FD",
    wash: "#60A5FA99",
    washSelected: "#60A5FACC",
  },
  "Reggae and Dancehall": {
    ink: "#86EFAC",
    wash: "#4ADE8099",
    washSelected: "#4ADE80CC",
  },
  "Jazz and Instrumental": {
    ink: "#C7D2FE",
    wash: "#A5B4FC99",
    washSelected: "#A5B4FCCC",
  },
};
