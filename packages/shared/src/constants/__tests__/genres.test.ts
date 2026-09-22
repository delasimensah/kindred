import {
  GENRE_ACCENTS,
  GENRES,
  isGenre,
  ONBOARDING_MIN_FOLLOWS,
  ONBOARDING_MIN_GENRES,
} from "../genres";

describe("onboarding genres", () => {
  it("locks the twelve genre names and onboarding minimums", () => {
    expect(GENRES).toHaveLength(12);
    expect(GENRES[0]).toBe("Afrobeats");
    expect(isGenre("Afrobeats")).toBe(true);
    expect(isGenre("Rock")).toBe(false);
    expect(ONBOARDING_MIN_GENRES).toBe(1);
    expect(ONBOARDING_MIN_FOLLOWS).toBe(2);
    expect(Object.keys(GENRE_ACCENTS)).toHaveLength(GENRES.length);
  });
});
